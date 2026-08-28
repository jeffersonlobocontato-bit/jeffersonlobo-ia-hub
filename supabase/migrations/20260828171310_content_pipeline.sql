-- Pipeline de conteúdo diário: curadoria de fontes oficiais (RSS) + coluna
-- "Vozes que importam" + artigo autoral de Jefferson, com aprovação antes
-- de publicar e publicação agendada às 10h (America/Sao_Paulo, UTC-3).

-- Fontes monitoradas pelo pipeline. "kind" é só informativo — tanto RSS de
-- blog/imprensa quanto o feed público de vídeos de um canal do YouTube
-- (https://www.youtube.com/feeds/videos.xml?channel_id=...) são XML e usam
-- o mesmo parser, sem precisar de API key.
CREATE TABLE IF NOT EXISTS public.content_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  kind TEXT NOT NULL DEFAULT 'rss' CHECK (kind IN ('rss', 'youtube')),
  url TEXT NOT NULL,
  person_name TEXT,
  person_title TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  last_fetch_status TEXT,
  last_fetch_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can manage content sources"
    ON public.content_sources FOR ALL
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'))
    WITH CHECK (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage content sources"
    ON public.content_sources FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Uma linha por dia de execução do pipeline: rastreia o que foi coletado,
-- os dois rascunhos gerados e o estado de aprovação/publicação.
CREATE TABLE IF NOT EXISTS public.content_pipeline_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_date DATE NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'fetching'
    CHECK (status IN ('fetching', 'drafting', 'pending_review', 'published', 'failed')),
  curation_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  authored_post_id UUID REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  raw_items JSONB,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.content_pipeline_runs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY "Admins can view pipeline runs"
    ON public.content_pipeline_runs FOR SELECT
    TO authenticated
    USING (public.has_role(auth.uid(), 'admin'));
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE POLICY "Service role can manage pipeline runs"
    ON public.content_pipeline_runs FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_content_pipeline_runs_date ON public.content_pipeline_runs(run_date DESC);

CREATE TRIGGER update_content_pipeline_runs_updated_at
BEFORE UPDATE ON public.content_pipeline_runs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Extende blog_posts para dar suporte ao fluxo de rascunho -> aprovação -> publicação
-- e para diferenciar a coluna de curadoria do artigo autoral.
-- Default 'published' preserva o comportamento de todo o fluxo de admin já
-- existente (que sempre publicou direto); só o pipeline usa 'pending_review'.
DO $$ BEGIN
  ALTER TABLE public.blog_posts ADD COLUMN status TEXT NOT NULL DEFAULT 'published'
    CHECK (status IN ('pending_review', 'approved', 'published', 'rejected'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.blog_posts ADD COLUMN author_kind TEXT CHECK (author_kind IN ('jefferson', 'curadoria'));
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

DO $$ BEGIN
  ALTER TABLE public.blog_posts ADD COLUMN sources JSONB;
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON public.blog_posts(status) WHERE status <> 'published';

-- Fontes iniciais (todas oficiais: RSS de blog/imprensa ou feed público de
-- vídeos do YouTube — nada de scraping de LinkedIn/X, que viola os termos
-- de uso das duas plataformas). Lista de partida, editável na aba
-- "Pipeline de Conteúdo" do admin — não foi possível testar cada URL ao
-- vivo durante a implementação (rede restrita no ambiente de build), então
-- vale conferir/objetar as que falharem no primeiro run.
INSERT INTO public.content_sources (name, kind, url, person_name, person_title) VALUES
  ('OpenAI News', 'rss', 'https://openai.com/news/rss.xml', NULL, 'OpenAI'),
  ('Google AI Blog', 'rss', 'https://blog.google/technology/ai/rss/', NULL, 'Google AI'),
  ('Microsoft AI Blog', 'rss', 'https://blogs.microsoft.com/ai/feed/', NULL, 'Microsoft AI'),
  ('Meta AI Blog', 'rss', 'https://ai.meta.com/blog/rss/', NULL, 'Meta AI'),
  ('NVIDIA Blog', 'rss', 'https://blogs.nvidia.com/feed/', NULL, 'NVIDIA'),
  ('a16z', 'rss', 'https://a16z.com/feed/', NULL, 'Andreessen Horowitz'),
  ('MIT Technology Review — IA', 'rss', 'https://www.technologyreview.com/topic/artificial-intelligence/feed', NULL, 'MIT Technology Review'),
  ('TechCrunch — IA', 'rss', 'https://techcrunch.com/category/artificial-intelligence/feed/', NULL, 'TechCrunch'),
  ('Startups.com.br', 'rss', 'https://startups.com.br/feed/', NULL, 'Startups.com.br'),
  ('Olhar Digital', 'rss', 'https://olhardigital.com.br/feed/', NULL, 'Olhar Digital')
ON CONFLICT DO NOTHING;

-- ============================================================
-- PASSO MANUAL — não incluído nesta migration
-- ============================================================
-- Os dois cron jobs (busca/rascunho às 07h e publicação às 10h,
-- horário de Brasília) precisam ser registrados via pg_cron + pg_net,
-- usando a service_role key guardada no Vault. Essa chave é secreta e
-- específica do projeto — não deve (nem pode, a partir desta sessão)
-- ser hardcoded aqui. Registrar depois do deploy, no SQL Editor do
-- Supabase:
--
--   select cron.schedule(
--     'content-pipeline-fetch',
--     '0 10 * * *',  -- 10:00 UTC = 07:00 BRT
--     $$
--     select net.http_post(
--       url := 'https://cgydeldzhnfyexphaheq.supabase.co/functions/v1/content-pipeline-fetch',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'email_queue_service_role_key')
--       ),
--       body := '{}'::jsonb
--     );
--     $$
--   );
--
--   select cron.schedule(
--     'content-pipeline-publish',
--     '0 13 * * *',  -- 13:00 UTC = 10:00 BRT
--     $$
--     select net.http_post(
--       url := 'https://cgydeldzhnfyexphaheq.supabase.co/functions/v1/content-pipeline-publish',
--       headers := jsonb_build_object(
--         'Content-Type', 'application/json',
--         'Authorization', 'Bearer ' || (select decrypted_secret from vault.decrypted_secrets where name = 'email_queue_service_role_key')
--       ),
--       body := '{}'::jsonb
--     );
--     $$
--   );
--
-- (reaproveita o mesmo secret de vault já criado para o processador de
-- fila de e-mail — é só a service_role key do projeto, não é específico
-- de e-mail.)
