
-- Drop direct insert policy; inserts must go through SECURITY DEFINER RPC
DROP POLICY IF EXISTS "Anyone can insert leads" ON public.ia_maturity_leads;

REVOKE INSERT, UPDATE ON public.ia_maturity_leads FROM anon;
REVOKE INSERT, UPDATE ON public.ia_maturity_leads FROM authenticated;

CREATE OR REPLACE FUNCTION public.create_maturity_lead(
  p_nome text,
  p_email text,
  p_whatsapp text,
  p_finalidade text
)
RETURNS TABLE (id uuid, access_token uuid)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_token uuid;
  v_nome text := trim(p_nome);
  v_email text := lower(trim(p_email));
  v_whatsapp text := regexp_replace(coalesce(p_whatsapp,''), '\D', '', 'g');
BEGIN
  IF length(v_nome) < 3 OR length(v_nome) > 120 THEN
    RAISE EXCEPTION 'invalid_nome';
  END IF;
  IF v_email !~* '^[^\s@]+@[^\s@]+\.[^\s@]+$' OR length(v_email) > 254 THEN
    RAISE EXCEPTION 'invalid_email';
  END IF;
  IF length(v_whatsapp) NOT BETWEEN 10 AND 15 THEN
    RAISE EXCEPTION 'invalid_whatsapp';
  END IF;
  IF p_finalidade NOT IN ('PF','PJ') THEN
    RAISE EXCEPTION 'invalid_finalidade';
  END IF;

  INSERT INTO public.ia_maturity_leads (nome, email, whatsapp, finalidade)
  VALUES (v_nome, v_email, v_whatsapp, p_finalidade::finalidade_teste)
  RETURNING ia_maturity_leads.id, ia_maturity_leads.access_token
  INTO v_id, v_token;

  id := v_id;
  access_token := v_token;
  RETURN NEXT;
END;
$$;

REVOKE ALL ON FUNCTION public.create_maturity_lead(text, text, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.create_maturity_lead(text, text, text, text) TO anon, authenticated;
