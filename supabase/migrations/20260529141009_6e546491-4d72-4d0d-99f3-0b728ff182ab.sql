
-- 1) Novas colunas
ALTER TABLE public.press_campaigns
  ADD COLUMN IF NOT EXISTS titulo text,
  ADD COLUMN IF NOT EXISTS media_url text,
  ADD COLUMN IF NOT EXISTS media_tipo text NOT NULL DEFAULT 'nenhum',
  ADD COLUMN IF NOT EXISTS link_destino text,
  ADD COLUMN IF NOT EXISTS link_slug text;

-- validação simples
ALTER TABLE public.press_campaigns
  DROP CONSTRAINT IF EXISTS press_campaigns_media_tipo_chk;
ALTER TABLE public.press_campaigns
  ADD CONSTRAINT press_campaigns_media_tipo_chk
  CHECK (media_tipo IN ('imagem','video','nenhum'));

CREATE UNIQUE INDEX IF NOT EXISTS press_campaigns_link_slug_unique
  ON public.press_campaigns(link_slug) WHERE link_slug IS NOT NULL;

-- 2) Bucket público para mídia de release
INSERT INTO storage.buckets (id, name, public)
VALUES ('press-media', 'press-media', true)
ON CONFLICT (id) DO NOTHING;

-- Policies do bucket: leitura pública, escrita admin
DROP POLICY IF EXISTS "press-media public read" ON storage.objects;
CREATE POLICY "press-media public read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'press-media');

DROP POLICY IF EXISTS "press-media admin write" ON storage.objects;
CREATE POLICY "press-media admin write"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'press-media' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "press-media admin update" ON storage.objects;
CREATE POLICY "press-media admin update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'press-media' AND has_role(auth.uid(), 'admin'::app_role));

DROP POLICY IF EXISTS "press-media admin delete" ON storage.objects;
CREATE POLICY "press-media admin delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'press-media' AND has_role(auth.uid(), 'admin'::app_role));

-- 3) RPC pública para a página de release com OG tags (acesso anônimo só por slug)
CREATE OR REPLACE FUNCTION public.get_press_release_og(p_slug text)
RETURNS TABLE(
  id uuid,
  nome text,
  titulo text,
  corpo text,
  media_url text,
  media_tipo text,
  link_destino text,
  created_at timestamp with time zone
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id, nome, titulo, corpo, media_url, media_tipo, link_destino, created_at
  FROM public.press_campaigns
  WHERE link_slug = p_slug
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_press_release_og(text) TO anon, authenticated;
