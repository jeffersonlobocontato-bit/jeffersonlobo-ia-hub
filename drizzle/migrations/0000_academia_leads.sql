CREATE TABLE IF NOT EXISTS public.academia_leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT,
  material TEXT NOT NULL,
  consentimento_em TIMESTAMPTZ NOT NULL,
  politica_versao TEXT NOT NULL,
  origem JSONB NOT NULL DEFAULT '{}'::jsonb,
  revogado_em TIMESTAMPTZ,
  UNIQUE (email, material)
);

CREATE INDEX IF NOT EXISTS academia_leads_created_idx ON public.academia_leads (created_at DESC);

ALTER TABLE public.academia_leads ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.academia_leads FROM anon;
GRANT SELECT, UPDATE, DELETE ON public.academia_leads TO authenticated;
GRANT ALL ON public.academia_leads TO service_role;

CREATE POLICY "Admins veem e gerenciam os leads da Academia"
ON public.academia_leads FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE OR REPLACE FUNCTION public.registrar_lead_academia(
  p_nome TEXT,
  p_email TEXT,
  p_whatsapp TEXT,
  p_material TEXT,
  p_politica_versao TEXT,
  p_origem JSONB DEFAULT '{}'::jsonb
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id UUID;
  v_nome TEXT := btrim(coalesce(p_nome, ''));
  v_email TEXT := lower(btrim(coalesce(p_email, '')));
  v_whats TEXT := nullif(regexp_replace(coalesce(p_whatsapp, ''), '\D', '', 'g'), '');
  v_origem JSONB := '{}'::jsonb;
  v_chave TEXT;
BEGIN
  IF length(v_nome) < 2 OR length(v_nome) > 120 THEN
    RAISE EXCEPTION 'nome_invalido';
  END IF;
  IF length(v_email) > 254 OR v_email !~ '^[^[:space:]@]+@[^[:space:]@]+\.[^[:space:]@]+$' THEN
    RAISE EXCEPTION 'email_invalido';
  END IF;
  IF v_whats IS NOT NULL AND length(v_whats) NOT BETWEEN 10 AND 15 THEN
    RAISE EXCEPTION 'whatsapp_invalido';
  END IF;
  IF p_material IS NULL OR p_material !~ '^[a-z0-9-]{3,60}$' THEN
    RAISE EXCEPTION 'material_invalido';
  END IF;
  IF p_politica_versao IS NULL OR length(p_politica_versao) > 20 THEN
    RAISE EXCEPTION 'politica_invalida';
  END IF;

  IF jsonb_typeof(coalesce(p_origem, '{}'::jsonb)) = 'object' THEN
    FOREACH v_chave IN ARRAY ARRAY['utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer'] LOOP
      IF p_origem ? v_chave AND jsonb_typeof(p_origem -> v_chave) = 'string' THEN
        v_origem := v_origem || jsonb_build_object(v_chave, left(p_origem ->> v_chave, 200));
      END IF;
    END LOOP;
  END IF;

  INSERT INTO public.academia_leads (nome, email, whatsapp, material, consentimento_em, politica_versao, origem)
  VALUES (v_nome, v_email, v_whats, p_material, now(), p_politica_versao, v_origem)
  ON CONFLICT (email, material) DO UPDATE SET
    nome = EXCLUDED.nome,
    whatsapp = coalesce(EXCLUDED.whatsapp, academia_leads.whatsapp),
    consentimento_em = EXCLUDED.consentimento_em,
    politica_versao = EXCLUDED.politica_versao,
    revogado_em = NULL,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_lead_academia(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_lead_academia(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;