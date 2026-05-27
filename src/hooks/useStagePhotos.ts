import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useStagePhotos = () => {
  return useQuery({
    queryKey: ['stage-photos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('stage_photos')
        .select('*')
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      return data ?? [];
    },
  });
};
