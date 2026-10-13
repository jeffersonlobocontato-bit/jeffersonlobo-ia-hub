DROP POLICY IF EXISTS "Aluno baixa materiais do curso que comprou" ON storage.objects;
CREATE POLICY "Aluno baixa materiais do curso que comprou"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'cursos'
  AND (
    has_role(auth.uid(), 'admin'::app_role)
    OR (public.tem_acesso_curso((storage.foldername(name))[1]) AND lower(name) NOT LIKE '%.pdf')
  )
);

CREATE TABLE public.curso_downloads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  curso_slug TEXT NOT NULL,
  caminho TEXT NOT NULL,
  marca_dagua BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX curso_downloads_email ON public.curso_downloads (email, created_at DESC);

GRANT SELECT ON public.curso_downloads TO authenticated;
GRANT ALL ON public.curso_downloads TO service_role;
ALTER TABLE public.curso_downloads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem os downloads"
ON public.curso_downloads FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));