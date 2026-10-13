CREATE TABLE public.curso_acessos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL CHECK (email = lower(email)),
  nome TEXT,
  curso_slug TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'revogado')),
  origem TEXT NOT NULL DEFAULT 'manual' CHECK (origem IN ('hotmart', 'manual')),
  hotmart_transacao TEXT,
  observacao TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (email, curso_slug)
);

CREATE TRIGGER update_curso_acessos_updated_at
  BEFORE UPDATE ON public.curso_acessos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

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
      SELECT 1 FROM public.curso_acessos
      WHERE curso_slug = _curso
        AND status = 'ativo'
        AND email = lower(coalesce(auth.jwt() ->> 'email', ''))
    );
$$;

GRANT EXECUTE ON FUNCTION public.tem_acesso_curso(TEXT) TO authenticated;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.curso_acessos TO authenticated;
GRANT ALL ON public.curso_acessos TO service_role;
ALTER TABLE public.curso_acessos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno vê os próprios acessos"
ON public.curso_acessos FOR SELECT
TO authenticated
USING (email = lower(coalesce(auth.jwt() ->> 'email', '')));

CREATE POLICY "Admins gerenciam acessos"
ON public.curso_acessos FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.curso_progresso (
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  curso_slug TEXT NOT NULL,
  aula_slug TEXT NOT NULL,
  concluida_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, curso_slug, aula_slug)
);

GRANT SELECT, INSERT, DELETE ON public.curso_progresso TO authenticated;
GRANT ALL ON public.curso_progresso TO service_role;
ALTER TABLE public.curso_progresso ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno vê o próprio progresso"
ON public.curso_progresso FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Aluno marca aula concluída"
ON public.curso_progresso FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid() AND public.tem_acesso_curso(curso_slug));

CREATE POLICY "Aluno desmarca aula"
ON public.curso_progresso FOR DELETE
TO authenticated
USING (user_id = auth.uid());

CREATE TABLE public.curso_tutor_mensagens (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  email TEXT,
  curso_slug TEXT NOT NULL,
  aula_slug TEXT,
  pergunta TEXT NOT NULL,
  resposta TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX curso_tutor_mensagens_user_dia ON public.curso_tutor_mensagens (user_id, created_at DESC);

GRANT SELECT ON public.curso_tutor_mensagens TO authenticated;
GRANT ALL ON public.curso_tutor_mensagens TO service_role;
ALTER TABLE public.curso_tutor_mensagens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno vê as próprias perguntas"
ON public.curso_tutor_mensagens FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.hotmart_eventos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  evento TEXT,
  transacao TEXT,
  email TEXT,
  produto_id TEXT,
  curso_slug TEXT,
  acao TEXT,
  erro TEXT,
  payload JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX hotmart_eventos_transacao ON public.hotmart_eventos (transacao);

GRANT SELECT ON public.hotmart_eventos TO authenticated;
GRANT ALL ON public.hotmart_eventos TO service_role;
ALTER TABLE public.hotmart_eventos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins veem eventos da Hotmart"
ON public.hotmart_eventos FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.curso_config (
  curso_slug TEXT NOT NULL,
  chave TEXT NOT NULL,
  valor TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (curso_slug, chave)
);

CREATE TRIGGER update_curso_config_updated_at
  BEFORE UPDATE ON public.curso_config
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

GRANT SELECT, INSERT, UPDATE, DELETE ON public.curso_config TO authenticated;
GRANT ALL ON public.curso_config TO service_role;
ALTER TABLE public.curso_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Aluno lê a configuração do curso que comprou"
ON public.curso_config FOR SELECT
TO authenticated
USING (public.tem_acesso_curso(curso_slug));

CREATE POLICY "Admins gerenciam a configuração dos cursos"
ON public.curso_config FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Aluno baixa materiais do curso que comprou"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'cursos' AND public.tem_acesso_curso((storage.foldername(name))[1]));

CREATE POLICY "Admins enviam materiais de curso"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'cursos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins atualizam materiais de curso"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'cursos' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins apagam materiais de curso"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'cursos' AND has_role(auth.uid(), 'admin'::app_role));