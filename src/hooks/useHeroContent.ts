import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useHeroContent = () => {
  return useQuery({
    queryKey: ['hero_content'],
    queryFn: async () => {
      console.log('🔍 Fetching hero content...');
      const { data, error } = await supabase
        .from('hero_content')
        .select('*')
        .maybeSingle();
      
      console.log('📦 Hero data:', data);
      console.log('❌ Hero error:', error);
      
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
