-- Editor de Vídeo: projetos salvos como configuração não-destrutiva (JSONB),
-- seguindo o mesmo padrão de product_cases/stage_photos. Cada projeto guarda
-- o template escolhido (card_dados | fundo_dinamico) e todos os parâmetros
-- visuais (moldura, fundo, legenda, assinatura, capa) para poder ser reaberto
-- e editado depois, sem nunca "queimar" pixels antes da exportação final.

CREATE TABLE public.video_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL DEFAULT 'Novo vídeo',
  template TEXT NOT NULL DEFAULT 'card_dados' CHECK (template IN ('card_dados', 'fundo_dinamico')),
  status TEXT NOT NULL DEFAULT 'rascunho' CHECK (status IN ('rascunho', 'pronto', 'publicado')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  cover_url TEXT,
  duration_seconds NUMERIC,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.video_projects TO authenticated;
GRANT ALL ON public.video_projects TO service_role;
ALTER TABLE public.video_projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage video projects"
ON public.video_projects FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_video_projects_updated_at
  BEFORE UPDATE ON public.video_projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket para mídia bruta (gravações, fundos, capas renderizadas, assinatura).
-- Não é público por padrão: é material de trabalho, não conteúdo do site.
INSERT INTO storage.buckets (id, name, public)
VALUES ('video-projects', 'video-projects', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view video project media"
ON storage.objects FOR SELECT
USING (bucket_id = 'video-projects');

CREATE POLICY "Admins can upload video project media"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'video-projects' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update video project media"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'video-projects' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete video project media"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'video-projects' AND has_role(auth.uid(), 'admin'::app_role));
