-- Tabela para armazenar episódios do podcast
CREATE TABLE IF NOT EXISTS public.podcast_episodes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  published_date timestamp with time zone NOT NULL,
  duration text,
  audio_url text NOT NULL,
  episode_number integer,
  season_number integer,
  image_url text,
  guid text UNIQUE NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para configurações do podcast
CREATE TABLE IF NOT EXISTS public.podcast_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  rss_url text NOT NULL,
  podcast_title text NOT NULL,
  podcast_description text,
  podcast_image text,
  last_sync timestamp with time zone,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id)
);

-- RLS para podcast_episodes
ALTER TABLE public.podcast_episodes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active episodes"
ON public.podcast_episodes
FOR SELECT
USING (active = true);

CREATE POLICY "Admins can manage episodes"
ON public.podcast_episodes
FOR ALL
USING (has_role(auth.uid(), 'admin'));

-- RLS para podcast_config
ALTER TABLE public.podcast_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view podcast config"
ON public.podcast_config
FOR SELECT
USING (true);

CREATE POLICY "Only admins can update podcast config"
ON public.podcast_config
FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_podcast_episodes_updated_at
BEFORE UPDATE ON public.podcast_episodes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_podcast_config_updated_at
BEFORE UPDATE ON public.podcast_config
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir configuração inicial
INSERT INTO public.podcast_config (rss_url, podcast_title, podcast_description)
VALUES (
  'https://anchor.fm/s/10b2292e4/podcast/rss',
  'Podcast Jefferson Lobo',
  'Explorando o futuro da tecnologia e inteligência artificial'
)
ON CONFLICT DO NOTHING;