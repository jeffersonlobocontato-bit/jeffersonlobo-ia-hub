-- Parecer do revisor editorial automático (supabase/functions/_shared/revisor-editorial.ts):
-- nota, critérios, falhas e se o post foi aprovado sem revisão humana.
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS editorial_review jsonb;
