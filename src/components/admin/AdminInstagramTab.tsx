import { useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { RefreshCw, Check, X, Trash2, Plus, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { CreativeCanvas, type CreativeCanvasHandle, type CreativeFormat } from './instagram/CreativeCanvas';

// instagram_runs / instagram_creatives / instagram_trend_sources ainda não estão no
// types.ts gerado (depende da migration ser aplicada no projeto certo) — mesmo padrão
// de cast usado em AdminContentPipelineTab.tsx até os tipos serem regenerados.
const db = supabase as any;

interface RunRow {
  id: string;
  run_date: string;
  status: 'researching' | 'drafting' | 'pending_review' | 'failed';
  topic_title: string | null;
  topic_summary: string | null;
  error_message: string | null;
}

interface SlideJson {
  order: number;
  headline: string;
  body: string;
  image_url: string | null;
  image_prompt?: string;
}

interface CreativeRow {
  id: string;
  run_id: string;
  format: CreativeFormat;
  caption: string | null;
  hashtags: string[];
  slides: SlideJson[];
  status: 'pending_review' | 'approved' | 'rejected';
  final_image_urls: string[];
}

interface TrendSource {
  id: string;
  name: string;
  url: string;
  active: boolean;
  last_fetch_status: string | null;
  last_fetch_at: string | null;
}

const FORMAT_LABEL: Record<CreativeFormat, string> = { card: 'Card', carousel: 'Carrossel', story: 'Story' };
const STATUS_LABEL: Record<RunRow['status'], string> = {
  researching: 'Pesquisando',
  drafting: 'Escrevendo',
  pending_review: 'Aguardando revisão',
  failed: 'Falhou',
};

const useRuns = () =>
  useQuery<RunRow[]>({
    queryKey: ['instagram_runs'],
    queryFn: async () => {
      const { data, error } = await db
        .from('instagram_runs')
        .select('id, run_date, status, topic_title, topic_summary, error_message')
        .order('run_date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(8);
      if (error) throw error;
      return data as RunRow[];
    },
  });

const useCreatives = (runIds: string[]) =>
  useQuery<CreativeRow[]>({
    queryKey: ['instagram_creatives', runIds],
    enabled: runIds.length > 0,
    queryFn: async () => {
      const { data, error } = await db.from('instagram_creatives').select('*').in('run_id', runIds);
      if (error) throw error;
      return data as CreativeRow[];
    },
  });

const useTrendSources = () =>
  useQuery<TrendSource[]>({
    queryKey: ['instagram_trend_sources'],
    queryFn: async () => {
      const { data, error } = await db.from('instagram_trend_sources').select('*').order('name');
      if (error) throw error;
      return data as TrendSource[];
    },
  });

/** Revisão de um formato (card/carrossel/story): preview via canvas, edição de texto, aprovar/rejeitar/baixar. */
const CreativeReviewCard = ({ creative, onChanged }: { creative: CreativeRow; onChanged: () => void }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [slides, setSlides] = useState<SlideJson[]>(creative.slides);
  const [caption, setCaption] = useState(creative.caption || '');
  const [hashtagsText, setHashtagsText] = useState((creative.hashtags || []).join(', '));
  const [saving, setSaving] = useState(false);
  const canvasRefs = useRef<(CreativeCanvasHandle | null)[]>([]);

  const updateSlide = (index: number, patch: Partial<SlideJson>) => {
    setSlides((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  };

  const approve = async () => {
    setSaving(true);
    try {
      const finalUrls: string[] = [];
      for (let i = 0; i < slides.length; i++) {
        const handle = canvasRefs.current[i];
        if (!handle) continue;
        const blob = await handle.exportPng();
        const path = `${creative.run_id}/final/${creative.format}-${slides[i].order}.png`;
        const { error: upErr } = await supabase.storage
          .from('instagram-creatives')
          .upload(path, blob, { upsert: true, contentType: 'image/png' });
        if (upErr) throw upErr;
        const { data: pub } = supabase.storage.from('instagram-creatives').getPublicUrl(path);
        finalUrls.push(pub.publicUrl);
      }
      const hashtags = hashtagsText
        .split(',')
        .map((h) => h.trim().replace(/^#/, ''))
        .filter(Boolean);
      const { error } = await db
        .from('instagram_creatives')
        .update({
          slides,
          caption,
          hashtags,
          status: 'approved',
          final_image_urls: finalUrls,
          reviewed_by: user?.id || null,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', creative.id);
      if (error) throw error;
      toast({ title: `${FORMAT_LABEL[creative.format]} aprovado`, description: 'Imagens finais prontas para baixar.' });
      onChanged();
    } catch (error) {
      toast({ title: 'Erro ao aprovar', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const reject = async () => {
    const { error } = await db.from('instagram_creatives').update({ status: 'rejected' }).eq('id', creative.id);
    if (error) {
      toast({ title: 'Erro ao rejeitar', description: error.message, variant: 'destructive' });
      return;
    }
    toast({ title: `${FORMAT_LABEL[creative.format]} rejeitado` });
    onChanged();
  };

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">{FORMAT_LABEL[creative.format]}</CardTitle>
          <Badge variant={creative.status === 'approved' ? 'default' : creative.status === 'rejected' ? 'outline' : 'secondary'}>
            {creative.status === 'approved' ? 'Aprovado' : creative.status === 'rejected' ? 'Rejeitado' : 'Pendente'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 flex-1">
        <div className="flex gap-3 overflow-x-auto pb-2">
          {slides.map((slide, i) => (
            <div key={i} className="shrink-0 w-56 space-y-2">
              <CreativeCanvas
                ref={(el) => (canvasRefs.current[i] = el)}
                format={creative.format}
                slide={slide}
                slideLabel={slides.length > 1 ? `${i + 1}/${slides.length}` : undefined}
              />
              <Input
                value={slide.headline}
                onChange={(e) => updateSlide(i, { headline: e.target.value })}
                placeholder="Headline"
                className="text-xs h-8"
              />
              <Textarea
                value={slide.body}
                onChange={(e) => updateSlide(i, { body: e.target.value })}
                placeholder="Texto de apoio"
                rows={2}
                className="text-xs"
              />
            </div>
          ))}
        </div>

        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider">Legenda</Label>
          <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} rows={3} className="text-sm" />
        </div>
        <div className="space-y-1">
          <Label className="text-xs uppercase tracking-wider">Hashtags (separadas por vírgula)</Label>
          <Input value={hashtagsText} onChange={(e) => setHashtagsText(e.target.value)} className="text-sm" />
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Button size="sm" onClick={approve} disabled={saving || creative.status === 'approved'}>
            <Check className="w-4 h-4 mr-1" /> Aprovar
          </Button>
          <Button size="sm" variant="outline" onClick={reject} disabled={saving || creative.status === 'rejected'}>
            <X className="w-4 h-4 mr-1" /> Rejeitar
          </Button>
          {creative.status === 'approved' &&
            creative.final_image_urls.map((url, i) => (
              <Button key={url} size="sm" variant="secondary" asChild>
                <a href={url} download={`${creative.format}-${i + 1}.png`} target="_blank" rel="noopener noreferrer">
                  <Download className="w-4 h-4 mr-1" /> Baixar {slides.length > 1 ? `#${i + 1}` : ''}
                </a>
              </Button>
            ))}
        </div>
      </CardContent>
    </Card>
  );
};

const AdminInstagramTab = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: runs = [], isLoading: loadingRuns } = useRuns();
  const runIds = runs.map((r) => r.id);
  const { data: creatives = [] } = useCreatives(runIds);
  const { data: sources = [] } = useTrendSources();
  const [generating, setGenerating] = useState(false);
  const [newSource, setNewSource] = useState({ name: '', url: '' });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['instagram_runs'] });
    queryClient.invalidateQueries({ queryKey: ['instagram_creatives'] });
  };

  const generate = async () => {
    setGenerating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) {
        throw new Error('Sessão expirada. Saia e entre novamente no admin antes de gerar conteúdo.');
      }
      const { data, error } = await supabase.functions.invoke('instagram-content-fetch');
      if (error) {
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
      toast({ title: 'Conteúdo gerado', description: (data as { topicTitle?: string })?.topicTitle || 'Pronto para revisão.' });
      invalidateAll();
    } catch (error) {
      toast({ title: 'Falhou', description: error instanceof Error ? error.message : String(error), variant: 'destructive' });
    } finally {
      setGenerating(false);
    }
  };

  const addSource = async () => {
    if (!newSource.name.trim() || !newSource.url.trim()) {
      toast({ title: 'Preencha nome e URL', variant: 'destructive' });
      return;
    }
    const { error } = await db.from('instagram_trend_sources').insert({ name: newSource.name.trim(), url: newSource.url.trim() });
    if (error) {
      toast({ title: 'Erro ao adicionar fonte', description: error.message, variant: 'destructive' });
      return;
    }
    setNewSource({ name: '', url: '' });
    queryClient.invalidateQueries({ queryKey: ['instagram_trend_sources'] });
  };

  const toggleSource = async (source: TrendSource) => {
    await db.from('instagram_trend_sources').update({ active: !source.active }).eq('id', source.id);
    queryClient.invalidateQueries({ queryKey: ['instagram_trend_sources'] });
  };

  const deleteSource = async (source: TrendSource) => {
    await db.from('instagram_trend_sources').delete().eq('id', source.id);
    queryClient.invalidateQueries({ queryKey: ['instagram_trend_sources'] });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerador de Conteúdo — Instagram</CardTitle>
          <CardDescription>
            Pesquisa o tema de IA/marketing mais comentado do dia e gera Card, Carrossel e Story. Nada é publicado
            sozinho — revise, edite o texto, aprove e baixe as imagens para postar manualmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generate} disabled={generating} variant="outline">
            <RefreshCw className={`w-4 h-4 mr-2 ${generating ? 'animate-spin' : ''}`} />
            Gerar novo conteúdo agora
          </Button>
        </CardContent>
      </Card>

      {loadingRuns && <p className="text-muted-foreground">Carregando...</p>}
      {!loadingRuns && runs.length === 0 && <p className="text-muted-foreground">Nenhum conteúdo gerado ainda.</p>}

      {runs.map((run) => {
        const runCreatives = creatives.filter((c) => c.run_id === run.id);
        return (
          <Card key={run.id}>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <CardTitle className="text-lg">{run.topic_title || `Rodada de ${run.run_date}`}</CardTitle>
                <Badge variant={run.status === 'failed' ? 'destructive' : run.status === 'pending_review' ? 'secondary' : 'outline'}>
                  {STATUS_LABEL[run.status]}
                </Badge>
              </div>
              {run.topic_summary && <CardDescription>{run.topic_summary}</CardDescription>}
              {run.error_message && <CardDescription className="text-destructive">{run.error_message}</CardDescription>}
            </CardHeader>
            {runCreatives.length > 0 && (
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {runCreatives.map((creative) => (
                    <CreativeReviewCard key={creative.id} creative={creative} onChanged={invalidateAll} />
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}

      <Card>
        <CardHeader>
          <CardTitle>Fontes de tendência</CardTitle>
          <CardDescription>RSS de IA e marketing usados para detectar o tema do dia (combinado com o Hacker News).</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
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
                  <TableCell className="text-xs text-muted-foreground">{source.last_fetch_status || 'nunca'}</TableCell>
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

          <div className="grid md:grid-cols-3 gap-2 items-end pt-4 border-t border-border">
            <div className="space-y-1">
              <Label className="text-xs">Nome</Label>
              <Input value={newSource.name} onChange={(e) => setNewSource((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">URL do feed RSS</Label>
              <Input value={newSource.url} onChange={(e) => setNewSource((p) => ({ ...p, url: e.target.value }))} placeholder="https://exemplo.com/feed" />
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

export default AdminInstagramTab;
