import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Copy, Upload, ArrowLeft, Loader2 } from 'lucide-react';
import {
  type VideoProject, type VideoProjectConfig, type TemplateTipo, type Paleta, type TransicaoTipo,
  PALETAS, TEMPLATE_LABELS, criarConfigPadrao,
} from '@/types/videoEditor';
import { VideoStagePreview } from './video-editor/VideoStagePreview';
import { CoverPreview } from './video-editor/CoverPreview';

// video_projects ainda não está no types.ts gerado — mesmo padrão de cast
// já usado em outras abas do admin (ex.: AdminProductsCasesTab).
const db = supabase as any;

const FONT_LINK = "https://fonts.googleapis.com/css2?family=DM+Sans:wght@800;900&family=Inter:wght@400;600&family=Fira+Code:wght@400;500&display=swap";

const AdminVideoEditorTab = () => {
  const { toast } = useToast();
  const [projetos, setProjetos] = useState<VideoProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [selecionadoId, setSelecionadoId] = useState<string | null>(null);
  const [config, setConfig] = useState<VideoProjectConfig | null>(null);
  const [titulo, setTitulo] = useState('');
  const [template, setTemplate] = useState<TemplateTipo>('card_dados');
  const [salvando, setSalvando] = useState(false);
  const [enviando, setEnviando] = useState<string | null>(null);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await db.from('video_projects').select('*').order('updated_at', { ascending: false });
    if (error) toast({ title: 'Erro ao carregar projetos', description: error.message, variant: 'destructive' });
    else setProjetos((data ?? []) as VideoProject[]);
    setLoading(false);
  };

  useEffect(() => { carregar(); }, []);

  const selecionado = projetos.find((p) => p.id === selecionadoId) ?? null;

  const abrir = (p: VideoProject) => {
    setSelecionadoId(p.id);
    setTitulo(p.title);
    setTemplate(p.template);
    setConfig(p.config);
  };

  const voltar = () => {
    setSelecionadoId(null);
    setConfig(null);
  };

  const criar = async (tpl: TemplateTipo) => {
    const { data, error } = await db.from('video_projects').insert({
      title: 'Novo vídeo',
      template: tpl,
      config: criarConfigPadrao(tpl),
    }).select().single();
    if (error) { toast({ title: 'Erro ao criar projeto', description: error.message, variant: 'destructive' }); return; }
    setProjetos((prev) => [data as VideoProject, ...prev]);
    abrir(data as VideoProject);
  };

  const duplicar = async (p: VideoProject) => {
    const { data, error } = await db.from('video_projects').insert({
      title: `${p.title} (cópia)`,
      template: p.template,
      config: p.config,
      cover_url: p.cover_url,
    }).select().single();
    if (error) { toast({ title: 'Erro ao duplicar', description: error.message, variant: 'destructive' }); return; }
    setProjetos((prev) => [data as VideoProject, ...prev]);
    toast({ title: 'Projeto duplicado' });
  };

  const excluir = async (id: string) => {
    if (!confirm('Excluir este projeto de vídeo? Essa ação não pode ser desfeita.')) return;
    const { error } = await db.from('video_projects').delete().eq('id', id);
    if (error) { toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' }); return; }
    setProjetos((prev) => prev.filter((p) => p.id !== id));
    if (selecionadoId === id) voltar();
    toast({ title: 'Projeto excluído' });
  };

  const salvar = async () => {
    if (!selecionadoId || !config) return;
    setSalvando(true);
    const { error } = await db.from('video_projects')
      .update({ title: titulo, template, config })
      .eq('id', selecionadoId);
    setSalvando(false);
    if (error) { toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' }); return; }
    setProjetos((prev) => prev.map((p) => (p.id === selecionadoId ? { ...p, title: titulo, template, config } : p)));
    toast({ title: 'Projeto salvo' });
  };

  const upload = async (file: File, campo: string, aplicar: (url: string) => void) => {
    setEnviando(campo);
    const ext = file.name.split('.').pop();
    const path = `${selecionadoId}/${campo}-${Date.now()}.${ext}`;
    const { error } = await db.storage.from('video-projects').upload(path, file, { upsert: true });
    setEnviando(null);
    if (error) { toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' }); return; }
    const { data } = db.storage.from('video-projects').getPublicUrl(path);
    aplicar(data.publicUrl);
  };

  const patchConfig = (patch: Partial<VideoProjectConfig>) => setConfig((c) => (c ? { ...c, ...patch } : c));
  const patchMoldura = (patch: Partial<VideoProjectConfig['moldura']>) =>
    setConfig((c) => (c ? { ...c, moldura: { ...c.moldura, ...patch } } : c));
  const patchCardDados = (patch: Partial<VideoProjectConfig['cardDados']>) =>
    setConfig((c) => (c ? { ...c, cardDados: { ...c.cardDados, ...patch } } : c));
  const patchLegenda = (patch: Partial<VideoProjectConfig['legenda']>) =>
    setConfig((c) => (c ? { ...c, legenda: { ...c.legenda, ...patch } } : c));
  const patchAssinatura = (patch: Partial<VideoProjectConfig['assinatura']>) =>
    setConfig((c) => (c ? { ...c, assinatura: { ...c.assinatura, ...patch } } : c));
  const patchCapa = (patch: Partial<VideoProjectConfig['capa']>) =>
    setConfig((c) => (c ? { ...c, capa: { ...c.capa, ...patch } } : c));

  if (loading) {
    return <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Carregando…</div>;
  }

  // ── LISTA DE PROJETOS ──────────────────────────────────────────────────
  if (!selecionado || !config) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">Editor de Vídeo</h2>
            <p className="text-sm text-muted-foreground">Reels e vídeos verticais no padrão visual do Carrossel Jefferson.</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" onClick={() => criar('card_dados')}><Plus className="mr-1 h-4 w-4" /> Card de dados</Button>
            <Button size="sm" variant="outline" onClick={() => criar('fundo_dinamico')}><Plus className="mr-1 h-4 w-4" /> Fundo dinâmico</Button>
          </div>
        </div>

        {projetos.length === 0 ? (
          <Card className="p-8 text-center text-sm text-muted-foreground">
            Nenhum vídeo ainda. Crie o primeiro escolhendo um template acima.
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {projetos.map((p) => (
              <Card key={p.id} className="p-4">
                <div className="mb-2 flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.title}</p>
                    <p className="text-xs text-muted-foreground">{TEMPLATE_LABELS[p.template].nome} · {p.status}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary" onClick={() => abrir(p)}>Editar</Button>
                  <Button size="sm" variant="ghost" onClick={() => duplicar(p)} title="Duplicar"><Copy className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => excluir(p.id)} title="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ── EDITOR DO PROJETO ──────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <link rel="stylesheet" href={FONT_LINK} />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={voltar}><ArrowLeft className="h-4 w-4" /></Button>
          <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} className="w-64 font-medium" />
        </div>
        <Button size="sm" onClick={salvar} disabled={salvando}>
          {salvando ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : null} Salvar
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <div className="flex flex-col items-center gap-4">
          <VideoStagePreview template={template} config={config} onMolduraChange={patchMoldura} />
          <div className="w-full max-w-[280px] border-t pt-3">
            <p className="mb-2 text-center text-xs font-medium text-muted-foreground">Capa</p>
            <CoverPreview config={config} />
          </div>
        </div>

        <Tabs defaultValue="template">
          <TabsList className="flex-wrap">
            <TabsTrigger value="template">Template</TabsTrigger>
            <TabsTrigger value="moldura">Moldura</TabsTrigger>
            <TabsTrigger value="fundo">Fundo</TabsTrigger>
            <TabsTrigger value="legenda">Legenda</TabsTrigger>
            <TabsTrigger value="assinatura">Assinatura</TabsTrigger>
            <TabsTrigger value="capa">Capa</TabsTrigger>
          </TabsList>

          {/* TEMPLATE */}
          <TabsContent value="template" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={template} onValueChange={(v) => setTemplate(v as TemplateTipo)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(TEMPLATE_LABELS).map(([id, t]) => (
                    <SelectItem key={id} value={id}>{t.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">{TEMPLATE_LABELS[template].desc}</p>
            </div>
            <div className="space-y-2">
              <Label>Paleta</Label>
              <div className="flex flex-wrap gap-2">
                {(Object.keys(PALETAS) as Paleta[]).map((id) => (
                  <button
                    key={id}
                    onClick={() => patchConfig({ paleta: id })}
                    className={`flex items-center gap-2 rounded-md border px-3 py-2 text-xs ${config.paleta === id ? 'border-primary' : 'border-border'}`}
                  >
                    <span className="h-3 w-3 rounded-full" style={{ background: PALETAS[id].accent }} />
                    {PALETAS[id].nome}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={config.mostrarZonasSeguras} onCheckedChange={(v) => patchConfig({ mostrarZonasSeguras: v })} />
              <Label className="cursor-pointer" onClick={() => patchConfig({ mostrarZonasSeguras: !config.mostrarZonasSeguras })}>
                Mostrar zonas seguras (área coberta pela interface do Reels/TikTok)
              </Label>
            </div>
          </TabsContent>

          {/* MOLDURA */}
          <TabsContent value="moldura" className="space-y-4 pt-4">
            <div>
              <Label className="mb-1 block text-xs uppercase text-muted-foreground">Gravação / foto de referência</Label>
              <input
                type="file" accept="image/*" id="up-moldura" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, 'moldura', (url) => patchMoldura({ mediaUrl: url })); }}
              />
              <Button size="sm" variant="outline" onClick={() => document.getElementById('up-moldura')?.click()} disabled={enviando === 'moldura'}>
                <Upload className="mr-1 h-4 w-4" /> {enviando === 'moldura' ? 'Enviando…' : 'Enviar imagem'}
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Tamanho ({config.moldura.larguraPct}%)</Label>
                <Slider value={[config.moldura.larguraPct]} min={20} max={60} step={1} onValueChange={([v]) => patchMoldura({ larguraPct: v })} />
              </div>
              <div>
                <Label className="text-xs">Zoom ({config.moldura.zoom}%)</Label>
                <Slider value={[config.moldura.zoom]} min={100} max={200} step={2} onValueChange={([v]) => patchMoldura({ zoom: v })} />
              </div>
              <div>
                <Label className="text-xs">Foco horizontal</Label>
                <Slider value={[config.moldura.focalX]} min={0} max={100} step={1} onValueChange={([v]) => patchMoldura({ focalX: v })} />
              </div>
              <div>
                <Label className="text-xs">Foco vertical</Label>
                <Slider value={[config.moldura.focalY]} min={0} max={100} step={1} onValueChange={([v]) => patchMoldura({ focalY: v })} />
              </div>
            </div>
          </TabsContent>

          {/* FUNDO — muda de conteúdo conforme o template, mas o value da aba
              fica sempre "fundo": trocar o value junto com o template deixava
              o Radix Tabs com o estado interno apontando pra uma aba que não
              existe mais (painel em branco até o usuário clicar em outra aba
              e voltar). */}
          <TabsContent value="fundo" className="space-y-4 pt-4">
            {template === 'card_dados' ? (
              <>
                <div>
                  <Label className="text-xs">Título</Label>
                  <Textarea rows={2} value={config.cardDados.titulo} onChange={(e) => patchCardDados({ titulo: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Subtítulo</Label>
                  <Input value={config.cardDados.subtitulo} onChange={(e) => patchCardDados({ subtitulo: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Fonte dos dados</Label>
                  <Input value={config.cardDados.fonte} onChange={(e) => patchCardDados({ fonte: e.target.value })} />
                </div>
                <div>
                  <Label className="mb-1 block text-xs uppercase text-muted-foreground">Gráfico / imagem do card</Label>
                  <input
                    type="file" accept="image/*" id="up-card" className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, 'card', (url) => patchCardDados({ imagemUrl: url })); }}
                  />
                  <Button size="sm" variant="outline" onClick={() => document.getElementById('up-card')?.click()} disabled={enviando === 'card'}>
                    <Upload className="mr-1 h-4 w-4" /> {enviando === 'card' ? 'Enviando…' : 'Enviar imagem'}
                  </Button>
                </div>
              </>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  Cada clipe troca no tempo indicado, com a transição escolhida. A pré-visualização mostra só o primeiro clipe por enquanto.
                </p>
                {config.fundoDinamico.clipes.map((clipe, i) => (
                <Card key={clipe.id} className="space-y-2 p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">Clipe {i + 1}</span>
                    {config.fundoDinamico.clipes.length > 1 && (
                      <Button size="sm" variant="ghost" onClick={() => patchConfig({
                        fundoDinamico: { clipes: config.fundoDinamico.clipes.filter((c) => c.id !== clipe.id) },
                      })}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    )}
                  </div>
                  <input
                    type="file" accept="image/*,video/*" id={`up-clipe-${clipe.id}`} className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0]; if (!f) return;
                      upload(f, `clipe-${clipe.id}`, (url) => patchConfig({
                        fundoDinamico: {
                          clipes: config.fundoDinamico.clipes.map((c) => (c.id === clipe.id ? { ...c, mediaUrl: url, tipo: f.type.startsWith('video') ? 'video' : 'imagem' } : c)),
                        },
                      }));
                    }}
                  />
                  <Button size="sm" variant="outline" onClick={() => document.getElementById(`up-clipe-${clipe.id}`)?.click()} disabled={enviando === `clipe-${clipe.id}`}>
                    <Upload className="mr-1 h-4 w-4" /> {enviando === `clipe-${clipe.id}` ? 'Enviando…' : (clipe.mediaUrl ? 'Trocar mídia' : 'Enviar mídia')}
                  </Button>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Duração (s)</Label>
                      <Input type="number" min={1} max={20} value={clipe.duracaoSegundos} onChange={(e) => patchConfig({
                        fundoDinamico: { clipes: config.fundoDinamico.clipes.map((c) => (c.id === clipe.id ? { ...c, duracaoSegundos: Number(e.target.value) } : c)) },
                      })} />
                    </div>
                    <div>
                      <Label className="text-xs">Transição</Label>
                      <Select value={clipe.transicao} onValueChange={(v) => patchConfig({
                        fundoDinamico: { clipes: config.fundoDinamico.clipes.map((c) => (c.id === clipe.id ? { ...c, transicao: v as TransicaoTipo } : c)) },
                      })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="corte">Corte seco</SelectItem>
                          <SelectItem value="fusao">Fusão</SelectItem>
                          <SelectItem value="arrasto">Arrasto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </Card>
                ))}
                <Button size="sm" variant="outline" onClick={() => patchConfig({
                  fundoDinamico: { clipes: [...config.fundoDinamico.clipes, { id: crypto.randomUUID(), mediaUrl: null, tipo: 'imagem', duracaoSegundos: 4, transicao: 'fusao' }] },
                })}><Plus className="mr-1 h-4 w-4" /> Adicionar clipe</Button>
              </div>
            )}
          </TabsContent>

          {/* LEGENDA */}
          <TabsContent value="legenda" className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Switch checked={config.legenda.ativa} onCheckedChange={(v) => patchLegenda({ ativa: v })} />
              <Label>Legenda automática ativa</Label>
            </div>
            <p className="text-xs text-muted-foreground">
              A transcrição real da fala e a sincronização palavra a palavra entram na próxima etapa (precisa de um serviço de transcrição).
              Por enquanto, ajuste aqui como o texto de exemplo aparece.
            </p>
            <div>
              <Label className="text-xs">Texto de exemplo</Label>
              <Textarea rows={2} value={config.legenda.textoExemplo} onChange={(e) => patchLegenda({ textoExemplo: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Palavra em destaque</Label>
              <Input value={config.legenda.palavraDestaque} onChange={(e) => patchLegenda({ palavraDestaque: e.target.value })} />
            </div>
          </TabsContent>

          {/* ASSINATURA */}
          <TabsContent value="assinatura" className="space-y-4 pt-4">
            <div className="flex items-center gap-2">
              <Switch checked={config.assinatura.ativa} onCheckedChange={(v) => patchAssinatura({ ativa: v })} />
              <Label>Assinatura animada no encerramento</Label>
            </div>
            <div className="space-y-2">
              <Label className="text-xs">Origem</Label>
              <Select value={config.assinatura.modo} onValueChange={(v) => patchAssinatura({ modo: v as VideoProjectConfig['assinatura']['modo'] })}>
                <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="template">Template (gerada a partir da marca)</SelectItem>
                  <SelectItem value="arquivo">Arquivo próprio (SVG/PNG da assinatura)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {config.assinatura.modo === 'arquivo' && (
              <div>
                <input
                  type="file" accept="image/*" id="up-assinatura" className="hidden"
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, 'assinatura', (url) => patchAssinatura({ arquivoUrl: url })); }}
                />
                <Button size="sm" variant="outline" onClick={() => document.getElementById('up-assinatura')?.click()} disabled={enviando === 'assinatura'}>
                  <Upload className="mr-1 h-4 w-4" /> {enviando === 'assinatura' ? 'Enviando…' : 'Enviar assinatura'}
                </Button>
                {config.assinatura.arquivoUrl && (
                  <img src={config.assinatura.arquivoUrl} alt="assinatura" className="mt-2 h-16 rounded border bg-black/80 p-2" />
                )}
              </div>
            )}
          </TabsContent>

          {/* CAPA */}
          <TabsContent value="capa" className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="text-xs">Badge</Label>
                <Input value={config.capa.badge} onChange={(e) => patchCapa({ badge: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">@handle</Label>
                <Input value={config.capa.handle} onChange={(e) => patchCapa({ handle: e.target.value })} />
              </div>
            </div>
            <div>
              <Label className="text-xs">Título da capa</Label>
              <Textarea rows={2} value={config.capa.titulo} onChange={(e) => patchCapa({ titulo: e.target.value })} />
            </div>
            <div>
              <Label className="mb-1 block text-xs uppercase text-muted-foreground">Imagem de fundo da capa</Label>
              <input
                type="file" accept="image/*" id="up-capa" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f, 'capa', (url) => patchCapa({ imagemUrl: url })); }}
              />
              <Button size="sm" variant="outline" onClick={() => document.getElementById('up-capa')?.click()} disabled={enviando === 'capa'}>
                <Upload className="mr-1 h-4 w-4" /> {enviando === 'capa' ? 'Enviando…' : 'Enviar imagem'}
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminVideoEditorTab;
