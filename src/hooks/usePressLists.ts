import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const BASE_PRESS_LIST_ID = '__base_completa_segmentada__';

export type PressList = {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
  total: number;
  com_email: number;
  com_whatsapp: number;
  virtual?: boolean;
};

const loadBaseList = async (): Promise<PressList | null> => {
  const { data } = await supabase
    .from('press_contacts')
    .select('email, whatsapp, opt_out, created_at')
    .order('created_at', { ascending: false })
    .limit(5000);

  const contacts = (data ?? []) as Array<{ email: string | null; whatsapp: string | null; opt_out: boolean | null; created_at: string | null }>;
  if (!contacts.length) return null;

  const eligible = contacts.filter(c => !c.opt_out);
  return {
    id: BASE_PRESS_LIST_ID,
    nome: 'Base completa segmentada',
    descricao: 'Todos os contatos importados, filtráveis por região e veículo',
    created_at: contacts[0]?.created_at ?? new Date().toISOString(),
    total: eligible.length,
    com_email: eligible.filter(c => !!c.email).length,
    com_whatsapp: eligible.filter(c => !!c.whatsapp).length,
    virtual: true,
  };
};

export const usePressLists = () => {
  const [lists, setLists] = useState<PressList[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const baseList = await loadBaseList();
    const { data: listRows } = await supabase
      .from('press_lists')
      .select('id, nome, descricao, created_at')
      .order('created_at', { ascending: false });

    if (!listRows?.length) {
      setLists(baseList ? [baseList] : []);
      setLoading(false);
      return;
    }

    const ids = listRows.map(l => l.id);
    const { data: members } = await supabase
      .from('press_list_members')
      .select('list_id, contact_id, press_contacts!inner(email, whatsapp, opt_out)')
      .in('list_id', ids);

    const stats: Record<string, { total: number; com_email: number; com_whatsapp: number }> = {};
    for (const id of ids) stats[id] = { total: 0, com_email: 0, com_whatsapp: 0 };
    for (const m of (members ?? []) as any[]) {
      const c = m.press_contacts;
      if (!c || c.opt_out) continue;
      stats[m.list_id].total++;
      if (c.email) stats[m.list_id].com_email++;
      if (c.whatsapp) stats[m.list_id].com_whatsapp++;
    }

    const realLists = listRows.map(l => ({ ...l, ...stats[l.id] }));
    setLists(baseList ? [baseList, ...realLists] : realLists);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  return { lists, loading, reload: load };
};

/** Resolve a união de contatos elegíveis (com email OU whatsapp, sem opt-out) para um conjunto de listas. */
export const fetchContactsForLists = async (
  listIds: string[],
  canal: 'email' | 'whatsapp',
) => {
  if (!listIds.length) return [];

  if (listIds.includes(BASE_PRESS_LIST_ID)) {
    const { data } = await supabase
      .from('press_contacts')
      .select('*')
      .order('regiao', { ascending: true })
      .order('municipio', { ascending: true })
      .limit(5000);

    return ((data ?? []) as any[]).filter(c => {
      if (!c || c.opt_out) return false;
      if (canal === 'email' && !c.email) return false;
      if (canal === 'whatsapp' && !c.whatsapp) return false;
      return true;
    });
  }

  const { data } = await supabase
    .from('press_list_members')
    .select('contact_id, press_contacts!inner(*)')
    .in('list_id', listIds);

  const seen = new Set<string>();
  const out: any[] = [];
  for (const row of (data ?? []) as any[]) {
    const c = row.press_contacts;
    if (!c || seen.has(c.id) || c.opt_out) continue;
    if (canal === 'email' && !c.email) continue;
    if (canal === 'whatsapp' && !c.whatsapp) continue;
    seen.add(c.id);
    out.push(c);
  }
  return out;
};
