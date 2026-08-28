
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS status text NOT NULL DEFAULT 'published',
  ADD COLUMN IF NOT EXISTS author_kind text,
  ADD COLUMN IF NOT EXISTS sources jsonb DEFAULT '[]'::jsonb;

CREATE TABLE IF NOT EXISTS public.content_sources (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  kind text NOT NULL DEFAULT 'rss',
  url text NOT NULL,
  person_name text,
  person_title text,
  active boolean NOT NULL DEFAULT true,
  last_fetch_status text,
  last_fetch_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.content_sources TO authenticated;
GRANT ALL ON public.content_sources TO service_role;
ALTER TABLE public.content_sources ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.content_pipeline_runs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  run_date date NOT NULL UNIQUE,
  status text NOT NULL DEFAULT 'drafting',
  raw_items jsonb DEFAULT '[]'::jsonb,
  curation_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  authored_post_id uuid REFERENCES public.blog_posts(id) ON DELETE SET NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.content_pipeline_runs TO authenticated;
GRANT ALL ON public.content_pipeline_runs TO service_role;
ALTER TABLE public.content_pipeline_runs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='content_sources' AND policyname='Admins manage content sources') THEN
    CREATE POLICY "Admins manage content sources" ON public.content_sources
      FOR ALL TO authenticated
      USING (public.has_role(auth.uid(), 'admin'))
      WITH CHECK (public.has_role(auth.uid(), 'admin'));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='content_pipeline_runs' AND policyname='Admins read pipeline runs') THEN
    CREATE POLICY "Admins read pipeline runs" ON public.content_pipeline_runs
      FOR SELECT TO authenticated
      USING (public.has_role(auth.uid(), 'admin'));
  END IF;
END $$;
