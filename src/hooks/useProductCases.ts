import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

// product_cases ainda não está no types.ts gerado (mesmo padrão de cast usado no admin).
const db = supabase as any;

export type ProductCaseMockup = 'map' | 'dashboard' | 'chat' | 'news';

export interface ProductCase {
  id: string;
  name: string;
  domain: string;
  category: string;
  description: string;
  tags: string[];
  mockup: ProductCaseMockup;
  image_url: string | null;
  image_alt: string | null;
  focal_x: number;
  focal_y: number;
  zoom: number;
  display_order: number;
}

export const useProductCases = () => {
  return useQuery<ProductCase[]>({
    queryKey: ['product-cases'],
    queryFn: async () => {
      const { data, error } = await db
        .from('product_cases')
        .select('*')
        .eq('active', true)
        .order('display_order');
      if (error) throw error;
      return (data ?? []) as ProductCase[];
    },
  });
};
