-- Painel da Academia: visitas sem robôs e sem o próprio admin.
--
-- 1. academia_visita_robo(): reconhece visitas de robôs pelo navegador
--    (prévia de link do WhatsApp/Facebook, buscadores, navegadores
--    automáticos) e pela janela de 800x600, que é o padrão de navegador
--    automático. Vale para o histórico já gravado.
-- 2. painel_academia(): mesma função da migração 20261013230000, agora sem
--    robôs e sem as sessões que abriram o painel (são do admin).
--
-- O site também deixou de gravar robôs, a prévia do Lovable e navegadores
-- marcados como internos (src/lib/rastreio.ts). Idempotente.

CREATE OR REPLACE FUNCTION public.academia_visita_robo(_ua TEXT, _largura INT, _altura INT)
RETURNS BOOLEAN
LANGUAGE SQL
IMMUTABLE
SET search_path = public
AS $$
  SELECT coalesce(_ua, '') = ''
      OR _ua ~* '(bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|whatsapp|telegram|embedly|headless|lighthouse|pagespeed|gtmetrix|pingdom|python|curl|wget|axios|node-fetch|go-http|preview)'
      OR (_largura = 800 AND _altura = 600)
$$;

GRANT EXECUTE ON FUNCTION public.academia_visita_robo(TEXT, INT, INT) TO authenticated, service_role;

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
      AND NOT public.academia_visita_robo(s.user_agent, s.screen_width, s.screen_height)
      -- sessão de quem abriu o painel é do admin, não do público
      -- (NOT IN com subconsulta vira uma tabela de hash: rápido)
      AND s.session_id NOT IN (
        SELECT a.session_id FROM site_analytics a
        WHERE a.created_at >= v_ant_ini - interval '1 day' AND a.created_at < v_fim
          AND a.page_path LIKE '/cursos/painel%' AND a.session_id IS NOT NULL
      )
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
