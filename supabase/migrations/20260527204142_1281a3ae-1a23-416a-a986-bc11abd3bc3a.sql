
-- 1) Add access_token to ia_maturity_leads
ALTER TABLE public.ia_maturity_leads
  ADD COLUMN IF NOT EXISTS access_token uuid NOT NULL DEFAULT gen_random_uuid();

CREATE INDEX IF NOT EXISTS ia_maturity_leads_token_idx
  ON public.ia_maturity_leads(id, access_token);

-- 2) Drop overly permissive policies
DROP POLICY IF EXISTS "Anyone can view lead by id" ON public.ia_maturity_leads;
DROP POLICY IF EXISTS "Anyone can update their own lead by id" ON public.ia_maturity_leads;

-- 3) Secure RPCs for anon lead access (token-gated)
CREATE OR REPLACE FUNCTION public.get_maturity_lead(p_id uuid, p_token uuid)
RETURNS SETOF public.ia_maturity_leads
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT * FROM public.ia_maturity_leads
  WHERE id = p_id AND access_token = p_token
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.update_maturity_respostas(
  p_id uuid, p_token uuid, p_respostas jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE updated_rows int;
BEGIN
  UPDATE public.ia_maturity_leads
    SET respostas = p_respostas, updated_at = now()
  WHERE id = p_id AND access_token = p_token AND concluido = false;
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

CREATE OR REPLACE FUNCTION public.finalize_maturity_lead(
  p_id uuid,
  p_token uuid,
  p_respostas jsonb,
  p_score_basico double precision,
  p_score_intermediario double precision,
  p_score_avancado double precision,
  p_score_geral double precision,
  p_competencias jsonb,
  p_nivel_maturidade text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE updated_rows int;
BEGIN
  UPDATE public.ia_maturity_leads
    SET respostas = p_respostas,
        score_basico = p_score_basico,
        score_intermediario = p_score_intermediario,
        score_avancado = p_score_avancado,
        score_geral = p_score_geral,
        competencias = p_competencias,
        nivel_maturidade = p_nivel_maturidade::nivel_maturidade,
        concluido = true,
        updated_at = now()
  WHERE id = p_id AND access_token = p_token;
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;

-- 4) Aggregated stats (no PII) for social proof / dashboard
CREATE OR REPLACE FUNCTION public.get_maturity_stats()
RETURNS TABLE (total_concluidos bigint, avg_score_geral double precision)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::bigint,
         AVG(score_geral)::double precision
  FROM public.ia_maturity_leads
  WHERE concluido = true AND score_geral IS NOT NULL;
$$;

-- 5) Permissions for RPCs
REVOKE ALL ON FUNCTION public.get_maturity_lead(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.update_maturity_respostas(uuid, uuid, jsonb) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.finalize_maturity_lead(uuid, uuid, jsonb, double precision, double precision, double precision, double precision, jsonb, text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.get_maturity_stats() FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.get_maturity_lead(uuid, uuid) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.update_maturity_respostas(uuid, uuid, jsonb) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.finalize_maturity_lead(uuid, uuid, jsonb, double precision, double precision, double precision, double precision, jsonb, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_maturity_stats() TO anon, authenticated;

-- 6) Tighten briefing_requests insert validation
DROP POLICY IF EXISTS "Anyone can submit briefings" ON public.briefing_requests;
CREATE POLICY "Anyone can submit briefings"
  ON public.briefing_requests
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(nome)) BETWEEN 2 AND 120
    AND email ~* '^[^\s@]+@[^\s@]+\.[^\s@]+$'
    AND length(email) <= 254
    AND tipo IS NOT NULL AND length(tipo) <= 80
    AND (mensagem IS NULL OR length(mensagem) <= 5000)
    AND (whatsapp IS NULL OR length(whatsapp) <= 30)
    AND (empresa IS NULL OR length(empresa) <= 200)
    AND (cargo IS NULL OR length(cargo) <= 120)
    AND (cidade IS NULL OR length(cidade) <= 120)
  );

-- 7) Tighten chat_leads insert validation
DROP POLICY IF EXISTS "Anyone can insert chat leads" ON public.chat_leads;
CREATE POLICY "Anyone can insert chat leads"
  ON public.chat_leads
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    length(trim(nome)) BETWEEN 2 AND 120
    AND whatsapp ~ '^\d{10,15}$'
    AND (apelido IS NULL OR length(apelido) <= 60)
  );

-- 8) Fix mutable search_path on internal functions
ALTER FUNCTION public.enqueue_email(text, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.delete_email(text, bigint) SET search_path = public, pgmq;
ALTER FUNCTION public.move_to_dlq(text, text, bigint, jsonb) SET search_path = public, pgmq;
ALTER FUNCTION public.read_email_batch(text, integer, integer) SET search_path = public, pgmq;
