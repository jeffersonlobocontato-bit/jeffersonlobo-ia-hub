import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, SkipForward, Check, ExternalLink, ShieldAlert } from 'lucide-react';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import type { PressContact } from '@/lib/press-utils';
import { buildWhatsappLink, renderTemplate } from '@/lib/press-utils';
import { WhatsAppRhythmGuard } from './WhatsAppRhythmGuard';
import { ReleaseGroupPicker } from './ReleaseGroupPicker';

type Props = {
  selectedContacts: PressContact[];
  onClearSelection: () => void;
};

const DEFAULT_MSG = `Olá {{primeiro_nome}}! Sou Jefferson Lobo, especialista em IA. Estou enviando uma pauta que pode interessar à {{veiculo}}: [seu assunto aqui]. Posso compartilhar mais detalhes?`;
const STORAGE_KEY = 'press_campaign_active_wa';

type BlockInfo = { campanha: string; data: string };

export const PressCampaignsTab = ({ selectedContacts, onClearSelection }: Props) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState(DEFAULT_MSG);
  const [releaseGroup, setReleaseGroup] = useState('');
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [campaignCreatedAt, setCampaignCreatedAt] = useState<string | null>(null);
  const [sends, setSends] = useState<Record<string, 'pendente' | 'enviado' | 'pulado'>>({});
  const [blocked, setBlocked] = useState<Map<string, BlockInfo>>(new Map());
  const [overrides, setOverrides] = useState<Set<string>>(new Set());
  const [canSendNow, setCanSendNow] = useState(false);
  const [confirmOverride, setConfirmOverride] = useState<{ contact: PressContact; info: BlockInfo } | null>(null);

  // Restaura campanha ativa do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return;
    (async () => {
      const { data: camp } = await supabase
        .from('press_campaigns')
        .select('id, nome, corpo, release_group, created_at, status')
        .eq('id', saved)
        .maybeSingle();
      if (!camp || camp.status === 'concluida') {
        localStorage.removeItem(STORAGE_KEY);
        return;
      }
      setCampaignId(camp.id);
      setCampaignCreatedAt(camp.created_at);
      setNome(camp.nome);
      setMensagem(camp.corpo);
      setReleaseGroup(camp.release_group ?? '');
      const { data: rows } = await supabase
        .from('press_sends')
        .select('contact_id, status')
        .eq('campaign_id', saved);
      const m: Record<string, any> = {};
      (rows ?? []).forEach(r => { m[r.contact_id] = r.status; });
      setSends(m);
    })();
  }, []);

  // Carrega bloqueios por release_group sempre que mudar grupo ou campanha
  useEffect(() => {
    if (!releaseGroup) { setBlocked(new Map()); return; }
    (async () => {
      const { data } = await supabase
        .from('press_sends')
        .select('contact_id, sent_at, campaign_id, press_campaigns!inner(nome, release_group, tipo)')
        .eq('canal', 'whatsapp')
        .eq('status', 'enviado')
        .eq('press_campaigns.release_group', releaseGroup);
      const map = new Map<string, BlockInfo>();
      for (const row of (data ?? []) as any[]) {
        if (row.campaign_id === campaignId) continue; // ignora a campanha atual
        if (map.has(row.contact_id)) continue;
        map.set(row.contact_id, {
          campanha: row.press_campaigns?.nome ?? '—',
          data: row.sent_at,
        });
      }
      setBlocked(map);
    })();
  }, [releaseGroup, campaignId, sends]);

  const eligible = selectedContacts.filter(c => c.whatsapp && !c.opt_out);
  const pending = eligible.filter(c => (sends[c.id] ?? 'pendente') === 'pendente');
  const done = eligible.filter(c => sends[c.id] === 'enviado').length;
  const skipped = eligible.filter(c => sends[c.id] === 'pulado').length;
  const blockedCount = eligible.filter(c => blocked.has(c.id) && !overrides.has(c.id) && sends[c.id] !== 'enviado').length;

  const startCampaign = async () => {
    if (!nome.trim() || !mensagem.trim()) {
      toast({ title: 'Informe nome e mensagem', variant: 'destructive' }); return;
    }
    if (!eligible.length) {
      toast({ title: 'Nenhum contato elegível selecionado', variant: 'destructive' }); return;
    }
    const { data, error } = await supabase
      .from('press_campaigns')
      .insert({
        tipo: 'whatsapp',
        nome: nome.trim(),
        corpo: mensagem,
        total_alvo: eligible.length,
        status: 'em_envio',
        release_group: releaseGroup.trim() || null,
      })
      .select('id, created_at').single();
    if (error || !data) { toast({ title: 'Erro', description: error?.message, variant: 'destructive' }); return; }
    setCampaignId(data.id);
    setCampaignCreatedAt(data.created_at);
    localStorage.setItem(STORAGE_KEY, data.id);
    await supabase.from('press_sends').insert(
      eligible.map(c => ({ campaign_id: data.id, contact_id: c.id, canal: 'whatsapp', status: 'pendente' }))
    );
    const initial: Record<string, 'pendente'> = {};
    eligible.forEach(c => initial[c.id] = 'pendente');
    setSends(initial);
    toast({ title: 'Campanha iniciada', description: `${eligible.length} contatos na fila` });
  };

  const markSent = async (contact: PressContact) => {
    const link = buildWhatsappLink(contact, mensagem);
    if (!link || !campaignId) return;
    window.open(link, '_blank', 'noopener,noreferrer');
    setSends(s => ({ ...s, [contact.id]: 'enviado' }));
    await supabase.from('press_sends').update({ status: 'enviado', sent_at: new Date().toISOString() })
      .eq('campaign_id', campaignId).eq('contact_id', contact.id);
    await supabase.from('press_campaigns')
      .update({ total_enviado: done + 1 })
      .eq('id', campaignId);
  };

  const skip = async (contact: PressContact) => {
    if (!campaignId) return;
    setSends(s => ({ ...s, [contact.id]: 'pulado' }));
    await supabase.from('press_sends').update({ status: 'pulado' })
      .eq('campaign_id', campaignId).eq('contact_id', contact.id);
  };

  const finish = async () => {
    if (!campaignId) return;
    await supabase.from('press_campaigns').update({ status: 'concluida', sent_at: new Date().toISOString() })
      .eq('id', campaignId);
    toast({ title: 'Campanha encerrada' });
    setCampaignId(null);
    setCampaignCreatedAt(null);
    setSends({});
    setOverrides(new Set());
    localStorage.removeItem(STORAGE_KEY);
    onClearSelection();
  };

  const fmtDate = (iso: string) => new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' });

  return (
    <div className="space-y-4">
      <Card className="p-4 border-2 border-primary">
        <h3 className="font-black uppercase text-lg mb-3 flex items-center gap-2">
          <MessageCircle className="w-5 h-5" /> Campanha WhatsApp (envio manual assistido)
        </h3>
        <p className="text-xs text-muted-foreground mb-3">
          Gera links wa.me personalizados. Você clica, o WhatsApp abre numa aba com mensagem pronta — só revisar e enviar. Zero risco de banimento, ideal para imprensa.
        </p>
        <div className="space-y-3">
          <div>
            <label className="text-xs uppercase font-bold">Nome da campanha</label>
            <Input value={nome} onChange={e => setNome(e.target.value)} disabled={!!campaignId} placeholder="Ex: Release Adjori PR 2026" />
          </div>
          <ReleaseGroupPicker value={releaseGroup} onChange={setReleaseGroup} disabled={!!campaignId} />
          <div>
            <label className="text-xs uppercase font-bold">Mensagem</label>
            <Textarea value={mensagem} onChange={e => setMensagem(e.target.value)} disabled={!!campaignId} rows={5} />
            <p className="text-xs text-muted-foreground mt-1">
              Variáveis: <code>{`{{primeiro_nome}}`}</code>, <code>{`{{contato}}`}</code>, <code>{`{{veiculo}}`}</code>, <code>{`{{municipio}}`}</code>, <code>{`{{regiao}}`}</code>, <code>{`{{cargo}}`}</code>
            </p>
          </div>
          <div className="flex items-center justify-between border-t pt-3 flex-wrap gap-2">
            <div className="text-sm">
              <strong>{selectedContacts.length}</strong> selecionados •
              <strong className="text-primary"> {eligible.length}</strong> com WhatsApp válido
              {blockedCount > 0 && <> • <strong className="text-orange-600">{blockedCount}</strong> bloqueados (release)</>}
            </div>
            {!campaignId ? (
              <Button onClick={startCampaign} disabled={!eligible.length}>
                <Send className="w-4 h-4 mr-2" /> Iniciar campanha
              </Button>
            ) : (
              <div className="flex gap-2 items-center flex-wrap">
                <Badge>{done} enviados</Badge>
                <Badge variant="outline">{skipped} pulados</Badge>
                <Badge variant="secondary">{pending.length} pendentes</Badge>
                <Button variant="outline" onClick={finish}>Encerrar</Button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {campaignId && (
        <WhatsAppRhythmGuard
          campaignCreatedAt={campaignCreatedAt}
          onStateChange={setCanSendNow}
        />
      )}

      {campaignId && (
        <Card className="p-4">
          <h4 className="font-bold uppercase text-sm mb-3">Fila de envio</h4>
          <TooltipProvider>
            <div className="max-h-[500px] overflow-y-auto divide-y">
              {eligible.map(c => {
                const status = sends[c.id] ?? 'pendente';
                const block = blocked.get(c.id);
                const isBlocked = !!block && !overrides.has(c.id) && status !== 'enviado';
                return (
                  <div key={c.id} className={`py-2 flex items-center gap-3 ${isBlocked ? 'opacity-60' : ''}`}>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{c.veiculo}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {c.contato ?? 'redação'} • {c.municipio} • {c.whatsapp}
                      </div>
                      {isBlocked && (
                        <div className="text-[11px] text-orange-600 mt-0.5 flex items-center gap-1">
                          <ShieldAlert className="w-3 h-3" />
                          Recebeu em {fmtDate(block.data)} — {block.campanha}
                          <button
                            className="underline ml-1 hover:text-orange-700"
                            onClick={() => setConfirmOverride({ contact: c, info: block })}
                          >
                            ignorar bloqueio
                          </button>
                        </div>
                      )}
                    </div>
                    {status === 'enviado' && <Badge className="bg-primary"><Check className="w-3 h-3 mr-1" />Enviado</Badge>}
                    {status === 'pulado' && <Badge variant="outline">Pulado</Badge>}
                    {status === 'pendente' && !isBlocked && (
                      <div className="flex gap-1">
                        <Button size="sm" variant="ghost" onClick={() => skip(c)}>
                          <SkipForward className="w-3 h-3" />
                        </Button>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span>
                              <Button
                                size="sm"
                                onClick={() => markSent(c)}
                                disabled={!canSendNow}
                              >
                                <ExternalLink className="w-3 h-3 mr-1" /> Abrir
                              </Button>
                            </span>
                          </TooltipTrigger>
                          {!canSendNow && (
                            <TooltipContent>
                              Aguarde a liberação no painel de ritmo acima
                            </TooltipContent>
                          )}
                        </Tooltip>
                      </div>
                    )}
                    {status === 'pendente' && isBlocked && (
                      <Badge variant="outline" className="border-orange-500 text-orange-600">Bloqueado</Badge>
                    )}
                  </div>
                );
              })}
            </div>
          </TooltipProvider>
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer font-bold uppercase">Preview da mensagem renderizada (primeiro contato)</summary>
            <pre className="mt-2 p-3 bg-muted rounded whitespace-pre-wrap">{eligible[0] && renderTemplate(mensagem, eligible[0])}</pre>
          </details>
        </Card>
      )}

      <AlertDialog open={!!confirmOverride} onOpenChange={(o) => !o && setConfirmOverride(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ignorar bloqueio de duplicidade?</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmOverride && (
                <>
                  <strong>{confirmOverride.contact.veiculo}</strong> ({confirmOverride.contact.contato ?? 'redação'}) já recebeu
                  o release <strong>{confirmOverride.info.campanha}</strong> em {fmtDate(confirmOverride.info.data)}.
                  <br /><br />
                  Reenviar pode irritar o jornalista e gerar reputação ruim para o seu número.
                  Tem certeza?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmOverride) {
                  setOverrides(s => new Set(s).add(confirmOverride.contact.id));
                  setConfirmOverride(null);
                }
              }}
            >
              Sim, liberar este contato
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
