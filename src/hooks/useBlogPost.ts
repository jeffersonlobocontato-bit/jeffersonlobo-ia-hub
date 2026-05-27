import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useBlogPost = (slug: string | undefined) => {
  return useQuery({
    queryKey: ['blog_post', slug],
    enabled: !!slug,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .eq('slug', slug!)
        .eq('active', true)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useRelatedPosts = (slug: string | undefined, category: string | undefined) => {
  return useQuery({
    queryKey: ['related_posts', slug, category],
    enabled: !!slug && !!category,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('id, slug, title, excerpt, category, date, cover_image, cover_alt, linkedin_url, content_md')
        .eq('active', true)
        .eq('category', category!)
        .neq('slug', slug!)
        .order('date', { ascending: false })
        .limit(3);
      if (error) throw error;
      return data || [];
    },
    staleTime: 1000 * 60 * 5,
  });
};
