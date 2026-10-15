ALTER TABLE public.curso_pedidos ADD COLUMN IF NOT EXISTS is_test boolean NOT NULL DEFAULT false;

CREATE TABLE public.ads_metrics_daily (
  date date NOT NULL,
  ad_id text NOT NULL,
  ad_name text,
  campaign_id text,
  adset_id text,
  spend numeric(12,2) NOT NULL DEFAULT 0,
  impressions integer NOT NULL DEFAULT 0,
  reach integer NOT NULL DEFAULT 0,
  video_views integer NOT NULL DEFAULT 0,
  thruplays integer NOT NULL DEFAULT 0,
  link_clicks integer NOT NULL DEFAULT 0,
  landing_page_views integer NOT NULL DEFAULT 0,
  synced_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (date, ad_id)
);
GRANT SELECT ON public.ads_metrics_daily TO authenticated;
GRANT ALL ON public.ads_metrics_daily TO service_role;
ALTER TABLE public.ads_metrics_daily ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin le metricas" ON public.ads_metrics_daily FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.ads_utm_map (
  ad_id text PRIMARY KEY,
  utm_campaign text,
  label text,
  active boolean NOT NULL DEFAULT true
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.ads_utm_map TO authenticated;
GRANT ALL ON public.ads_utm_map TO service_role;
ALTER TABLE public.ads_utm_map ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin gerencia mapa" ON public.ads_utm_map FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role)) WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

INSERT INTO public.ads_utm_map (ad_id, utm_campaign, label, active) VALUES
 ('52594450712705','lote1','Quem não tem equipe para editar… (impulsionamento antigo)',false),
 ('52594762006905','lote1','Se você usa IA para fazer…',true),
 ('52594763952505','lote1','Quem não tem equipe para…',true);

CREATE TABLE public.ads_sync_status (
  id integer PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  last_run_at timestamptz,
  last_ok_at timestamptz,
  last_error text,
  rows_upserted integer,
  cron_token uuid NOT NULL DEFAULT gen_random_uuid()
);
GRANT SELECT (id, last_run_at, last_ok_at, last_error, rows_upserted) ON public.ads_sync_status TO authenticated;
GRANT ALL ON public.ads_sync_status TO service_role;
ALTER TABLE public.ads_sync_status ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admin le status" ON public.ads_sync_status FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'::app_role));
INSERT INTO public.ads_sync_status (id) VALUES (1);

CREATE OR REPLACE FUNCTION public.painel_ads(p_de date, p_ate date)
RETURNS jsonb LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE r jsonb;
BEGIN
  IF NOT has_role(auth.uid(), 'admin'::app_role) THEN RAISE EXCEPTION 'sem_permissao'; END IF;
  WITH m AS (
    SELECT d.*, u.utm_campaign, u.label, coalesce(u.active, true) AS active
    FROM ads_metrics_daily d LEFT JOIN ads_utm_map u ON u.ad_id = d.ad_id
    WHERE d.date BETWEEN p_de AND p_ate
  ),
  anuncios AS (
    SELECT ad_id, max(ad_name) AS ad_name, max(label) AS label, max(utm_campaign) AS utm_campaign, bool_or(active) AS active,
      sum(spend) AS spend, sum(impressions) AS impressions, sum(video_views) AS video_views, sum(thruplays) AS thruplays,
      sum(link_clicks) AS link_clicks, sum(landing_page_views) AS landing_page_views, max(reach) AS reach_max_dia
    FROM m GROUP BY ad_id
  ),
  campanhas AS (
    SELECT utm_campaign AS campanha, sum(spend) AS spend, sum(impressions) AS impressions, sum(video_views) AS video_views,
      sum(thruplays) AS thruplays, sum(link_clicks) AS link_clicks, sum(landing_page_views) AS landing_page_views
    FROM m WHERE utm_campaign IS NOT NULL GROUP BY utm_campaign
  ),
  sem AS (
    SELECT u.ad_id, u.label, (SELECT max(ad_name) FROM ads_metrics_daily x WHERE x.ad_id = u.ad_id) AS ad_name
    FROM ads_utm_map u WHERE u.utm_campaign IS NULL
  )
  SELECT jsonb_build_object(
    'campanhas', coalesce((SELECT jsonb_agg(to_jsonb(c)) FROM campanhas c), '[]'::jsonb),
    'anuncios', coalesce((SELECT jsonb_agg(to_jsonb(a) ORDER BY a.spend DESC) FROM anuncios a), '[]'::jsonb),
    'sem_campanha', coalesce((SELECT jsonb_agg(to_jsonb(s)) FROM sem s), '[]'::jsonb),
    'utms', coalesce((SELECT jsonb_agg(DISTINCT utm_campaign) FROM ads_utm_map WHERE utm_campaign IS NOT NULL), '[]'::jsonb),
    'status', (SELECT jsonb_build_object('last_run_at', last_run_at, 'last_ok_at', last_ok_at, 'last_error', last_error, 'rows_upserted', rows_upserted) FROM ads_sync_status WHERE id = 1)
  ) INTO r;
  RETURN r;
END $$;
REVOKE ALL ON FUNCTION public.painel_ads(date, date) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.painel_ads(date, date) TO authenticated;

DO $$
DECLARE def text;
BEGIN
  def := pg_get_functiondef('public.painel_academia(date,date)'::regprocedure);
  def := replace(def, 'FROM curso_pedidos p WHERE p.created_at >= v_ant_ini', 'FROM curso_pedidos p WHERE NOT p.is_test AND p.created_at >= v_ant_ini');
  EXECUTE def;
END $$;