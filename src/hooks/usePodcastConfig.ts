import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PodcastConfig {
  id: string;
  rss_url: string;
  podcast_title: string;
  podcast_description?: string;
  podcast_image?: string;
  last_sync?: string;
}

export const usePodcastConfig = () => {
  return useQuery({
    queryKey: ['podcast-config'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('podcast_config')
        .select('*')
        .single();

      if (error) throw error;
      return data as PodcastConfig;
    },
  });
};