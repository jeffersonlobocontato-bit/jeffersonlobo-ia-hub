import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PodcastEpisode {
  id: string;
  title: string;
  description: string;
  published_date: string;
  duration: string;
  audio_url: string;
  episode_number?: number;
  season_number?: number;
  image_url?: string;
  active: boolean;
  updated_at?: string;
}

/**
 * Site público: só episódios ativos. Admin passa { includeInactive: true } para
 * ver também os desativados — sem isso, episódio que entra desativado (ex.: lote 1
 * do O Código Lobo) some do painel e nunca pode ser ativado.
 */
export const usePodcastEpisodes = ({ includeInactive = false }: { includeInactive?: boolean } = {}) => {
  return useQuery({
    queryKey: ['podcast-episodes', includeInactive ? 'all' : 'active'],
    queryFn: async () => {
      let query = supabase.from('podcast_episodes').select('*');
      if (!includeInactive) query = query.eq('active', true);
      const { data, error } = await query.order('published_date', { ascending: false });

      if (error) throw error;
      return data as PodcastEpisode[];
    },
  });
};