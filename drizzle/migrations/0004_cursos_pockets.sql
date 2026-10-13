CREATE TABLE IF NOT EXISTS public.curso_inclusoes (
  curso_slug TEXT NOT NULL,
  inclui_slug TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (curso_slug, inclui_slug),
  CHECK (curso_slug <> inclui_slug)
);

GRANT SELECT ON public.curso_inclusoes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.curso_inclusoes TO authenticated;
GRANT ALL ON public.curso_inclusoes TO service_role;
ALTER TABLE public.curso_inclusoes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos veem o que cada curso inclui"
ON public.curso_inclusoes FOR SELECT
USING (true);

CREATE POLICY "Admins gerenciam as inclusões"
ON public.curso_inclusoes FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.curso_inclusoes (curso_slug, inclui_slug) VALUES
  ('ilha', 'pocket-configurar'),
  ('ilha', 'pocket-voz'),
  ('ilha', 'pocket-postagem')
ON CONFLICT DO NOTHING;

CREATE OR REPLACE FUNCTION public.acesso_ativo_por_email(_email TEXT, _curso TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.curso_acessos a
    WHERE a.status = 'ativo'
      AND a.email = lower(coalesce(_email, ''))
      AND (
        a.curso_slug = _curso
        OR a.curso_slug IN (SELECT i.curso_slug FROM public.curso_inclusoes i WHERE i.inclui_slug = _curso)
      )
  );
$$;

REVOKE ALL ON FUNCTION public.acesso_ativo_por_email(TEXT, TEXT) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.acesso_ativo_por_email(TEXT, TEXT) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION public.acesso_ativo_por_email(TEXT, TEXT) TO service_role;

CREATE OR REPLACE FUNCTION public.tem_acesso_curso(_curso TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    has_role(auth.uid(), 'admin'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.curso_acessos a
      WHERE a.status = 'ativo'
        AND a.email = lower(coalesce(auth.jwt() ->> 'email', ''))
        AND (
          a.curso_slug = _curso
          OR a.curso_slug IN (SELECT i.curso_slug FROM public.curso_inclusoes i WHERE i.inclui_slug = _curso)
        )
    );
$$;

GRANT EXECUTE ON FUNCTION public.tem_acesso_curso(TEXT) TO authenticated;