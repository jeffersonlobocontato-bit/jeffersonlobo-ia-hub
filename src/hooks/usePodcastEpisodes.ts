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
}

export const usePodcastEpisodes = () => {
  return useQuery({
    queryKey: ['podcast-episodes'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcast_episodes')
        .select('*')
        .eq('active', true)
        .order('published_date', { ascending: false });

      if (error) throw error;
      return data as PodcastEpisode[];
    },
  });
};