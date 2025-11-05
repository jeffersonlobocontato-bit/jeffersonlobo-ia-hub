import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAboutContent = () => {
  return useQuery({
    queryKey: ['about_content'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('about_content')
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

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('display_order');
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 0, // Sem cache para mobile
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
