import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookFeatures = () => {
  return useQuery({
    queryKey: ['book_features', Date.now()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_features')
        .select('*')
        .eq('active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};

export const useBookReviews = () => {
  return useQuery({
    queryKey: ['book_reviews', Date.now()],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_reviews')
        .select('*')
        .eq('active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
};
