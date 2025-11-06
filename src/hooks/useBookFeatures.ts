import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBookFeatures = () => {
  return useQuery({
    queryKey: ['book_features'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_features')
        .select('*')
        .eq('active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};

export const useBookReviews = () => {
  return useQuery({
    queryKey: ['book_reviews'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('book_reviews')
        .select('*')
        .eq('active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });
};
