import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PodcastSeries {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  position: number;
}

/** Séries do podcast (temporadas temáticas), na ordem de exibição. */
export const usePodcastSeries = () => {
  return useQuery({
    queryKey: ['podcast-series'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcast_series')
        .select('id, title, slug, description, position')
        .order('position', { ascending: true })
        .order('title', { ascending: true });
      // Antes da migration de séries ser aplicada a tabela não existe: o site segue sem séries.
      if (error) {
        console.warn('podcast_series indisponível', error.message);
        return [] as PodcastSeries[];
      }
      return (data || []) as PodcastSeries[];
    },
  });
};
