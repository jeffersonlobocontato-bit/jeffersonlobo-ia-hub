import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  ArrowRight, ArrowLeft, Check, SkipForward, ExternalLink, MessageCircle,
  Loader2, X, Upload, Trash2,
} from 'lucide-react';
import { PressRichEditor } from './PressRichEditor';
import { CampaignMediaUploader, type MediaTipo } from './CampaignMediaUploader';
import { PressImportDialog } from './PressImportDialog';
import { fetchContactsForLists, usePressLists } from '@/hooks/usePressLists';
import {
  type PressContact, composeWhatsAppMessage, htmlToWhatsAppMarkdown,
  buildWhatsappDirectLink, slugify,
} from '@/lib/press-utils';
import { useAdvancedMode } from '@/hooks/use-advanced-mode';

type Props = { open: boolean; onOpenChange: (o: boolean) => void; onDone?: () => void };

const DEFAULT_BODY = `<p>Olá <strong>{{primeiro_nome}}</strong>! Sou Jefferson Lobo, especialista em IA. Tenho uma pauta que pode interessar à <strong>{{veiculo}}</strong>: <em>[seu assunto aqui]</em>. Posso compartilhar mais detalhes?</p>`;

type SendStatus = 'pendente' | 'enviado' | 'pulado';

export const PressDispatchFlow = ({ open, onOpenChange, onDone }: Props) => {
  const { toast } = useToast();
  const { advanced, setAdvanced } = useAdvancedMode();
  const { lists, loading: loadingLists, reload: reloadLists } = usePressLists();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selectedList, setSelectedList] = useState<string | null>(null);
  const [contacts, setContacts] = useState<PressContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const [nome, setNome] = useState('');
  const [titulo, setTitulo] = useState('');
  const [body, setBody] = useState(DEFAULT_BODY);
  const [linkDestino, setLinkDestino] = useState('');
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [mediaTipo, setMediaTipo] = useState<MediaTipo>('nenhum');

  const [importOpen, setImportOpen] = useState(false);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [sends, setSends] = useState<Record<string, SendStatus>>({});
  const [cursor, setCursor] = useState(0);
  const [opened, setOpened] = useState<Set<string>>(new Set());
  const [creating, setCreating] = useState(false);

  // reset on open
  useEffect(() => {
    if (open) {
      setStep(1);
      setSelectedList(null);
      setContacts([]);
      setNome(''); setTitulo(''); setBody(DEFAULT_BODY);
      setLinkDestino(''); setMediaUrl(null); setMediaTipo('nenhum');
      setCampaignId(null); setSends({}); setCursor(0); setOpened(new Set());
      reloadLists();
    }
  }, [open, reloadLists]);

  // load contacts when list selected
  useEffect(() => {
    if (!selectedList) { setContacts([]); return; }
    setLoadingContacts(true);
    fetchContactsForLists([selectedList], 'whatsapp').then(rows => {
      setContacts(rows);
      setLoadingContacts(false);
    });
  }, [selectedList]);

  const pendingContacts = useMemo(
    () => contacts.filter(c => sends[c.id] !== 'enviado' && sends[c.id] !== 'pulado'),
    [contacts, sends],
  );
  const currentContact = step === 3 ? pendingContacts[0] : null;
  const totalEnviado = Object.values(sends).filter(s => s === 'enviado').length;
  const totalPulado = Object.values(sends).filter(s => s === 'pulado').length;
  const totalDone = totalEnviado + totalPulado;
  const progressPct = contacts.length > 0 ? Math.round((totalDone / contacts.length) * 100) : 0;

  // ---------- step transitions ----------
  const createCampaignAndGo = async () => {
    if (!nome.trim() || !body.trim() || !selectedList || contacts.length === 0) return;
    setCreating(true);
    try {
      const baseSlug = titulo.trim() ? slugify(titulo) : slugify(nome);
      const linkSlug = baseSlug ? `${baseSlug}-${Math.random().toString(36).slice(2, 6)}` : null;
      const { data, error } = await supabase
        .from('press_campaigns')
        .insert({
          tipo: 'whatsapp', nome: nome.trim(), corpo: body,
          total_alvo: contacts.length, status: 'em_envio',
          filtros: { list_ids: [selectedList] },
          titulo: titulo.trim() || null,
          media_url: mediaUrl, media_tipo: mediaTipo,
          link_destino: linkDestino.trim() || null,
          link_slug: linkSlug,
        })
        .select('id').single();
      if (error || !data) throw new Error(error?.message || 'falha ao criar campanha');
      await supabase.from('press_sends').insert(
        contacts.map(c => ({ campaign_id: data.id, contact_id: c.id, canal: 'whatsapp', status: 'pendente' as const }))
      );
      setCampaignId(data.id);
      const initial: Record<string, SendStatus> = {};
      contacts.forEach(c => initial[c.id] = 'pendente');
      setSends(initial);
      setStep(3);
    } catch (e) {
      toast({ title: 'Erro ao criar campanha', description: e instanceof Error ? e.message : 'erro', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  // ---------- step 3 actions ----------
  const buildText = (c: PressContact) => composeWhatsAppMessage({
    titulo, bodyMarkdown: htmlToWhatsAppMarkdown(body), link: linkDestino, contact: c,
  });
  const buildWaLink = (c: PressContact) => buildWhatsappDirectLink(c.whatsapp, buildText(c));
  const buildFallback = (c: PressContact) =>
    `https://wa.me/${(c.whatsapp ?? '').replace(/\D/g, '')}?text=${encodeURIComponent(buildText(c))}`;

  const markSent = async (c: PressContact) => {
    if (!campaignId) return;
    setSends(s => ({ ...s, [c.id]: 'enviado' }));
    await supabase.from('press_sends')
      .update({ status: 'enviado', sent_at: new Date().toISOString() })
      .eq('campaign_id', campaignId).eq('contact_id', c.id);
    await supabase.from('press_campaigns')
      .update({ total_enviado: totalEnviado + 1 }).eq('id', campaignId);
  };
  const markSkip = async (c: PressContact) => {
    if (!campaignId) return;
    setSends(s => ({ ...s, [c.id]: 'pulado' }));
    await supabase.from('press_sends')
      .update({ status: 'pulado' })
      .eq('campaign_id', campaignId).eq('contact_id', c.id);
  };

  const finalizeAndClose = async () => {
    if (campaignId) {
      await supabase.from('press_campaigns')
        .update({ status: 'concluida', sent_at: new Date().toISOString(), total_enviado: totalEnviado })
        .eq('id', campaignId);
    }
    onDone?.();
    onOpenChange(false);
  };

  const canAdvance1 = !!selectedList && contacts.length > 0 && !loadingContacts;
  const canAdvance2 = nome.trim().length > 0 && body.trim().length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto p-0 gap-0">
        {/* HEADER */}
        <div className="sticky top-0 z-10 bg-background border-b-2 px-4 py-3">
          <div className="flex items-center justify-between gap-2 mb-3">
            <h2 className="font-black uppercase text-lg flex items-center gap-2">
              <MessageCircle className="w-5 h-5" /> Disparar WhatsApp
            </h2>
            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                <Switch checked={advanced} onCheckedChange={setAdvanced} />
                Modo avançado
              </label>
              <Button variant="ghost" size="icon" onClick={() => onOpenChange(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <Stepper step={step} />
        </div>

        {/* STEP 1 — LISTA */}
        {step === 1 && (
          <div className="p-4 space-y-4">
            <p className="text-sm text-muted-foreground">
              Escolha a lista de contatos pra este disparo.
            </p>
            {loadingLists ? (
              <div className="flex items-center justify-center py-10"><Loader2 className="w-5 h-5 animate-spin" /></div>
            ) : lists.length === 0 ? (
              <Card className="p-8 text-center space-y-3">
                <p className="text-muted-foreground">Nenhuma lista importada ainda.</p>
                <Button onClick={() => setImportOpen(true)}><Upload className="w-4 h-4 mr-2" /> Importar XLSX</Button>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 gap-3">
                {lists.map(l => {
                  const active = selectedList === l.id;
                  const disabled = l.com_whatsapp === 0;
                  return (
                    <button
                      key={l.id}
                      disabled={disabled}
                      onClick={() => setSelectedList(l.id)}
                      className={`text-left p-4 border-4 transition-all ${
                        active ? 'border-primary bg-primary/10 shadow-[6px_6px_0_0_hsl(var(--primary))]' :
                        disabled ? 'border-muted opacity-50 cursor-not-allowed' :
                        'border-foreground hover:shadow-[4px_4px_0_0_hsl(var(--foreground))]'
                      }`}
                    >
                      <div className="font-black uppercase truncate">{l.nome}</div>
                      <div className="mt-2 flex items-center gap-2">
                        <Badge variant="secondary" className="font-mono">
                          <MessageCircle className="w-3 h-3 mr-1" />
                          {l.com_whatsapp} WhatsApp
                        </Badge>
                        {disabled && <span className="text-[10px] text-muted-foreground">sem números</span>}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <div className="flex justify-between items-center pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="w-3 h-3 mr-1" /> Importar nova lista
              </Button>
              {selectedList && loadingContacts && (
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Loader2 className="w-3 h-3 animate-spin" /> carregando contatos…
                </span>
              )}
              {selectedList && !loadingContacts && (
                <span className="text-xs text-muted-foreground">
                  <strong className="text-foreground">{contacts.length}</strong> contatos vão receber
                </span>
              )}
            </div>
          </div>
        )}

        {/* STEP 2 — MENSAGEM */}
        {step === 2 && (
          <div className="p-4 space-y-4">
            <div>
              <label className="text-xs font-bold uppercase">Nome interno do disparo *</label>
              <Input value={nome} onChange={e => setNome(e.target.value)}
                placeholder="ex: Convite Adjori-PR" className="mt-1" />
              <p className="text-[11px] text-muted-foreground mt-1">só pra você identificar no histórico</p>
            </div>

            <div>
              <label className="text-xs font-bold uppercase">Título (opcional)</label>
              <Input value={titulo} onChange={e => setTitulo(e.target.value)}
                placeholder="aparece em negrito no topo da mensagem" className="mt-1" />
            </div>

            <div>
              <label className="text-xs font-bold uppercase">Mensagem *</label>
              <p className="text-[11px] text-muted-foreground mb-1">
                Use <code className="bg-muted px-1">{`{{primeiro_nome}}`}</code> e <code className="bg-muted px-1">{`{{veiculo}}`}</code> pra personalizar.
              </p>
              <PressRichEditor value={body} onChange={setBody} />
            </div>

            <div>
              <label className="text-xs font-bold uppercase">Link (opcional)</label>
              <Input value={linkDestino} onChange={e => setLinkDestino(e.target.value)}
                placeholder="https://…" className="mt-1" />
            </div>

            {advanced && (
              <div>
                <label className="text-xs font-bold uppercase">Mídia anexa (opcional)</label>
                <CampaignMediaUploader
                  mediaUrl={mediaUrl} mediaTipo={mediaTipo}
                  onChange={(url, tipo) => { setMediaUrl(url); setMediaTipo(tipo); }}
                />
              </div>
            )}

            {/* preview */}
            {contacts[0] && (
              <Card className="p-3 bg-muted/30 border-dashed">
                <div className="text-[10px] uppercase font-bold text-muted-foreground mb-1">
                  Preview (como vai chegar pra {contacts[0].contato ?? contacts[0].veiculo})
                </div>
                <pre className="text-xs whitespace-pre-wrap font-mono">{composeWhatsAppMessage({
                  titulo, bodyMarkdown: htmlToWhatsAppMarkdown(body), link: linkDestino, contact: contacts[0],
                })}</pre>
              </Card>
            )}
          </div>
        )}

        {/* STEP 3 — ENVIAR */}
        {step === 3 && (
          <div className="p-4 space-y-4">
            {/* progress */}
            <div>
              <div className="flex justify-between text-xs font-bold uppercase mb-1">
                <span>{totalDone} de {contacts.length}</span>
                <span className="text-muted-foreground">
                  {totalEnviado} enviados · {totalPulado} pulados
                </span>
              </div>
              <div className="h-3 bg-muted border-2 border-foreground overflow-hidden">
                <div className="h-full bg-primary transition-all" style={{ width: `${progressPct}%` }} />
              </div>
            </div>

            {!currentContact ? (
              <Card className="border-4 border-primary p-8 text-center space-y-4">
                <div className="text-5xl">🎉</div>
                <h3 className="font-black uppercase text-xl">Disparo concluído</h3>
                <p className="text-sm text-muted-foreground">
                  {totalEnviado} enviados · {totalPulado} pulados.
                </p>
                <Button onClick={finalizeAndClose} size="lg" className="w-full">
                  Finalizar e voltar ao painel
                </Button>
              </Card>
            ) : (
              <Card className="border-4 border-foreground p-5 space-y-4 shadow-[6px_6px_0_0_hsl(var(--foreground))]">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                    Contato {totalDone + 1} de {contacts.length}
                  </div>
                  <div className="font-black text-xl leading-tight mt-1">{currentContact.veiculo}</div>
                  <div className="text-sm">{currentContact.contato ?? 'redação'}</div>
                  {currentContact.cargo && <div className="text-xs text-muted-foreground">{currentContact.cargo}</div>}
                  <div className="text-xs text-muted-foreground mt-1">
                    {currentContact.municipio ?? '—'} · +{currentContact.whatsapp}
                  </div>
                </div>

                {advanced && (
                  <details className="border-t pt-2">
                    <summary className="cursor-pointer text-[11px] font-bold uppercase text-muted-foreground">
                      Ver mensagem que vai ser enviada
                    </summary>
                    <pre className="mt-2 p-3 bg-muted text-xs whitespace-pre-wrap rounded">
                      {buildText(currentContact)}
                    </pre>
                  </details>
                )}

                <Button
                  asChild
                  className="w-full h-16 text-base font-black uppercase"
                  size="lg"
                  onClick={() => setOpened(s => new Set(s).add(currentContact.id))}
                >
                  <a href={buildWaLink(currentContact)} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="w-5 h-5 mr-2" /> Abrir WhatsApp
                  </a>
                </Button>

                {advanced && opened.has(currentContact.id) && (
                  <a
                    href={buildFallback(currentContact)}
                    target="_blank" rel="noopener noreferrer"
                    className="block text-center text-[11px] text-muted-foreground underline"
                  >
                    Não abriu? Tentar wa.me
                  </a>
                )}

                <div className="grid grid-cols-2 gap-2">
                  <Button onClick={() => markSkip(currentContact)} variant="outline" size="lg">
                    <SkipForward className="w-4 h-4 mr-2" /> Pular
                  </Button>
                  <Button onClick={() => markSent(currentContact)} variant="default" size="lg"
                    disabled={!opened.has(currentContact.id)}
                    className="bg-primary text-primary-foreground">
                    <Check className="w-4 h-4 mr-2" /> Enviei
                  </Button>
                </div>
                {!opened.has(currentContact.id) && (
                  <p className="text-[11px] text-center text-muted-foreground">
                    Clique em <strong>Abrir WhatsApp</strong> primeiro
                  </p>
                )}
              </Card>
            )}
          </div>
        )}

        {/* FOOTER NAV (steps 1 e 2) */}
        {step !== 3 && (
          <div className="sticky bottom-0 bg-background border-t-2 px-4 py-3 flex justify-between gap-2">
            {step === 1 ? (
              <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
            ) : (
              <Button variant="ghost" onClick={() => setStep(1)}>
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            )}
            {step === 1 ? (
              <Button disabled={!canAdvance1} onClick={() => setStep(2)} size="lg">
                Avançar <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button disabled={!canAdvance2 || creating} onClick={createCampaignAndGo} size="lg">
                {creating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                Avançar pra envio <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            )}
          </div>
        )}

        <PressImportDialog
          open={importOpen}
          onOpenChange={setImportOpen}
          onDone={() => { reloadLists(); }}
        />
      </DialogContent>
    </Dialog>
  );
};

// ---------- stepper ----------
const Stepper = ({ step }: { step: 1 | 2 | 3 }) => {
  const items = [
    { n: 1, label: 'Lista' },
    { n: 2, label: 'Mensagem' },
    { n: 3, label: 'Enviar' },
  ];
  return (
    <div className="flex items-center gap-1">
      {items.map((it, i) => {
        const active = step === it.n;
        const done = step > it.n;
        return (
          <div key={it.n} className="flex items-center flex-1 gap-1">
            <div className={`flex items-center gap-2 px-3 py-1.5 border-2 flex-1 ${
              active ? 'border-primary bg-primary text-primary-foreground' :
              done ? 'border-primary/50 bg-primary/10' :
              'border-muted text-muted-foreground'
            }`}>
              <span className="font-black text-xs">
                {done ? <Check className="w-3 h-3" /> : it.n}
              </span>
              <span className="text-[11px] font-bold uppercase truncate">{it.label}</span>
            </div>
            {i < items.length - 1 && <ArrowRight className="w-3 h-3 text-muted-foreground shrink-0" />}
          </div>
        );
      })}
    </div>
  );
};

export default PressDispatchFlow;
