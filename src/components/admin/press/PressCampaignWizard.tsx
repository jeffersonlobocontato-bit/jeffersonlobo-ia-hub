import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  Mail, MessageCircle, ChevronRight, ChevronLeft, Send, Eye, Check,
  ExternalLink, SkipForward, Loader2,
} from 'lucide-react';
import { PressRichEditor } from './PressRichEditor';
import { fetchContactsForLists, usePressLists, type PressList } from '@/hooks/usePressLists';
import {
  type PressContact, renderTemplate, htmlToWhatsAppMarkdown,
} from '@/lib/press-utils';

type Props = { open: boolean; onOpenChange: (o: boolean) => void };
type Canal = 'email' | 'whatsapp';
type Step = 1 | 2 | 3 | 4;

const DEFAULT_EMAIL_SUBJECT = `Pauta para {{veiculo}} — {{primeiro_nome}}, posso compartilhar?`;
const DEFAULT_EMAIL_BODY = `<p>Olá <strong>{{primeiro_nome}}</strong>,</p><p>Sou Jefferson Lobo, especialista em IA. Estou enviando uma pauta que pode interessar à <strong>{{veiculo}}</strong>:</p><p><em>[descreva sua pauta aqui]</em></p><p>Posso compartilhar mais detalhes?</p><p>Abraço,<br>Jefferson Lobo</p>`;
const DEFAULT_WA_BODY = `<p>Olá <strong>{{primeiro_nome}}</strong>! Sou Jefferson Lobo, especialista em IA. Tenho uma pauta que pode interessar à <strong>{{veiculo}}</strong>: <em>[seu assunto aqui]</em>. Posso compartilhar mais detalhes?</p>`;

const BATCH_LIMIT = 280;

export const PressCampaignWizard = ({ open, onOpenChange }: Props) => {
  const { toast } = useToast();
  const { lists, loading: loadingLists, reload: reloadLists } = usePressLists();

  const [step, setStep] = useState<Step>(1);
  const [canal, setCanal] = useState<Canal | null>(null);
  const [selectedLists, setSelectedLists] = useState<Set<string>>(new Set());
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [contacts, setContacts] = useState<PressContact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);

  const [nome, setNome] = useState('');
  const [subject, setSubject] = useState(DEFAULT_EMAIL_SUBJECT);
  const [body, setBody] = useState(DEFAULT_EMAIL_BODY);

  const [sending, setSending] = useState(false);
  const [emailResult, setEmailResult] = useState<{ sent: number; skipped: number; failed: number } | null>(null);

  // WA-only state
  const [waCampaignId, setWaCampaignId] = useState<string | null>(null);
  const [waSends, setWaSends] = useState<Record<string, 'pendente' | 'enviado' | 'pulado'>>({});

  // reset ao abrir
  useEffect(() => {
    if (open) {
      setStep(1); setCanal(null); setSelectedLists(new Set()); setSelectedRegions(new Set()); setContacts([]);
      setNome(''); setSubject(DEFAULT_EMAIL_SUBJECT); setBody(DEFAULT_EMAIL_BODY);
      setEmailResult(null); setWaCampaignId(null); setWaSends({});
      reloadLists();
    }
  }, [open, reloadLists]);

  // ao escolher canal: default do body adequado
  useEffect(() => {
    if (canal === 'whatsapp') setBody(DEFAULT_WA_BODY);
    if (canal === 'email') setBody(DEFAULT_EMAIL_BODY);
  }, [canal]);

  // resolve contatos quando passa pro step 3 (revisar usa step 4)
  useEffect(() => {
    if (step < 2 || !canal || selectedLists.size === 0) return;
    setLoadingContacts(true);
    fetchContactsForLists([...selectedLists], canal).then(rows => {
      setContacts(rows);
      setLoadingContacts(false);
    });
  }, [step, canal, selectedLists]);

  const toggleList = (id: string) => {
    const next = new Set(selectedLists);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelectedLists(next);
  };

  const totalElegiveis = contacts.length;
  const preview = contacts[0];

  // === SEND EMAIL ===
  const dispararEmail = async () => {
    if (!nome.trim() || !subject.trim() || !body.trim()) {
      toast({ title: 'Preencha nome, assunto e corpo', variant: 'destructive' }); return;
    }
    if (totalElegiveis > BATCH_LIMIT) {
      toast({
        title: 'Lote acima do limite (300/dia Brevo Free)',
        description: `Selecione listas com no máximo ${BATCH_LIMIT} contatos por disparo (você tem ${totalElegiveis}).`,
        variant: 'destructive',
      });
      return;
    }
    if (!confirm(`Disparar email para ${totalElegiveis} contatos via Brevo? Isso não pode ser desfeito.`)) return;

    setSending(true); setEmailResult(null);
    try {
      const { data: campaign, error: cErr } = await supabase
        .from('press_campaigns')
        .insert({
          tipo: 'email', nome: nome.trim(), assunto: subject, corpo: body,
          total_alvo: totalElegiveis, status: 'em_envio',
          filtros: { list_ids: [...selectedLists] },
        })
        .select('id').single();
      if (cErr || !campaign) throw new Error(cErr?.message || 'falha ao criar campanha');

      const { data, error } = await supabase.functions.invoke('send-press-email', {
        body: {
          campaign_id: campaign.id,
          contact_ids: contacts.map(c => c.id),
          subject, html: body,
        },
      });
      if (error) throw error;
      setEmailResult(data);
      toast({
        title: 'Disparo finalizado',
        description: `${data.sent} enviados · ${data.failed} erros · ${data.skipped} pulados`,
      });
    } catch (e) {
      toast({ title: 'Erro no disparo', description: e instanceof Error ? e.message : 'erro', variant: 'destructive' });
    } finally {
      setSending(false);
    }
  };

  // === START WA CAMPAIGN ===
  const iniciarWA = async () => {
    if (!nome.trim() || !body.trim()) {
      toast({ title: 'Preencha nome e mensagem', variant: 'destructive' }); return;
    }
    const { data, error } = await supabase
      .from('press_campaigns')
      .insert({
        tipo: 'whatsapp', nome: nome.trim(), corpo: body,
        total_alvo: totalElegiveis, status: 'em_envio',
        filtros: { list_ids: [...selectedLists] },
      })
      .select('id').single();
    if (error || !data) {
      toast({ title: 'Erro', description: error?.message, variant: 'destructive' }); return;
    }
    setWaCampaignId(data.id);
    await supabase.from('press_sends').insert(
      contacts.map(c => ({ campaign_id: data.id, contact_id: c.id, canal: 'whatsapp', status: 'pendente' }))
    );
    const initial: Record<string, 'pendente'> = {};
    contacts.forEach(c => initial[c.id] = 'pendente');
    setWaSends(initial);
  };

  const waMarkSent = async (c: PressContact) => {
    if (!waCampaignId) return;
    const waText = htmlToWhatsAppMarkdown(renderTemplate(body, c));
    const link = `https://wa.me/${c.whatsapp}?text=${encodeURIComponent(waText)}`;
    window.open(link, '_blank', 'noopener,noreferrer');
    setWaSends(s => ({ ...s, [c.id]: 'enviado' }));
    await supabase.from('press_sends').update({ status: 'enviado', sent_at: new Date().toISOString() })
      .eq('campaign_id', waCampaignId).eq('contact_id', c.id);
  };
  const waSkip = async (c: PressContact) => {
    if (!waCampaignId) return;
    setWaSends(s => ({ ...s, [c.id]: 'pulado' }));
    await supabase.from('press_sends').update({ status: 'pulado' })
      .eq('campaign_id', waCampaignId).eq('contact_id', c.id);
  };
  const waFinish = async () => {
    if (!waCampaignId) return;
    const done = Object.values(waSends).filter(s => s === 'enviado').length;
    await supabase.from('press_campaigns')
      .update({ status: 'concluida', sent_at: new Date().toISOString(), total_enviado: done })
      .eq('id', waCampaignId);
    toast({ title: 'Campanha encerrada' });
    onOpenChange(false);
  };

  const canNext = (): boolean => {
    if (step === 1) return canal !== null;
    if (step === 2) return selectedLists.size > 0 && totalElegiveis > 0 && !loadingContacts;
    if (step === 3) return nome.trim().length > 0 && body.trim().length > 0 && (canal === 'whatsapp' || subject.trim().length > 0);
    return false;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="uppercase font-black flex items-center gap-3">
            Novo disparo
            <StepDots step={step} />
          </DialogTitle>
        </DialogHeader>

        {/* STEP 1: TIPO */}
        {step === 1 && (
          <div className="space-y-4 py-4">
            <p className="text-sm text-muted-foreground">Como você quer disparar?</p>
            <div className="grid md:grid-cols-2 gap-4">
              <CanalCard
                icon={<MessageCircle className="w-10 h-10" />}
                title="WhatsApp"
                desc="Envio manual assistido via wa.me — você revisa e clica em cada contato. Zero risco de banimento."
                active={canal === 'whatsapp'}
                onClick={() => setCanal('whatsapp')}
              />
              <CanalCard
                icon={<Mail className="w-10 h-10" />}
                title="Email"
                desc="Disparo em lote via Brevo (até 300/dia). Variáveis personalizadas + opt-out no rodapé."
                active={canal === 'email'}
                onClick={() => setCanal('email')}
              />
            </div>
          </div>
        )}

        {/* STEP 2: LISTAS */}
        {step === 2 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Escolha uma ou mais listas. Contatos repetidos contam uma vez só.
              </p>
              <div className="text-sm">
                <strong className="text-2xl text-primary">{totalElegiveis}</strong>
                <span className="text-muted-foreground ml-1">
                  elegíveis ({canal === 'email' ? 'com email' : 'com WhatsApp'}, sem opt-out)
                </span>
              </div>
            </div>
            {loadingLists ? (
              <p className="text-muted-foreground">Carregando listas...</p>
            ) : lists.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                Nenhuma lista ainda. Volte e clique em <strong>Importar XLSX</strong> para criar a primeira.
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-3">
                {lists.map(l => (
                  <ListCard
                    key={l.id}
                    list={l}
                    canal={canal!}
                    selected={selectedLists.has(l.id)}
                    onToggle={() => toggleList(l.id)}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* STEP 3: CONTEÚDO */}
        {step === 3 && (
          <div className="space-y-4 py-4">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="uppercase">
                {canal === 'email' ? <Mail className="w-3 h-3 mr-1" /> : <MessageCircle className="w-3 h-3 mr-1" />}
                {canal}
              </Badge>
              <span className="text-sm text-muted-foreground">
                {totalElegiveis} contatos · {selectedLists.size} lista(s)
              </span>
            </div>
            <div>
              <label className="text-xs uppercase font-bold">Nome interno da campanha</label>
              <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Ex: Pauta congresso ADJORI-PR" />
            </div>
            {canal === 'email' && (
              <div>
                <label className="text-xs uppercase font-bold">Assunto do email</label>
                <Input value={subject} onChange={e => setSubject(e.target.value)} />
              </div>
            )}
            <div>
              <label className="text-xs uppercase font-bold">
                {canal === 'email' ? 'Corpo do email' : 'Mensagem WhatsApp'}
              </label>
              <PressRichEditor value={body} onChange={setBody} />
              {canal === 'whatsapp' && (
                <p className="text-xs text-muted-foreground mt-1">
                  WhatsApp converte: negrito → <code>*texto*</code>, itálico → <code>_texto_</code>, tachado → <code>~texto~</code>. Imagens viram link.
                </p>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: REVISAR / DISPARAR */}
        {step === 4 && (
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-3 gap-3">
              <Stat label="Canal" value={canal === 'email' ? 'Email' : 'WhatsApp'} />
              <Stat label="Listas" value={selectedLists.size} />
              <Stat label="Contatos" value={totalElegiveis} highlight />
            </div>

            {/* PREVIEW */}
            {preview && (
              <Card className="p-4 space-y-2 border-2 border-dashed">
                <div className="text-xs font-bold uppercase text-muted-foreground">Preview no primeiro contato</div>
                <div className="text-xs"><strong>Para:</strong> {preview.contato || preview.veiculo} {canal === 'email' ? `(${preview.email})` : `(${preview.whatsapp})`}</div>
                {canal === 'email' && <div className="text-xs"><strong>Assunto:</strong> {renderTemplate(subject, preview)}</div>}
                {canal === 'email' ? (
                  <div className="bg-white p-3 rounded text-sm text-black border" dangerouslySetInnerHTML={{ __html: renderTemplate(body, preview) }} />
                ) : (
                  <pre className="bg-muted p-3 rounded text-xs whitespace-pre-wrap font-sans">
                    {htmlToWhatsAppMarkdown(renderTemplate(body, preview))}
                  </pre>
                )}
              </Card>
            )}

            {/* ACTION BAR */}
            {canal === 'email' && !emailResult && (
              <Button onClick={dispararEmail} disabled={sending || totalElegiveis === 0} className="w-full" size="lg">
                {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                {sending ? 'Disparando...' : `Disparar para ${totalElegiveis} contatos`}
              </Button>
            )}
            {canal === 'email' && emailResult && (
              <div className="flex gap-2">
                <Badge className="bg-primary"><Mail className="w-3 h-3 mr-1" />{emailResult.sent} enviados</Badge>
                <Badge variant="destructive">{emailResult.failed} erros</Badge>
                <Badge variant="secondary">{emailResult.skipped} pulados</Badge>
                <Button className="ml-auto" variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
              </div>
            )}

            {canal === 'whatsapp' && !waCampaignId && (
              <Button onClick={iniciarWA} className="w-full" size="lg">
                <Send className="w-4 h-4 mr-2" /> Iniciar fila de envio ({totalElegiveis})
              </Button>
            )}

            {canal === 'whatsapp' && waCampaignId && (
              <Card className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm">
                    <Badge>{Object.values(waSends).filter(s => s === 'enviado').length} enviados</Badge>{' '}
                    <Badge variant="outline">{Object.values(waSends).filter(s => s === 'pulado').length} pulados</Badge>{' '}
                    <Badge variant="secondary">{Object.values(waSends).filter(s => s === 'pendente').length} pendentes</Badge>
                  </div>
                  <Button size="sm" variant="outline" onClick={waFinish}>Encerrar</Button>
                </div>
                <div className="max-h-[300px] overflow-y-auto divide-y">
                  {contacts.map(c => {
                    const status = waSends[c.id] ?? 'pendente';
                    return (
                      <div key={c.id} className="py-2 flex items-center gap-2 text-sm">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium truncate">{c.veiculo}</div>
                          <div className="text-xs text-muted-foreground truncate">
                            {c.contato ?? 'redação'} · {c.whatsapp}
                          </div>
                        </div>
                        {status === 'enviado' && <Badge className="bg-primary"><Check className="w-3 h-3 mr-1" />Enviado</Badge>}
                        {status === 'pulado' && <Badge variant="outline">Pulado</Badge>}
                        {status === 'pendente' && (
                          <div className="flex gap-1">
                            <Button size="sm" variant="ghost" onClick={() => waSkip(c)}><SkipForward className="w-3 h-3" /></Button>
                            <Button size="sm" onClick={() => waMarkSent(c)}><ExternalLink className="w-3 h-3 mr-1" />Abrir</Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* FOOTER NAV */}
        <div className="flex items-center justify-between border-t pt-3 mt-2">
          <Button variant="ghost" onClick={() => setStep((s) => Math.max(1, s - 1) as Step)} disabled={step === 1}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <div className="text-xs text-muted-foreground">Passo {step} de 4</div>
          {step < 4 ? (
            <Button onClick={() => setStep((s) => (s + 1) as Step)} disabled={!canNext()}>
              Continuar <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>Fechar</Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const StepDots = ({ step }: { step: Step }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4].map(i => (
      <div key={i} className={`w-2 h-2 rounded-full ${i <= step ? 'bg-primary' : 'bg-muted'}`} />
    ))}
  </div>
);

const CanalCard = ({ icon, title, desc, active, onClick }: {
  icon: React.ReactNode; title: string; desc: string; active: boolean; onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-left p-6 border-2 transition-all ${active ? 'border-primary bg-primary/10 shadow-[4px_4px_0_hsl(var(--primary))]' : 'border-border hover:border-primary/50'}`}
  >
    <div className={`mb-3 ${active ? 'text-primary' : ''}`}>{icon}</div>
    <div className="font-black uppercase text-lg">{title}</div>
    <div className="text-sm text-muted-foreground mt-1">{desc}</div>
  </button>
);

const ListCard = ({ list, canal, selected, onToggle }: {
  list: PressList; canal: Canal; selected: boolean; onToggle: () => void;
}) => {
  const elig = canal === 'email' ? list.com_email : list.com_whatsapp;
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`text-left p-4 border-2 transition-all ${selected ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'}`}
    >
      <div className="flex items-start gap-3">
        <Checkbox checked={selected} className="mt-1 pointer-events-none" />
        <div className="flex-1 min-w-0">
          <div className="font-bold truncate">{list.nome}</div>
          <div className="text-xs text-muted-foreground">
            {list.total} contatos · <strong className="text-primary">{elig}</strong> com {canal === 'email' ? 'email' : 'WhatsApp'}
          </div>
        </div>
      </div>
    </button>
  );
};

const Stat = ({ label, value, highlight }: { label: string; value: number | string; highlight?: boolean }) => (
  <Card className="p-3">
    <div className="text-xs uppercase text-muted-foreground">{label}</div>
    <div className={`text-2xl font-black ${highlight ? 'text-primary' : ''}`}>{value}</div>
  </Card>
);
