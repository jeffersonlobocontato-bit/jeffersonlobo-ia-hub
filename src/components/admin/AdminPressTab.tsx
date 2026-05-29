import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Plus, Upload, Trash2, Users, Mail, MessageCircle, BarChart3, Settings,
} from 'lucide-react';
import type { PressContact } from '@/lib/press-utils';
import { PressContactsTable } from './press/PressContactsTable';
import { PressImportDialog } from './press/PressImportDialog';
import { PressDispatchFlow } from './press/PressDispatchFlow';
import { PressCampaignWizard, type WizardPrefill } from './press/PressCampaignWizard';
import { PressCampaignHistory, type CampaignPrefill } from './press/PressCampaignHistory';
import { PressCampaignDashboard } from './press/PressCampaignDashboard';
import { usePressLists } from '@/hooks/usePressLists';
import { useAdvancedMode } from '@/hooks/use-advanced-mode';
import { useToast } from '@/hooks/use-toast';

export const AdminPressTab = () => {
  const { toast } = useToast();
  const { advanced, setAdvanced } = useAdvancedMode();
  const [contacts, setContacts] = useState<PressContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [importOpen, setImportOpen] = useState(false);
  const [dispatchOpen, setDispatchOpen] = useState(false);
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardPrefill, setWizardPrefill] = useState<WizardPrefill | null>(null);
  const [historyKey, setHistoryKey] = useState(0);
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
    <Tabs defaultValue="disparos" className="space-y-4">
      <TabsList>
        <TabsTrigger value="disparos"><Mail className="w-4 h-4 mr-1" /> Disparos</TabsTrigger>
        <TabsTrigger value="dashboard"><BarChart3 className="w-4 h-4 mr-1" /> Dashboard</TabsTrigger>
      </TabsList>

      <TabsContent value="dashboard">
        <PressCampaignDashboard />
      </TabsContent>

      <TabsContent value="disparos" className="space-y-4">
        {/* AÇÃO PRINCIPAL — 1 botão gigante */}
        <Card className="p-6 border-4 border-foreground shadow-[6px_6px_0_0_hsl(var(--foreground))]">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <h2 className="font-black uppercase text-2xl">Disparar WhatsApp</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Fluxo guiado em 3 passos: escolher lista → escrever mensagem → enviar.
              </p>
            </div>
            <Button
              size="lg"
              onClick={() => setDispatchOpen(true)}
              className="h-16 px-8 text-base font-black uppercase w-full sm:w-auto"
            >
              <MessageCircle className="w-5 h-5 mr-2" /> Começar disparo
            </Button>
          </div>
        </Card>

        {/* Toggle avançado discreto */}
        <div className="flex items-center justify-end gap-2">
          <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
            <Settings className="w-3 h-3" />
            <Switch checked={advanced} onCheckedChange={setAdvanced} />
            Modo avançado
          </label>
        </div>

        {/* Recursos avançados — só aparecem com toggle ligado */}
        {advanced && (
          <Card className="p-4 border-dashed border-2 space-y-3">
            <div className="text-xs font-bold uppercase text-muted-foreground">Ferramentas avançadas</div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportOpen(true)}>
                <Upload className="w-3 h-3 mr-1" /> Importar XLSX
              </Button>
              <Button variant="outline" size="sm" onClick={() => { setWizardPrefill(null); setWizardOpen(true); }}>
                <Plus className="w-3 h-3 mr-1" /> Wizard clássico (email + WhatsApp em lote)
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setShowBase(s => !s)}>
                <Users className="w-3 h-3 mr-1" /> {showBase ? 'Ocultar' : 'Ver'} base ({contacts.length})
              </Button>
            </div>
          </Card>
        )}

        {/* LISTAS */}
        <div>
          <h3 className="font-black uppercase text-sm mb-2 text-muted-foreground">Listas ({lists.length})</h3>
          {loadingLists ? (
            <p className="text-muted-foreground text-sm">Carregando...</p>
          ) : lists.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground space-y-3">
              <p>Nenhuma lista ainda.</p>
              <Button onClick={() => setImportOpen(true)}>
                <Upload className="w-4 h-4 mr-2" /> Importar primeira lista
              </Button>
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
                    {!l.virtual && advanced && (
                      <Button size="icon" variant="ghost" onClick={() => deleteList(l.id, l.nome)} title="Excluir lista">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2 mt-3 text-xs flex-wrap">
                    <Badge variant="outline" className="font-mono">{l.total}</Badge>
                    <Badge variant="secondary"><Mail className="w-3 h-3 mr-1" />{l.com_email}</Badge>
                    <Badge variant="secondary"><MessageCircle className="w-3 h-3 mr-1" />{l.com_whatsapp}</Badge>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* HISTÓRICO */}
        <PressCampaignHistory
          key={historyKey}
          onReuse={(p: CampaignPrefill) => {
            setWizardPrefill({
              canal: p.canal,
              nome: p.nome,
              subject: p.subject,
              body: p.body,
              alreadySentIds: p.alreadySentIds,
            });
            setWizardOpen(true);
          }}
        />

        {/* BASE COMPLETA (avançado) */}
        {advanced && showBase && (
          <div>
            <h3 className="font-black uppercase text-sm mb-2 text-muted-foreground">Base completa</h3>
            {loading ? <p className="text-muted-foreground">Carregando...</p> : (
              <PressContactsTable
                contacts={contacts}
                selectedIds={baseSelected}
                setSelectedIds={setBaseSelected}
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
        <PressDispatchFlow
          open={dispatchOpen}
          onOpenChange={(o) => {
            setDispatchOpen(o);
            if (!o) { setHistoryKey(k => k + 1); load(); }
          }}
          onDone={() => { setHistoryKey(k => k + 1); load(); }}
        />
        <PressCampaignWizard
          open={wizardOpen}
          onOpenChange={(o) => {
            setWizardOpen(o);
            if (!o) { setWizardPrefill(null); setHistoryKey(k => k + 1); }
          }}
          prefill={wizardPrefill}
        />
      </TabsContent>
    </Tabs>
  );
};

export default AdminPressTab;
