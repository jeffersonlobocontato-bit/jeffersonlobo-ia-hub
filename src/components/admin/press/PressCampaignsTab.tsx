import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageCircle, Send, SkipForward, Check, ExternalLink } from 'lucide-react';
import type { PressContact } from '@/lib/press-utils';
import { buildWhatsappLink, renderTemplate } from '@/lib/press-utils';

type Props = {
  selectedContacts: PressContact[];
  onClearSelection: () => void;
};

const DEFAULT_MSG = `Olá {{primeiro_nome}}! Sou Jefferson Lobo, especialista em IA. Estou enviando uma pauta que pode interessar à {{veiculo}}: [seu assunto aqui]. Posso compartilhar mais detalhes?`;

export const PressCampaignsTab = ({ selectedContacts, onClearSelection }: Props) => {
  const { toast } = useToast();
  const [nome, setNome] = useState('');
  const [mensagem, setMensagem] = useState(DEFAULT_MSG);
  const [campaignId, setCampaignId] = useState<string | null>(null);
  const [sends, setSends] = useState<Record<string, 'pendente' | 'enviado' | 'pulado'>>({});

  const eligible = selectedContacts.filter(c => c.whatsapp && !c.opt_out);
  const pending = eligible.filter(c => (sends[c.id] ?? 'pendente') === 'pendente');
  const done = eligible.filter(c => sends[c.id] === 'enviado').length;
  const skipped = eligible.filter(c => sends[c.id] === 'pulado').length;

  const startCampaign = async () => {
    if (!nome.trim() || !mensagem.trim()) {
      toast({ title: 'Informe nome e mensagem', variant: 'destructive' }); return;
    }
    if (!eligible.length) {
      toast({ title: 'Nenhum contato elegível selecionado', variant: 'destructive' }); return;
    }
    const { data, error } = await supabase
      .from('press_campaigns')
      .insert({ tipo: 'whatsapp', nome: nome.trim(), corpo: mensagem, total_alvo: eligible.length, status: 'em_envio' })
      .select('id').single();
    if (error || !data) { toast({ title: 'Erro', description: error?.message, variant: 'destructive' }); return; }
    setCampaignId(data.id);
    // pré-cria sends como pendente
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
    setSends({});
    onClearSelection();
  };

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
          <div>
            <label className="text-xs uppercase font-bold">Mensagem</label>
            <Textarea value={mensagem} onChange={e => setMensagem(e.target.value)} disabled={!!campaignId} rows={5} />
            <p className="text-xs text-muted-foreground mt-1">
              Variáveis: <code>{`{{primeiro_nome}}`}</code>, <code>{`{{contato}}`}</code>, <code>{`{{veiculo}}`}</code>, <code>{`{{municipio}}`}</code>, <code>{`{{regiao}}`}</code>, <code>{`{{cargo}}`}</code>
            </p>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <div className="text-sm">
              <strong>{selectedContacts.length}</strong> selecionados •
              <strong className="text-primary"> {eligible.length}</strong> com WhatsApp válido
            </div>
            {!campaignId ? (
              <Button onClick={startCampaign} disabled={!eligible.length}>
                <Send className="w-4 h-4 mr-2" /> Iniciar campanha
              </Button>
            ) : (
              <div className="flex gap-2 items-center">
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
        <Card className="p-4">
          <h4 className="font-bold uppercase text-sm mb-3">Fila de envio</h4>
          <div className="max-h-[500px] overflow-y-auto divide-y">
            {eligible.map(c => {
              const status = sends[c.id] ?? 'pendente';
              return (
                <div key={c.id} className="py-2 flex items-center gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{c.veiculo}</div>
                    <div className="text-xs text-muted-foreground truncate">
                      {c.contato ?? 'redação'} • {c.municipio} • {c.whatsapp}
                    </div>
                  </div>
                  {status === 'enviado' && <Badge className="bg-primary"><Check className="w-3 h-3 mr-1" />Enviado</Badge>}
                  {status === 'pulado' && <Badge variant="outline">Pulado</Badge>}
                  {status === 'pendente' && (
                    <div className="flex gap-1">
                      <Button size="sm" variant="ghost" onClick={() => skip(c)}>
                        <SkipForward className="w-3 h-3" />
                      </Button>
                      <Button size="sm" onClick={() => markSent(c)}>
                        <ExternalLink className="w-3 h-3 mr-1" /> Abrir
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <details className="mt-4 text-xs">
            <summary className="cursor-pointer font-bold uppercase">Preview da mensagem renderizada (primeiro contato)</summary>
            <pre className="mt-2 p-3 bg-muted rounded whitespace-pre-wrap">{eligible[0] && renderTemplate(mensagem, eligible[0])}</pre>
          </details>
        </Card>
      )}
    </div>
  );
};
