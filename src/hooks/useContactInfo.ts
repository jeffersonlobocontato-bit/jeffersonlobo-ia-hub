import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useContactInfo = () => {
  return useQuery({
    queryKey: ['contact_info'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contact_info')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 0, // Sem cache para mobile
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
