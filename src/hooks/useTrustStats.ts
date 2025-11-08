import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useTrustStats = () => {
  return useQuery({
    queryKey: ['trust-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('trust_stats')
        .select('*')
        .eq('active', true)
        .order('display_order');

      if (error) throw error;
      return data;
    },
  });
};
