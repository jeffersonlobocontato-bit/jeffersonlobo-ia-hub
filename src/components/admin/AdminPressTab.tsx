import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import type { PressContact } from '@/lib/press-utils';
import { PressContactsTable } from './press/PressContactsTable';
import { PressCampaignsTab } from './press/PressCampaignsTab';
import { PressEmailCampaignTab } from './press/PressEmailCampaignTab';

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
      <Card className="p-3 border-l-4 border-green-500 bg-green-500/10 text-sm">
        <div className="flex gap-2">
          <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />
          <div>
            <strong>Email em massa ativo:</strong> conectado ao <strong>Brevo</strong> (300 emails/dia no plano Free).
            Remetente: <code>contato@jeffersonlobo.tech</code>. Para máxima entregabilidade, valide SPF/DKIM
            do domínio no painel do Brevo. <strong>WhatsApp 1-a-1</strong> também disponível.
          </div>
        </div>
      </Card>

      <Tabs defaultValue="base">
        <TabsList>
          <TabsTrigger value="base">Base de Contatos ({contacts.length})</TabsTrigger>
          <TabsTrigger value="whatsapp">WhatsApp ({selectedIds.size})</TabsTrigger>
          <TabsTrigger value="email">Email ({selectedIds.size})</TabsTrigger>
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
        <TabsContent value="whatsapp" className="mt-4">
          <PressCampaignsTab
            selectedContacts={selectedContacts}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        </TabsContent>
        <TabsContent value="email" className="mt-4">
          <PressEmailCampaignTab
            selectedContacts={selectedContacts}
            onClearSelection={() => setSelectedIds(new Set())}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminPressTab;
