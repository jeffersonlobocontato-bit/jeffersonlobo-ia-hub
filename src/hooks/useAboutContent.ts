import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useAboutContent = () => {
  return useQuery({
    queryKey: ['about_content'],
    queryFn: async () => {
      console.log('🔍 Fetching about content...');
      const { data, error } = await supabase
        .from('about_content')
        .select('*')
        .maybeSingle();
      
      console.log('📦 About data:', data);
      console.log('❌ About error:', error);
      
      if (error) throw error;
      return data;
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};

export const useServices = () => {
  return useQuery({
    queryKey: ['services'],
    queryFn: async () => {
      console.log('🔍 Fetching services...');
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('display_order');
      
      console.log('📦 Services data:', data);
      console.log('❌ Services error:', error);
      
      if (error) throw error;
      return data || [];
    },
    staleTime: 0,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
  });
};
