-- Painel da Academia (/cursos/painel): investimento em anúncios, origem de
-- cada venda e um resumo calculado no banco, só para admin.
--
-- Depende das migrações de cursos (curso_pedidos), dos leads
-- (academia_leads) e da tabela site_analytics, que já registra as visitas do
-- site com a origem da sessão (traffic_source, utm_*, referrer_domain).

-- 1. De onde veio cada compra (gravado pelo mercadopago-checkout).
ALTER TABLE public.curso_pedidos ADD COLUMN IF NOT EXISTS origem JSONB NOT NULL DEFAULT '{}'::jsonb;

-- 2. Investimento em anúncios, lançado no painel. A campanha deve ser igual
--    ao utm_campaign dos links usados nos anúncios, para o painel cruzar com
--    as visitas, os leads e as vendas.
CREATE TABLE IF NOT EXISTS public.academia_investimentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  data DATE NOT NULL,
  canal TEXT NOT NULL CHECK (canal IN ('meta', 'google', 'tiktok', 'youtube', 'linkedin', 'outro')),
  campanha TEXT CHECK (campanha IS NULL OR length(campanha) <= 120),
  valor NUMERIC(10, 2) NOT NULL CHECK (valor >= 0),
  observacao TEXT CHECK (observacao IS NULL OR length(observacao) <= 300)
);

CREATE INDEX IF NOT EXISTS academia_investimentos_data_idx ON public.academia_investimentos (data DESC);

ALTER TABLE public.academia_investimentos ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.academia_investimentos FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.academia_investimentos TO authenticated;
GRANT ALL ON public.academia_investimentos TO service_role;

DROP POLICY IF EXISTS "Admins gerenciam o investimento da Academia" ON public.academia_investimentos;
CREATE POLICY "Admins gerenciam o investimento da Academia"
ON public.academia_investimentos FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3. O lead passa a guardar também o canal e a página de entrada.
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
    FOREACH v_chave IN ARRAY ARRAY['canal','utm_source','utm_medium','utm_campaign','utm_content','utm_term','referrer','referrer_domain','landing_page','sessao'] LOOP
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
    origem = CASE WHEN EXCLUDED.origem = '{}'::jsonb THEN academia_leads.origem ELSE EXCLUDED.origem END,
    revogado_em = NULL,
    updated_at = now()
  RETURNING id INTO v_id;

  RETURN v_id;
END;
$$;

REVOKE ALL ON FUNCTION public.registrar_lead_academia(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.registrar_lead_academia(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO anon, authenticated;

-- 4. Canal em português a partir da origem gravada (traffic_source do site).
CREATE OR REPLACE FUNCTION public.academia_canal(_origem TEXT)
RETURNS TEXT
LANGUAGE SQL
IMMUTABLE
AS $$
  SELECT CASE lower(coalesce(_origem, 'direct'))
    WHEN 'paid' THEN 'pago'
    WHEN 'organic' THEN 'busca'
    WHEN 'ai' THEN 'ia'
    WHEN 'social' THEN 'social'
    WHEN 'email' THEN 'email'
    WHEN 'referral' THEN 'referencia'
    WHEN 'direct' THEN 'direto'
    WHEN '' THEN 'direto'
    ELSE 'outros'
  END
$$;

-- 5. Resumo do painel. Datas no fuso de São Paulo, de p_de a p_ate inclusive.
--    Visitas: páginas públicas da Academia (vitrine, páginas de venda, livro,
--    termos), sem a área do aluno nem o painel.
CREATE OR REPLACE FUNCTION public.painel_academia(p_de DATE, p_ate DATE)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_ini TIMESTAMPTZ;
  v_fim TIMESTAMPTZ;
  v_dias INT;
  v_ant_ini TIMESTAMPTZ;
  v_resultado JSONB;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN
    RAISE EXCEPTION 'sem_permissao';
  END IF;
  IF p_de IS NULL OR p_ate IS NULL OR p_ate < p_de OR p_ate - p_de > 400 THEN
    RAISE EXCEPTION 'periodo_invalido';
  END IF;

  v_ini := (p_de::timestamp AT TIME ZONE 'America/Sao_Paulo');
  v_fim := ((p_ate + 1)::timestamp AT TIME ZONE 'America/Sao_Paulo');
  v_dias := (p_ate - p_de) + 1;
  v_ant_ini := v_ini - make_interval(days => v_dias);

  WITH
  vis AS (
    SELECT s.session_id, s.page_path, s.created_at, s.screen_width,
           public.academia_canal(s.traffic_source) AS canal,
           nullif(s.utm_source, '') AS utm_source, nullif(s.utm_medium, '') AS utm_medium,
           nullif(s.utm_campaign, '') AS utm_campaign, nullif(s.referrer_domain, '') AS referrer_domain
    FROM site_analytics s
    WHERE s.created_at >= v_ant_ini AND s.created_at < v_fim
      AND (s.page_path = '/cursos' OR s.page_path LIKE '/cursos/%' OR s.page_path LIKE '/livro-del%')
      AND s.page_path NOT LIKE '/cursos/painel%'
      AND s.page_path NOT LIKE '/cursos/entrar%'
      AND s.page_path NOT LIKE '/cursos/obrigado%'
      AND s.page_path NOT LIKE '/cursos/%/aulas%'
  ),
  sessoes AS (
    SELECT DISTINCT ON (session_id) session_id, created_at, canal, utm_source, utm_medium, utm_campaign, referrer_domain, screen_width
    FROM vis ORDER BY session_id, created_at
  ),
  venda AS (
    SELECT DISTINCT session_id FROM vis
    WHERE created_at >= v_ini AND (page_path = '/cursos/ilha' OR page_path LIKE '/cursos/pocket/%' OR page_path LIKE '/livro-del%')
  ),
  leads AS (
    SELECT created_at, public.academia_canal(origem ->> 'canal') AS canal, nullif(origem ->> 'utm_campaign', '') AS utm_campaign
    FROM academia_leads WHERE created_at >= v_ant_ini AND created_at < v_fim
  ),
  pedidos AS (
    SELECT p.created_at, coalesce(p.aprovado_em, p.updated_at) AS pago_em, p.status, p.curso_slug,
           coalesce(p.valor_pago, p.valor) AS receita,
           public.academia_canal(p.origem ->> 'canal') AS canal, nullif(p.origem ->> 'utm_campaign', '') AS utm_campaign
    FROM curso_pedidos p WHERE p.created_at >= v_ant_ini AND p.created_at < v_fim
  ),
  vendas AS (
    SELECT * FROM pedidos WHERE status = 'aprovado'
  ),
  invest AS (
    SELECT data, canal, nullif(campanha, '') AS campanha, valor FROM academia_investimentos
    WHERE data >= (p_de - v_dias) AND data <= p_ate
  ),
  totais AS (
    SELECT
      (SELECT count(*) FROM sessoes WHERE created_at >= v_ini) AS sessoes,
      (SELECT count(*) FROM vis WHERE created_at >= v_ini) AS visualizacoes,
      (SELECT count(*) FROM venda) AS sessoes_venda,
      (SELECT count(*) FROM leads WHERE created_at >= v_ini) AS leads,
      (SELECT count(*) FROM pedidos WHERE created_at >= v_ini) AS pedidos_criados,
      (SELECT count(*) FROM vendas WHERE created_at >= v_ini) AS vendas,
      (SELECT coalesce(sum(receita), 0) FROM vendas WHERE created_at >= v_ini) AS receita,
      (SELECT count(*) FROM pedidos WHERE created_at >= v_ini AND status IN ('reembolsado', 'contestado', 'em_disputa')) AS reembolsos,
      (SELECT coalesce(sum(receita), 0) FROM pedidos WHERE created_at >= v_ini AND status IN ('reembolsado', 'contestado', 'em_disputa')) AS valor_reembolsado,
      (SELECT coalesce(sum(valor), 0) FROM invest WHERE data >= p_de) AS investimento,
      (SELECT count(*) FROM sessoes WHERE created_at >= v_ini AND screen_width IS NOT NULL AND screen_width < 768) AS sessoes_celular
  ),
  anterior AS (
    SELECT
      (SELECT count(*) FROM sessoes WHERE created_at < v_ini) AS sessoes,
      (SELECT count(*) FROM leads WHERE created_at < v_ini) AS leads,
      (SELECT count(*) FROM vendas WHERE created_at < v_ini) AS vendas,
      (SELECT coalesce(sum(receita), 0) FROM vendas WHERE created_at < v_ini) AS receita,
      (SELECT coalesce(sum(valor), 0) FROM invest WHERE data < p_de) AS investimento
  ),
  dias AS (
    SELECT generate_series(p_de, p_ate, interval '1 day')::date AS dia
  ),
  serie AS (
    SELECT d.dia,
      (SELECT count(*) FROM sessoes s WHERE (s.created_at AT TIME ZONE 'America/Sao_Paulo')::date = d.dia) AS sessoes,
      (SELECT count(*) FROM leads l WHERE (l.created_at AT TIME ZONE 'America/Sao_Paulo')::date = d.dia) AS leads,
      (SELECT count(*) FROM vendas v WHERE (v.created_at AT TIME ZONE 'America/Sao_Paulo')::date = d.dia) AS vendas,
      (SELECT coalesce(sum(receita), 0) FROM vendas v WHERE (v.created_at AT TIME ZONE 'America/Sao_Paulo')::date = d.dia) AS receita
    FROM dias d
  ),
  todos_canais AS (
    SELECT unnest(ARRAY['busca','ia','social','referencia','email','pago','direto','outros']) AS canal
  ),
  canais AS (
    SELECT c.canal,
      (SELECT count(*) FROM sessoes s WHERE s.canal = c.canal AND s.created_at >= v_ini) AS sessoes,
      (SELECT count(*) FROM leads l WHERE l.canal = c.canal AND l.created_at >= v_ini) AS leads,
      (SELECT count(*) FROM vendas v WHERE v.canal = c.canal AND v.created_at >= v_ini) AS vendas,
      (SELECT coalesce(sum(receita), 0) FROM vendas v WHERE v.canal = c.canal AND v.created_at >= v_ini) AS receita
    FROM todos_canais c
  ),
  nomes_campanha AS (
    SELECT utm_campaign AS campanha FROM sessoes WHERE created_at >= v_ini AND utm_campaign IS NOT NULL
    UNION SELECT utm_campaign FROM leads WHERE created_at >= v_ini AND utm_campaign IS NOT NULL
    UNION SELECT utm_campaign FROM vendas WHERE created_at >= v_ini AND utm_campaign IS NOT NULL
    UNION SELECT campanha FROM invest WHERE data >= p_de AND campanha IS NOT NULL
  ),
  campanhas AS (
    SELECT n.campanha,
      (SELECT max(s.utm_source) FROM sessoes s WHERE s.utm_campaign = n.campanha) AS origem,
      (SELECT max(s.utm_medium) FROM sessoes s WHERE s.utm_campaign = n.campanha) AS meio,
      (SELECT count(*) FROM sessoes s WHERE s.utm_campaign = n.campanha AND s.created_at >= v_ini) AS sessoes,
      (SELECT count(*) FROM leads l WHERE l.utm_campaign = n.campanha AND l.created_at >= v_ini) AS leads,
      (SELECT count(*) FROM vendas v WHERE v.utm_campaign = n.campanha AND v.created_at >= v_ini) AS vendas,
      (SELECT coalesce(sum(receita), 0) FROM vendas v WHERE v.utm_campaign = n.campanha AND v.created_at >= v_ini) AS receita,
      (SELECT coalesce(sum(valor), 0) FROM invest i WHERE i.campanha = n.campanha AND i.data >= p_de) AS investimento
    FROM nomes_campanha n
  ),
  paginas AS (
    SELECT page_path AS caminho, count(*) AS visualizacoes, count(DISTINCT session_id) AS sessoes
    FROM vis WHERE created_at >= v_ini GROUP BY page_path ORDER BY count(*) DESC LIMIT 12
  ),
  referencias AS (
    SELECT referrer_domain AS dominio, count(*) AS sessoes
    FROM sessoes WHERE created_at >= v_ini AND referrer_domain IS NOT NULL
    GROUP BY referrer_domain ORDER BY count(*) DESC LIMIT 10
  ),
  produtos AS (
    SELECT curso_slug AS produto, count(*) AS vendas, coalesce(sum(receita), 0) AS receita
    FROM vendas WHERE created_at >= v_ini GROUP BY curso_slug ORDER BY sum(receita) DESC NULLS LAST
  ),
  invest_canal AS (
    SELECT canal, coalesce(sum(valor), 0) AS investimento FROM invest WHERE data >= p_de GROUP BY canal
  )
  SELECT jsonb_build_object(
    'periodo', jsonb_build_object('de', p_de, 'ate', p_ate, 'dias', v_dias),
    'totais', (SELECT to_jsonb(t) FROM totais t),
    'anterior', (SELECT to_jsonb(a) FROM anterior a),
    'serie', coalesce((SELECT jsonb_agg(to_jsonb(s) ORDER BY s.dia) FROM serie s), '[]'::jsonb),
    'canais', coalesce((SELECT jsonb_agg(to_jsonb(c)) FROM canais c), '[]'::jsonb),
    'campanhas', coalesce((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.receita DESC, c.sessoes DESC) FROM (SELECT * FROM campanhas ORDER BY receita DESC, sessoes DESC LIMIT 25) c), '[]'::jsonb),
    'paginas', coalesce((SELECT jsonb_agg(to_jsonb(p)) FROM paginas p), '[]'::jsonb),
    'referencias', coalesce((SELECT jsonb_agg(to_jsonb(r)) FROM referencias r), '[]'::jsonb),
    'produtos', coalesce((SELECT jsonb_agg(to_jsonb(p)) FROM produtos p), '[]'::jsonb),
    'investimento_canal', coalesce((SELECT jsonb_agg(to_jsonb(i)) FROM invest_canal i), '[]'::jsonb)
  ) INTO v_resultado;

  RETURN v_resultado;
END;
$$;

REVOKE ALL ON FUNCTION public.painel_academia(DATE, DATE) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.painel_academia(DATE, DATE) FROM anon;
GRANT EXECUTE ON FUNCTION public.painel_academia(DATE, DATE) TO authenticated;
