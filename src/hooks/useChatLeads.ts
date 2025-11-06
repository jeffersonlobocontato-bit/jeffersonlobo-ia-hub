import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface ChatLead {
  id: string;
  nome: string;
  apelido: string | null;
  whatsapp: string;
  mensagens: any[];
  interesses: string[];
  primeira_interacao: string;
  ultima_interacao: string;
  created_at: string;
}

export const useChatLeads = () => {
  return useQuery({
    queryKey: ['chat_leads'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('chat_leads')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as ChatLead[];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: true,
  });
};
