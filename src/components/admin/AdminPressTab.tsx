import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, Plus, Upload, Trash2, Users, Mail, MessageCircle } from 'lucide-react';
import type { PressContact } from '@/lib/press-utils';
import { PressContactsTable } from './press/PressContactsTable';
import { PressImportDialog } from './press/PressImportDialog';
import { PressCampaignWizard } from './press/PressCampaignWizard';
import { usePressLists } from '@/hooks/usePressLists';
import { useToast } from '@/hooks/use-toast';

export const AdminPressTab = () => {
  const { toast } = useToast();
  const [contacts, setContacts] = useState<PressContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [showBase, setShowBase] = useState(false);
  const [baseSelected, setBaseSelected] = useState<Set<string>>(new Set());
  const { lists, loading: loadingLists, reload: reloadLists } = usePressLists();

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('press_contacts')
      .select('*')
      .order('regiao', { ascending: true })
      .order('municipio', { ascending: true })
      .limit(5000);
    setContacts((data as PressContact[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const deleteList = async (id: string, nome: string) => {
    if (!confirm(`Excluir a lista "${nome}"? Os contatos permanecem na base — só a lista é removida.`)) return;
    const { error } = await supabase.from('press_lists').delete().eq('id', id);
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' });
    else { toast({ title: 'Lista excluída' }); reloadLists(); }
  };

  return (
    <div className="space-y-4">
      <Card className="p-3 border-l-4 border-green-500 bg-green-500/10 text-sm">
        <div className="flex gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong>Fluxo:</strong> cada importação de XLSX cria uma <strong>lista</strong>. Para disparar,
            clique em <strong>Novo disparo</strong>, escolha WhatsApp ou Email, marque uma ou mais listas e escreva o conteúdo.
          </div>
        </div>
      </Card>

      <div className="flex flex-wrap gap-2">
        <Button size="lg" onClick={() => setWizardOpen(true)}>
          <Plus className="w-4 h-4 mr-1" /> Novo disparo
        </Button>
        <Button size="lg" variant="outline" onClick={() => setImportOpen(true)}>
          <Upload className="w-4 h-4 mr-1" /> Importar XLSX (nova lista)
        </Button>
        <Button size="lg" variant="ghost" onClick={() => setShowBase(s => !s)} className="ml-auto">
          <Users className="w-4 h-4 mr-1" /> {showBase ? 'Ocultar' : 'Ver'} base completa ({contacts.length})
        </Button>
      </div>

      {/* LISTAS */}
      <div>
        <h3 className="font-black uppercase text-sm mb-2 text-muted-foreground">Listas ({lists.length})</h3>
        {loadingLists ? (
          <p className="text-muted-foreground text-sm">Carregando...</p>
        ) : lists.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">
            Nenhuma lista ainda. Clique em <strong>Importar XLSX</strong> acima para criar a primeira.
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {lists.map(l => (
              <Card key={l.id} className="p-4 border-2 hover:border-primary transition-colors">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="font-bold truncate">{l.nome}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {new Date(l.created_at).toLocaleDateString('pt-BR')}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" onClick={() => deleteList(l.id, l.nome)} title="Excluir lista">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
                <div className="flex gap-3 mt-3 text-xs">
                  <Badge variant="outline" className="font-mono">{l.total} total</Badge>
                  <Badge variant="secondary"><Mail className="w-3 h-3 mr-1" />{l.com_email}</Badge>
                  <Badge variant="secondary"><MessageCircle className="w-3 h-3 mr-1" />{l.com_whatsapp}</Badge>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* BASE COMPLETA (collapsible) */}
      {showBase && (
        <div>
          <h3 className="font-black uppercase text-sm mb-2 text-muted-foreground">Base completa</h3>
          {loading ? <p className="text-muted-foreground">Carregando...</p> : (
            <PressContactsTable
              contacts={contacts}
              selectedIds={new Set()}
              setSelectedIds={() => {}}
              reload={() => { load(); reloadLists(); }}
            />
          )}
        </div>
      )}

      <PressImportDialog
        open={importOpen}
        onOpenChange={setImportOpen}
        onDone={() => { load(); reloadLists(); }}
      />
      <PressCampaignWizard open={wizardOpen} onOpenChange={setWizardOpen} />
    </div>
  );
};

export default AdminPressTab;
