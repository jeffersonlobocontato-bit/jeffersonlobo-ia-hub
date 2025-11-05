import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookContent = () => {
  return useQuery({
    queryKey: ['book_content', Date.now()], // Force cache bust
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_content')
        .select('*')
        .maybeSingle();
      
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    gcTime: 0, // No cache
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
