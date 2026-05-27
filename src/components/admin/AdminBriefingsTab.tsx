import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Trash2, Mail, MessageCircle, Building2, Calendar, MapPin, Users, RefreshCw } from 'lucide-react';

type Briefing = {
  id: string;
  nome: string;
  empresa: string | null;
  cargo: string | null;
  email: string;
  whatsapp: string | null;
  tipo: string;
  data_evento: string | null;
  formato: string | null;
  publico: string | null;
  cidade: string | null;
  mensagem: string | null;
  status: string;
  created_at: string;
};

const STATUSES = ['novo', 'em_contato', 'proposta_enviada', 'fechado', 'descartado'];

export const AdminBriefingsTab = () => {
  const { toast } = useToast();
  const [items, setItems] = useState<Briefing[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('briefing_requests')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) toast({ title: 'Erro ao carregar', description: error.message, variant: 'destructive' });
    setItems((data ?? []) as unknown as Briefing[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string) => {
    const { error } = await supabase.from('briefing_requests').update({ status }).eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Status atualizado' }); load(); }
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este briefing?')) return;
    const { error } = await supabase.from('briefing_requests').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Excluído' }); load(); }
  };

  if (loading) return <div className="text-muted-foreground">Carregando briefings...</div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Solicitações de proposta</h2>
          <p className="text-sm text-muted-foreground">{items.length} briefings recebidos.</p>
        </div>
        <Button variant="outline" size="sm" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
      </div>

      {items.length === 0 && (
        <Card className="p-8 text-center text-muted-foreground">Nenhum briefing recebido ainda.</Card>
      )}

      <div className="space-y-3">
        {items.map((b) => (
          <Card key={b.id} className="p-5 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-lg font-bold">{b.nome}</h3>
                  <Badge variant="secondary">{b.tipo}</Badge>
                  <Badge>{b.status}</Badge>
                </div>
                <div className="text-sm text-muted-foreground flex flex-wrap gap-x-4 gap-y-1">
                  {b.empresa && <span className="flex items-center gap-1"><Building2 className="w-3 h-3" />{b.empresa}{b.cargo ? ` — ${b.cargo}` : ''}</span>}
                  {b.cidade && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{b.cidade}</span>}
                  {b.data_evento && <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{new Date(b.data_evento).toLocaleDateString('pt-BR')}</span>}
                  {b.publico && <span className="flex items-center gap-1"><Users className="w-3 h-3" />{b.publico}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Select value={b.status} onValueChange={(v) => updateStatus(b.id, v)}>
                  <SelectTrigger className="w-44 h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
                <Button variant="destructive" size="icon" onClick={() => remove(b.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-sm">
              <Button asChild size="sm" variant="outline">
                <a href={`mailto:${b.email}`}><Mail className="w-3 h-3 mr-1" />{b.email}</a>
              </Button>
              {b.whatsapp && (
                <Button asChild size="sm" variant="outline">
                  <a href={`https://wa.me/${b.whatsapp.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
                    <MessageCircle className="w-3 h-3 mr-1" />{b.whatsapp}
                  </a>
                </Button>
              )}
              {b.formato && <Badge variant="outline">{b.formato}</Badge>}
            </div>

            {b.mensagem && (
              <div className="text-sm bg-muted/40 border-l-2 border-primary/40 p-3 whitespace-pre-wrap">
                {b.mensagem}
              </div>
            )}

            <div className="text-xs text-muted-foreground">
              Recebido em {new Date(b.created_at).toLocaleString('pt-BR')}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AdminBriefingsTab;
