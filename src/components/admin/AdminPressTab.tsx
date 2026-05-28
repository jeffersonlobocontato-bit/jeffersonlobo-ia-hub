import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';
import type { PressContact } from '@/lib/press-utils';
import { PressContactsTable } from './press/PressContactsTable';
import { PressCampaignsTab } from './press/PressCampaignsTab';

export const AdminPressTab = () => {
  const [contacts, setContacts] = useState<PressContact[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

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

  const selectedContacts = contacts.filter(c => selectedIds.has(c.id));

  return (
    <div className="space-y-4">
      <Card className="p-3 border-l-4 border-yellow-500 bg-yellow-500/10 text-sm">
        <div className="flex gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong>Email em massa:</strong> não está disponível ainda. O Lovable Emails é só transacional (1-a-1).
            Para disparo de email para a base de imprensa, precisamos plugar um conector de marketing (recomendo <strong>Brevo</strong>:
            300 emails/dia grátis, conector nativo no Lovable). Me avise para habilitarmos.
            Por enquanto, <strong>WhatsApp 1-a-1</strong> está 100% funcional abaixo.
          </div>
        </div>
      </Card>

      <Tabs defaultValue="base">
        <TabsList>
          <TabsTrigger value="base">Base de Contatos ({contacts.length})</TabsTrigger>
          <TabsTrigger value="campanha">Campanha WhatsApp ({selectedIds.size} selecionados)</TabsTrigger>
        </TabsList>
        <TabsContent value="base" className="mt-4">
          {loading ? <p className="text-muted-foreground">Carregando...</p> : (
            <PressContactsTable
              contacts={contacts}
              selectedIds={selectedIds}
              setSelectedIds={setSelectedIds}
              reload={load}
            />
          )}
        </TabsContent>
        <TabsContent value="campanha" className="mt-4">
          <PressCampaignsTab
            selectedContacts={selectedContacts}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPressTab;
