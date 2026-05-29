import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageCircle, RotateCcw, Trash2, History } from 'lucide-react';
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

type Props = { onReuse: (prefill: CampaignPrefill) => void };

export const PressCampaignHistory = ({ onReuse }: Props) => {
  const { toast } = useToast();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

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

  const reuse = async (c: Campaign) => {
    const { data: sends } = await supabase
      .from('press_sends')
      .select('contact_id,status')
      .eq('campaign_id', c.id)
      .eq('status', 'enviado');
    const alreadySentIds = (sends ?? []).map((s: any) => s.contact_id as string);
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
      description: `${alreadySentIds.length} destinatário(s) já enviado(s) serão excluídos automaticamente.`,
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
                  <div className="flex gap-2 mt-2 flex-wrap text-xs">
                    <Badge variant="secondary">{c.total_enviado}/{c.total_alvo} enviados</Badge>
                    {c.total_erro > 0 && <Badge variant="destructive">{c.total_erro} erros</Badge>}
                    <span className="text-muted-foreground">
                      {new Date(c.sent_at ?? c.created_at).toLocaleString('pt-BR')}
                    </span>
                  </div>
                </div>
                <div className="flex gap-1">
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
    </div>
  );
};

export default PressCampaignHistory;
