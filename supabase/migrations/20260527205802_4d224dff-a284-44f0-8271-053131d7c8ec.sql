
-- 1. Novos campos
ALTER TABLE public.blog_posts
  ADD COLUMN IF NOT EXISTS slug text,
  ADD COLUMN IF NOT EXISTS cover_image text,
  ADD COLUMN IF NOT EXISTS cover_alt text,
  ADD COLUMN IF NOT EXISTS content_md text,
  ADD COLUMN IF NOT EXISTS seo_title text,
  ADD COLUMN IF NOT EXISTS seo_description text,
  ADD COLUMN IF NOT EXISTS reading_minutes integer,
  ADD COLUMN IF NOT EXISTS published_at timestamptz,
  ADD COLUMN IF NOT EXISTS tags text[] DEFAULT ARRAY[]::text[];

-- 2. Backfill slug baseado no título para registros existentes
UPDATE public.blog_posts
SET slug = lower(
  regexp_replace(
    regexp_replace(
      translate(title,
        'áàâãäåÁÀÂÃÄÅéèêëÉÈÊËíìîïÍÌÎÏóòôõöÓÒÔÕÖúùûüÚÙÛÜçÇñÑ',
        'aaaaaaAAAAAAeeeeEEEEiiiiIIIIoooooOOOOOuuuuUUUUcCnN'),
      '[^a-zA-Z0-9]+', '-', 'g'),
    '(^-+|-+$)', '', 'g')
) || '-' || substr(id::text, 1, 6)
WHERE slug IS NULL OR slug = '';

ALTER TABLE public.blog_posts ALTER COLUMN slug SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS blog_posts_slug_unique ON public.blog_posts(slug);

-- Backfill published_at = date
UPDATE public.blog_posts SET published_at = date::timestamptz WHERE published_at IS NULL;

-- 3. Bucket de capas
INSERT INTO storage.buckets (id, name, public)
VALUES ('blog-covers', 'blog-covers', true)
ON CONFLICT (id) DO NOTHING;

-- 4. Policies do bucket
DROP POLICY IF EXISTS "Blog covers public read" ON storage.objects;
CREATE POLICY "Blog covers public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'blog-covers');

DROP POLICY IF EXISTS "Admins upload blog covers" ON storage.objects;
CREATE POLICY "Admins upload blog covers"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'blog-covers' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins update blog covers" ON storage.objects;
CREATE POLICY "Admins update blog covers"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "Admins delete blog covers" ON storage.objects;
CREATE POLICY "Admins delete blog covers"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'blog-covers' AND has_role(auth.uid(), 'admin'::app_role));
