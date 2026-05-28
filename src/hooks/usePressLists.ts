import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type PressList = {
  id: string;
  nome: string;
  descricao: string | null;
  created_at: string;
  total: number;
  com_email: number;
  com_whatsapp: number;
};

export const usePressLists = () => {
  const [lists, setLists] = useState<PressList[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { data: listRows } = await supabase
      .from('press_lists')
      .select('id, nome, descricao, created_at')
      .order('created_at', { ascending: false });

    if (!listRows?.length) {
      setLists([]);
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

    setLists(listRows.map(l => ({ ...l, ...stats[l.id] })));
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
