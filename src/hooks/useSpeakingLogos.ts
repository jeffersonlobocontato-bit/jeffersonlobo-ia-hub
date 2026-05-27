import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSpeakingLogos = () => {
  return useQuery({
    queryKey: ['speaking-logos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('speaking_logos')
        .select('*')
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      return data ?? [];
    },
  });
};
