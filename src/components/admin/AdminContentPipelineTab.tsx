import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { ChevronRight, RefreshCw, Check, X, Trash2, Plus, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// content_sources / content_pipeline_runs e as colunas novas de blog_posts
// (status, author_kind, sources) ainda não estão no types.ts gerado —
// por isso os casts para `any` aqui, no mesmo padrão já usado no resto do admin.
const db = supabase as any;

interface PendingPost {
  id: string;
  title: string;
  subtitle: string | null;
  excerpt: string;
  content_md: string;
  category: string;
  author_kind: 'jefferson' | 'curadoria' | null;
  status: string;
  date: string;
  sources: { name: string; title?: string; url: string; quote?: string }[] | null;
  faq: { q: string; a: string }[] | null;
}

interface Source {
  id: string;
  name: string;
  kind: 'rss' | 'youtube';
  url: string;
  person_name: string | null;
  person_title: string | null;
  active: boolean;
  last_fetch_status: string | null;
  last_fetch_at: string | null;
}

const usePendingPosts = () =>
  useQuery<PendingPost[]>({
    queryKey: ['pipeline_pending_posts'],
    queryFn: async () => {
      const { data, error } = await db
        .from('blog_posts')
        .select('id, title, subtitle, excerpt, content_md, category, author_kind, status, date, sources, faq')
        .in('status', ['pending_review', 'approved'])
        .not('author_kind', 'is', null)
        .order('date', { ascending: false });
      if (error) throw error;
      return data as PendingPost[];
    },
  });

const useContentSources = () =>
  useQuery<Source[]>({
    queryKey: ['content_sources'],
    queryFn: async () => {
      const { data, error } = await db.from('content_sources').select('*').order('name');
      if (error) throw error;
      return data as Source[];
    },
  });

const useLatestRun = () =>
  useQuery({
    queryKey: ['pipeline_latest_run'],
    queryFn: async () => {
      const { data, error } = await db
        .from('content_pipeline_runs')
        .select('*')
        .order('run_date', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

const AUTHOR_LABEL: Record<string, string> = {
  jefferson: 'Artigo autoral',
  curadoria: 'Vozes que Importam',
};

const AdminContentPipelineTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: pending = [], isLoading: loadingPosts } = usePendingPosts();
  const { data: sources = [] } = useContentSources();
  const { data: latestRun } = useLatestRun();
  const [running, setRunning] = useState<'fetch' | 'publish' | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});
  const [newSource, setNewSource] = useState({ name: '', kind: 'rss' as 'rss' | 'youtube', url: '', person_name: '', person_title: '' });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['pipeline_pending_posts'] });
    queryClient.invalidateQueries({ queryKey: ['pipeline_latest_run'] });
  };

  const runNow = async (fn: 'content-pipeline-fetch' | 'content-pipeline-publish') => {
    setRunning(fn === 'content-pipeline-fetch' ? 'fetch' : 'publish');
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Sessão expirada. Saia e entre novamente no admin antes de rodar o pipeline.');
      }
      const { data, error } = await supabase.functions.invoke(fn);
      if (error) {
        // FunctionsHttpError esconde a mensagem real no corpo da resposta
        let detail = error.message;
        const ctx = (error as { context?: Response }).context;
        if (ctx && typeof ctx.text === 'function') {
          const body = await ctx.text().catch(() => '');
          if (body) {
            try {
              const parsed = JSON.parse(body);
              detail = parsed.error || parsed.message || body;
            } catch {
              detail = body;
            }
          }
        }
        throw new Error(detail);
      }
      const summary =
        data && typeof data === 'object' && 'skipped' in (data as Record<string, unknown>)
          ? `Nada a fazer: ${(data as { reason?: string }).reason ?? 'sem pendências'}`
          : JSON.stringify(data);
      toast({ title: 'Executado', description: summary });
      invalidateAll();
    } catch (error) {
      toast({
        title: 'Falhou',
        description: error instanceof Error ? error.message : String(error),
        variant: 'destructive',
      });
    } finally {
      setRunning(null);
    }

  };

  const approve = async (post: PendingPost) => {
    const edited = editing[post.id];
    const update: Record<string, unknown> = { status: 'approved' };
    if (edited !== undefined && edited !== post.content_md) update.content_md = edited;
    const { error } = await db.from('blog_posts').update(update).eq('id', post.id);
    if (error) {
      toast({ title: 'Erro ao aprovar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Aprovado', description: 'Vai ao ar às 10h (ou já, se passou do horário e você rodar a publicação manualmente).' });
    invalidateAll();
  };

  const reject = async (post: PendingPost) => {
    const { error } = await db.from('blog_posts').update({ status: 'rejected', active: false }).eq('id', post.id);
    if (error) {
      toast({ title: 'Erro ao rejeitar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: 'Rejeitado', description: 'Não vai ser publicado.' });
    invalidateAll();
  };

  const addSource = async () => {
    if (!newSource.name.trim() || !newSource.url.trim()) {
      toast({ title: 'Preencha nome e URL', variant: 'destructive' });
      return;
    }
    const { error } = await db.from('content_sources').insert({
      name: newSource.name.trim(),
      kind: newSource.kind,
      url: newSource.url.trim(),
      person_name: newSource.person_name.trim() || null,
      person_title: newSource.person_title.trim() || null,
    });
    if (error) {
      toast({ title: 'Erro ao adicionar fonte', description: error.message, variant: 'destructive' });
      return;
    }
    setNewSource({ name: '', kind: 'rss', url: '', person_name: '', person_title: '' });
    queryClient.invalidateQueries({ queryKey: ['content_sources'] });
  };

  const toggleSource = async (source: Source) => {
    await db.from('content_sources').update({ active: !source.active }).eq('id', source.id);
    queryClient.invalidateQueries({ queryKey: ['content_sources'] });
  };

  const deleteSource = async (source: Source) => {
    await db.from('content_sources').delete().eq('id', source.id);
    queryClient.invalidateQueries({ queryKey: ['content_sources'] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Pipeline diário — Blog</CardTitle>
          <CardDescription>
            Todo dia às 7h (Brasília) o pipeline busca as fontes ativas abaixo e gera dois rascunhos: a coluna
            "Vozes que Importam" e o artigo autoral. Nada vai ao ar sem sua aprovação aqui. Às 10h, o que estiver
            aprovado é publicado automaticamente no blog.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap items-center gap-3">
          <Button onClick={() => runNow('content-pipeline-fetch')} disabled={running !== null} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${running === 'fetch' ? 'animate-spin' : ''}`} />
            Rodar busca + rascunhos agora
          </Button>
          <Button onClick={() => runNow('content-pipeline-publish')} disabled={running !== null} variant="outline">
            <Send className={`w-4 h-4 mr-2 ${running === 'publish' ? 'animate-spin' : ''}`} />
            Publicar aprovados agora
          </Button>
          {latestRun && (
            <Badge variant="secondary">
              Última execução: {latestRun.run_date} — {latestRun.status}
              {latestRun.error_message ? ` (${latestRun.error_message})` : ''}
            </Badge>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Aguardando revisão</CardTitle>
          <CardDescription>Edite direto no rascunho se precisar, depois aprove ou rejeite.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loadingPosts && <p className="text-muted-foreground">Carregando...</p>}
          {!loadingPosts && pending.length === 0 && (
            <p className="text-muted-foreground">Nada esperando revisão no momento.</p>
          )}
          {pending.map((post) => (
            <Card key={post.id} className="border-primary/30">
              <CardHeader className="pb-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <Badge variant={post.status === 'approved' ? 'default' : 'secondary'} className="mb-2">
                      {post.status === 'approved' ? 'Aprovado — aguardando 10h' : 'Pendente'} · {AUTHOR_LABEL[post.author_kind || ''] || post.author_kind}
                    </Badge>
                    <CardTitle className="text-lg">{post.title}</CardTitle>
                    {post.subtitle && <CardDescription>{post.subtitle}</CardDescription>}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => approve(post)} disabled={post.status === 'approved'}>
                      <Check className="w-4 h-4 mr-1" /> Aprovar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => reject(post)}>
                      <X className="w-4 h-4 mr-1" /> Rejeitar
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {post.sources && post.sources.length > 0 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <Label className="text-xs uppercase tracking-wider">Fontes citadas</Label>
                    <ul className="list-disc list-inside">
                      {post.sources.map((s, i) => (
                        <li key={i}>
                          <a href={s.url} target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">
                            {s.name}{s.title ? ` — ${s.title}` : ''}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {post.faq && post.faq.length > 0 && (
                  <div className="text-sm text-muted-foreground space-y-1">
                    <Label className="text-xs uppercase tracking-wider">FAQ (schema FAQPage)</Label>
                    <ul className="list-disc list-inside">
                      {post.faq.map((f, i) => (
                        <li key={i}><span className="text-foreground">{f.q}</span> — {f.a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                <Label className="text-xs uppercase tracking-wider">Conteúdo (markdown, editável)</Label>
                <Textarea
                  value={editing[post.id] ?? post.content_md}
                  onChange={(e) => setEditing((prev) => ({ ...prev, [post.id]: e.target.value }))}
                  rows={12}
                  className="font-mono text-sm"
                />
              </CardContent>
            </Card>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fontes monitoradas</CardTitle>
          <CardDescription>
            Só fontes oficiais (RSS de blog/imprensa ou feed público de vídeos do YouTube) — nunca scraping de
            LinkedIn/X, que viola os termos de uso das duas plataformas.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Pessoa/Empresa</TableHead>
                <TableHead>Última busca</TableHead>
                <TableHead>Ativa</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.id}>
                  <TableCell className="font-medium">
                    <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:text-primary underline-offset-2 hover:underline">
                      {source.name}
                    </a>
                  </TableCell>
                  <TableCell>{source.kind}</TableCell>
                  <TableCell>{source.person_name || source.person_title || '—'}</TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {source.last_fetch_status || 'nunca'}
                  </TableCell>
                  <TableCell>
                    <Switch checked={source.active} onCheckedChange={() => toggleSource(source)} />
                  </TableCell>
                  <TableCell>
                    <Button size="icon" variant="ghost" onClick={() => deleteSource(source)}>
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <div className="grid md:grid-cols-5 gap-2 items-end pt-4 border-t border-border">
            <div className="space-y-1">
              <Label className="text-xs">Nome</Label>
              <Input value={newSource.name} onChange={(e) => setNewSource((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Tipo</Label>
              <Select value={newSource.kind} onValueChange={(v: 'rss' | 'youtube') => setNewSource((p) => ({ ...p, kind: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="rss">RSS (blog/imprensa)</SelectItem>
                  <SelectItem value="youtube">YouTube (feed de vídeos)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">URL do feed</Label>
              <Input
                value={newSource.url}
                onChange={(e) => setNewSource((p) => ({ ...p, url: e.target.value }))}
                placeholder={newSource.kind === 'youtube' ? 'https://www.youtube.com/feeds/videos.xml?channel_id=...' : 'https://exemplo.com/feed'}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Pessoa (opcional)</Label>
              <Input value={newSource.person_name} onChange={(e) => setNewSource((p) => ({ ...p, person_name: e.target.value }))} />
            </div>
            <Button onClick={addSource}>
              <Plus className="w-4 h-4 mr-1" /> Adicionar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminContentPipelineTab;
