-- Gerador de conteúdo IA para Instagram (MVP): pesquisa o tema de IA/marketing
-- mais comentado do dia, gera criativos (Card, Carrossel, Story) com imagem via
-- IA + texto, e deixa tudo em fila de revisão no admin — nunca publica sozinho.
-- Mesma espinha dorsal do pipeline de conteúdo do blog (content_pipeline.sql).

-- Fontes RSS usadas para detectar o tema do dia, editáveis no admin.
CREATE TABLE IF NOT EXISTS public.instagram_trend_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  last_fetch_status TEXT,
  last_fetch_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_trend_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage instagram trend sources"
    ON public.instagram_trend_sources FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage instagram trend sources"
    ON public.instagram_trend_sources FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Uma linha por rodada de geração: tema escolhido e origem da pesquisa.
CREATE TABLE IF NOT EXISTS public.instagram_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL DEFAULT CURRENT_DATE,
  status TEXT NOT NULL DEFAULT 'researching'
    CHECK (status IN ('researching', 'drafting', 'pending_review', 'failed')),
  topic_title TEXT,
  topic_summary TEXT,
  topic_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can view instagram runs"
    ON public.instagram_runs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage instagram runs"
    ON public.instagram_runs FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_instagram_runs_date ON public.instagram_runs(run_date DESC);

CREATE TRIGGER update_instagram_runs_updated_at
BEFORE UPDATE ON public.instagram_runs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Um criativo por formato (card | carousel | story), ligado à run que o gerou.
-- "slides" carrega [{order, headline, body, image_url, image_prompt}] — um
-- item só para card/story, vários para carrossel. "final_image_urls" só é
-- preenchido quando o admin aprova (export do canvas de composição).
CREATE TABLE IF NOT EXISTS public.instagram_creatives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id UUID NOT NULL REFERENCES public.instagram_runs(id) ON DELETE CASCADE,
  format TEXT NOT NULL CHECK (format IN ('card', 'carousel', 'story')),
  caption TEXT,
  hashtags TEXT[] NOT NULL DEFAULT '{}',
  slides JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'pending_review'
    CHECK (status IN ('pending_review', 'approved', 'rejected')),
  final_image_urls TEXT[] NOT NULL DEFAULT '{}',
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.instagram_creatives ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage instagram creatives"
    ON public.instagram_creatives FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage instagram creatives"
    ON public.instagram_creatives FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_instagram_creatives_run ON public.instagram_creatives(run_id);
CREATE INDEX IF NOT EXISTS idx_instagram_creatives_status ON public.instagram_creatives(status) WHERE status = 'pending_review';

CREATE TRIGGER update_instagram_creatives_updated_at
BEFORE UPDATE ON public.instagram_creatives
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Bucket dos criativos (imagens de fundo geradas por IA + PNGs finais compostos)
INSERT INTO storage.buckets (id, name, public)
VALUES ('instagram-creatives', 'instagram-creatives', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Instagram creatives public read" ON storage.objects;
CREATE POLICY "Instagram creatives public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'instagram-creatives');

DROP POLICY IF EXISTS "Admins upload instagram creatives" ON storage.objects;
CREATE POLICY "Admins upload instagram creatives"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'instagram-creatives' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update instagram creatives" ON storage.objects;
CREATE POLICY "Admins update instagram creatives"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'instagram-creatives' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete instagram creatives" ON storage.objects;
CREATE POLICY "Admins delete instagram creatives"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'instagram-creatives' AND has_role(auth.uid(), 'admin'::app_role));

-- Service role também precisa gravar (é a edge function quem sobe as imagens geradas)
DROP POLICY IF EXISTS "Service role manages instagram creatives" ON storage.objects;
CREATE POLICY "Service role manages instagram creatives"
  ON storage.objects FOR ALL
  USING (bucket_id = 'instagram-creatives' AND auth.role() = 'service_role')
  WITH CHECK (bucket_id = 'instagram-creatives' AND auth.role() = 'service_role');

-- Fontes iniciais de pesquisa de tendência (RSS de IA e marketing), editável no admin.
INSERT INTO public.instagram_trend_sources (name, url) VALUES
  ('TechCrunch — IA', 'https://techcrunch.com/category/artificial-intelligence/feed/'),
  ('MIT Technology Review — IA', 'https://www.technologyreview.com/topic/artificial-intelligence/feed'),
  ('Marketing Dive', 'https://www.marketingdive.com/feeds/news/'),
  ('Startups.com.br', 'https://startups.com.br/feed/')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASSO MANUAL — não incluído nesta migration
-- ============================================================
-- Automação diária (opcional, desligada por padrão): registrar via
-- pg_cron + pg_net no SQL Editor do Supabase, reaproveitando o mesmo
-- secret de vault já usado pelo pipeline de conteúdo do blog:
--
--   select cron.schedule(
--     'instagram-content-fetch',
--     '0 11 * * *',  -- 11:00 UTC = 08:00 BRT
--     $$
--     select net.http_post(
--       url := 'https://cgydeldzhnfyexphaheq.supabase.co/functions/v1/instagram-content-fetch',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'email_queue_service_role_key')
--       ),
--       body := '{}'::jsonb
--     );
--     $$
--   );
