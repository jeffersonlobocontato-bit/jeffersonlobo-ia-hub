-- Tabela de aberturas de e-mail (pixel tracking)
CREATE TABLE public.press_email_opens (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  send_id uuid NOT NULL REFERENCES public.press_sends(id) ON DELETE CASCADE,
  opened_at timestamptz NOT NULL DEFAULT now(),
  user_agent text,
  ip_hash text
);

CREATE INDEX idx_press_email_opens_send_id ON public.press_email_opens(send_id);
CREATE INDEX idx_press_email_opens_opened_at ON public.press_email_opens(opened_at DESC);

GRANT SELECT ON public.press_email_opens TO authenticated;
GRANT ALL ON public.press_email_opens TO service_role;

ALTER TABLE public.press_email_opens ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view email opens"
  ON public.press_email_opens FOR SELECT
  TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Service role can insert email opens"
  ON public.press_email_opens FOR INSERT
  TO public
  WITH CHECK (auth.role() = 'service_role');

-- View: estatísticas agregadas por campanha
CREATE OR REPLACE VIEW public.press_campaign_stats
WITH (security_invoker = true) AS
SELECT
  c.id AS campaign_id,
  c.nome,
  c.tipo,
  c.assunto,
  c.status,
  c.sent_at,
  c.created_at,
  c.total_alvo,
  COUNT(s.id) FILTER (WHERE s.status = 'enviado')::int AS enviados,
  COUNT(s.id) FILTER (WHERE s.status = 'erro')::int AS erros,
  COUNT(s.id) FILTER (WHERE s.status = 'pulado')::int AS pulados,
  COUNT(DISTINCT o.send_id)::int AS aberturas_unicas,
  COUNT(o.id)::int AS aberturas_totais
FROM public.press_campaigns c
LEFT JOIN public.press_sends s ON s.campaign_id = c.id
LEFT JOIN public.press_email_opens o ON o.send_id = s.id
GROUP BY c.id;

GRANT SELECT ON public.press_campaign_stats TO authenticated;

-- View: estatísticas por segmento (meio) e campanha
CREATE OR REPLACE VIEW public.press_segment_stats
WITH (security_invoker = true) AS
SELECT
  s.campaign_id,
  COALESCE(NULLIF(TRIM(pc.meio), ''), 'não informado') AS meio,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'enviado')::int AS enviados,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'erro')::int AS erros,
  COUNT(DISTINCT o.send_id)::int AS aberturas_unicas,
  COUNT(o.id)::int AS aberturas_totais
FROM public.press_sends s
JOIN public.press_contacts pc ON pc.id = s.contact_id
LEFT JOIN public.press_email_opens o ON o.send_id = s.id
GROUP BY s.campaign_id, COALESCE(NULLIF(TRIM(pc.meio), ''), 'não informado');

GRANT SELECT ON public.press_segment_stats TO authenticated;

-- View: estatísticas por região e campanha
CREATE OR REPLACE VIEW public.press_region_stats
WITH (security_invoker = true) AS
SELECT
  s.campaign_id,
  COALESCE(NULLIF(TRIM(pc.regiao), ''), 'não informado') AS regiao,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'enviado')::int AS enviados,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'erro')::int AS erros,
  COUNT(DISTINCT o.send_id)::int AS aberturas_unicas,
  COUNT(o.id)::int AS aberturas_totais
FROM public.press_sends s
JOIN public.press_contacts pc ON pc.id = s.contact_id
LEFT JOIN public.press_email_opens o ON o.send_id = s.id
GROUP BY s.campaign_id, COALESCE(NULLIF(TRIM(pc.regiao), ''), 'não informado');

GRANT SELECT ON public.press_region_stats TO authenticated;

-- View: estatísticas por município, região e campanha (drill-down)
CREATE OR REPLACE VIEW public.press_municipio_stats
WITH (security_invoker = true) AS
SELECT
  s.campaign_id,
  COALESCE(NULLIF(TRIM(pc.regiao), ''), 'não informado') AS regiao,
  COALESCE(NULLIF(TRIM(pc.municipio), ''), 'não informado') AS municipio,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'enviado')::int AS enviados,
  COUNT(DISTINCT o.send_id)::int AS aberturas_unicas,
  COUNT(o.id)::int AS aberturas_totais
FROM public.press_sends s
JOIN public.press_contacts pc ON pc.id = s.contact_id
LEFT JOIN public.press_email_opens o ON o.send_id = s.id
GROUP BY s.campaign_id, COALESCE(NULLIF(TRIM(pc.regiao), ''), 'não informado'), COALESCE(NULLIF(TRIM(pc.municipio), ''), 'não informado');

GRANT SELECT ON public.press_municipio_stats TO authenticated;

-- View: engajamento por contato (cross-campanhas)
CREATE OR REPLACE VIEW public.press_contact_engagement
WITH (security_invoker = true) AS
SELECT
  pc.id AS contact_id,
  pc.contato,
  pc.veiculo,
  pc.email,
  pc.meio,
  pc.regiao,
  pc.municipio,
  COUNT(DISTINCT s.id) FILTER (WHERE s.status = 'enviado')::int AS total_recebidos,
  COUNT(DISTINCT o.send_id)::int AS campanhas_abertas,
  COUNT(o.id)::int AS total_aberturas,
  MAX(o.opened_at) AS ultima_abertura
FROM public.press_contacts pc
LEFT JOIN public.press_sends s ON s.contact_id = pc.id
LEFT JOIN public.press_email_opens o ON o.send_id = s.id
GROUP BY pc.id;

GRANT SELECT ON public.press_contact_engagement TO authenticated;