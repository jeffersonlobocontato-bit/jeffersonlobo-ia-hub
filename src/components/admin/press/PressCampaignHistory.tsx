import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, MessageCircle, RotateCcw, Trash2, History, Eye } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export type CampaignPrefill = {
  canal: 'email' | 'whatsapp';
  nome: string;
  subject: string;
  body: string;
  alreadySentIds: string[];
  sourceCampaignId: string;
};

type Campaign = {
  id: string;
  tipo: string;
  nome: string;
  assunto: string | null;
  corpo: string;
  total_alvo: number;
  total_enviado: number;
  total_erro: number;
  status: string;
  sent_at: string | null;
  created_at: string;
};

type SendDetail = {
  id: string;
  contact_id: string;
  status: string;
  error: string | null;
  sent_at: string | null;
  contact: { veiculo: string; email: string | null; contato: string | null; municipio: string | null } | null;
};

type Props = { onReuse: (prefill: CampaignPrefill) => void };

export const PressCampaignHistory = ({ onReuse }: Props) => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [detailsOf, setDetailsOf] = useState<Campaign | null>(null);
  const [details, setDetails] = useState<SendDetail[]>([]);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('press_campaigns')
      .select('id,tipo,nome,assunto,corpo,total_alvo,total_enviado,total_erro,status,sent_at,created_at')
      .order('created_at', { ascending: false })
      .limit(50);
    setCampaigns((data as Campaign[]) ?? []);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const openDetails = async (c: Campaign) => {
    setDetailsOf(c);
    setDetailsLoading(true);
    setDetails([]);
    const { data } = await supabase
      .from('press_sends')
      .select('id,contact_id,status,error,sent_at,contact:press_contacts(veiculo,email,contato,municipio)')
      .eq('campaign_id', c.id)
      .order('sent_at', { ascending: false, nullsFirst: false });
    setDetails((data as any) ?? []);
    setDetailsLoading(false);
  };

  const reuse = async (c: Campaign) => {
    // Bloqueia TODOS os contatos que já receberam algum envio no mesmo canal (qualquer campanha),
    // para evitar duplicação entre campanhas — não só na campanha-fonte.
    const { data: sends } = await supabase
      .from('press_sends')
      .select('contact_id,campaign:press_campaigns!inner(tipo)')
      .eq('status', 'enviado')
      .eq('campaign.tipo', c.tipo);
    const alreadySentIds = Array.from(new Set((sends ?? []).map((s: any) => s.contact_id as string)));
    onReuse({
      canal: c.tipo === 'whatsapp' ? 'whatsapp' : 'email',
      nome: `${c.nome} (continuação)`,
      subject: c.assunto ?? '',
      body: c.corpo,
      alreadySentIds,
      sourceCampaignId: c.id,
    });
    toast({
      title: 'Conteúdo carregado',
      description: `${alreadySentIds.length} contato(s) já receberam por ${c.tipo} antes — serão bloqueados automaticamente.`,
    });
  };

  const remove = async (id: string, nome: string) => {
    if (!confirm(`Excluir do histórico a campanha "${nome}"? O log de envios também será removido.`)) return;
    await supabase.from('press_sends').delete().eq('campaign_id', id);
    const { error } = await supabase.from('press_campaigns').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Campanha removida' }); load(); }
  };

  return (
    <div>
      <h3 className="font-black uppercase text-sm mb-2 text-muted-foreground flex items-center gap-2">
        <History className="w-4 h-4" /> Histórico de disparos ({campaigns.length})
      </h3>
      {loading ? (
        <p className="text-muted-foreground text-sm">Carregando...</p>
      ) : campaigns.length === 0 ? (
        <Card className="p-6 text-center text-muted-foreground text-sm">
          Nenhum disparo realizado ainda.
        </Card>
      ) : (
        <div className="space-y-2">
          {campaigns.map(c => (
            <Card key={c.id} className="p-3 border-2">
              <div className="flex items-start gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="uppercase text-xs">
                      {c.tipo === 'whatsapp' ? <MessageCircle className="w-3 h-3 mr-1" /> : <Mail className="w-3 h-3 mr-1" />}
                      {c.tipo}
                    </Badge>
                    <div className="font-bold truncate">{c.nome}</div>
                  </div>
                  {c.assunto && (
                    <div className="text-xs text-muted-foreground truncate mt-1">
                      <strong>Assunto:</strong> {c.assunto}
                    </div>
                  )}
                  <div className="flex gap-2 mt-2 flex-wrap text-xs items-center">
                    <Badge variant="secondary">{c.total_enviado}/{c.total_alvo} enviados</Badge>
                    {c.total_erro > 0 && <Badge variant="destructive">{c.total_erro} erros</Badge>}
                    <span className="text-muted-foreground">
                      {new Date(c.sent_at ?? c.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1 flex-wrap">
                  <Button size="sm" variant="outline" onClick={() => openDetails(c)} title="Ver destinatários e status">
                    <Eye className="w-3 h-3 mr-1" /> Detalhes
                  </Button>
                  <Button size="sm" variant="default" onClick={() => reuse(c)} title="Reusar conteúdo para novos destinatários">
                    <RotateCcw className="w-3 h-3 mr-1" /> Reusar
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(c.id, c.nome)} title="Excluir do histórico">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={!!detailsOf} onOpenChange={(o) => !o && setDetailsOf(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle className="truncate">{detailsOf?.nome}</DialogTitle>
          </DialogHeader>
          {detailsOf && (
            <div className="flex gap-2 flex-wrap text-xs border-b pb-2">
              <Badge variant="secondary">{detailsOf.total_enviado}/{detailsOf.total_alvo} enviados</Badge>
              {detailsOf.total_erro > 0 && <Badge variant="destructive">{detailsOf.total_erro} erros</Badge>}
              <Badge variant="outline">{details.filter(d => d.status === 'pulado').length} pulados</Badge>
              <span className="text-muted-foreground ml-auto">
                {new Date(detailsOf.sent_at ?? detailsOf.created_at).toLocaleString('pt-BR')}
              </span>
            </div>
          )}
          <div className="overflow-auto flex-1">
            {detailsLoading ? (
              <p className="text-muted-foreground text-sm p-4">Carregando...</p>
            ) : details.length === 0 ? (
              <p className="text-muted-foreground text-sm p-4">Nenhum envio registrado.</p>
            ) : (
              <table className="w-full text-xs">
                <thead className="sticky top-0 bg-background border-b">
                  <tr className="text-left">
                    <th className="p-2">Status</th>
                    <th className="p-2">Veículo / Contato</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Quando</th>
                    <th className="p-2">Erro</th>
                  </tr>
                </thead>
                <tbody>
                  {details.map(d => (
                    <tr key={d.id} className="border-b hover:bg-muted/30">
                      <td className="p-2">
                        <Badge
                          variant={d.status === 'enviado' ? 'default' : d.status === 'erro' ? 'destructive' : 'secondary'}
                          className="text-[10px]"
                        >
                          {d.status}
                        </Badge>
                      </td>
                      <td className="p-2">
                        <div className="font-bold truncate max-w-[200px]">{d.contact?.veiculo ?? '—'}</div>
                        <div className="text-muted-foreground truncate max-w-[200px]">
                          {d.contact?.contato ?? ''}{d.contact?.municipio ? ` · ${d.contact.municipio}` : ''}
                        </div>
                      </td>
                      <td className="p-2 truncate max-w-[200px]">{d.contact?.email ?? '—'}</td>
                      <td className="p-2 whitespace-nowrap text-muted-foreground">
                        {d.sent_at ? new Date(d.sent_at).toLocaleString('pt-BR') : '—'}
                      </td>
                      <td className="p-2 text-destructive max-w-[200px] truncate" title={d.error ?? ''}>
                        {d.error ?? ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PressCampaignHistory;
