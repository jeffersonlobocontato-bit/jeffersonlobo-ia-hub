import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export type PalestraFormat = {
  id: string;
  slug: string;
  title: string;
  kicker: string | null;
  description: string;
  audience: string | null;
  duration: string | null;
  deliverables: string[] | null;
  icon: string | null;
  cta_label: string | null;
  display_order: number;
  active: boolean | null;
  image_url: string | null;
  image_position: string | null;
};

export const usePalestraFormats = () => {
  return useQuery({
    queryKey: ['palestra-formats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('palestra_formats')
        .select('*')
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      return (data ?? []) as unknown as PalestraFormat[];
    },
  });
};
