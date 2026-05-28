
CREATE OR REPLACE FUNCTION public.finalize_maturity_lead(
  p_id uuid, p_token uuid, p_respostas jsonb,
  p_score_basico double precision, p_score_intermediario double precision,
  p_score_avancado double precision, p_score_geral double precision,
  p_competencias jsonb, p_nivel_maturidade text
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
        nivel_maturidade = p_nivel_maturidade::public.maturidade_nivel,
        concluido = true,
        updated_at = now()
  WHERE id = p_id AND access_token = p_token;
  GET DIAGNOSTICS updated_rows = ROW_COUNT;
  RETURN updated_rows > 0;
END;
$$;
