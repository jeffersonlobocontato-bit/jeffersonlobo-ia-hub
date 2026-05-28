
ALTER TABLE public.site_analytics
  ADD COLUMN IF NOT EXISTS utm_source text,
  ADD COLUMN IF NOT EXISTS utm_medium text,
  ADD COLUMN IF NOT EXISTS utm_campaign text,
  ADD COLUMN IF NOT EXISTS utm_term text,
  ADD COLUMN IF NOT EXISTS utm_content text,
  ADD COLUMN IF NOT EXISTS referrer_domain text,
  ADD COLUMN IF NOT EXISTS traffic_source text,
  ADD COLUMN IF NOT EXISTS landing_page text;

CREATE INDEX IF NOT EXISTS idx_site_analytics_traffic_source ON public.site_analytics(traffic_source);
CREATE INDEX IF NOT EXISTS idx_site_analytics_utm_source ON public.site_analytics(utm_source);
CREATE INDEX IF NOT EXISTS idx_site_analytics_referrer_domain ON public.site_analytics(referrer_domain);
CREATE INDEX IF NOT EXISTS idx_site_analytics_created_at ON public.site_analytics(created_at DESC);
