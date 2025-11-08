-- Create tables for analytics tracking

-- Main analytics table for page views and sessions
CREATE TABLE public.site_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  page_path text NOT NULL,
  page_title text,
  referrer text,
  user_agent text,
  screen_width integer,
  screen_height integer,
  duration_seconds integer,
  ip_address text,
  country text,
  city text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Click events tracking
CREATE TABLE public.click_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  page_path text NOT NULL,
  element_id text,
  element_class text,
  element_text text,
  x_position integer NOT NULL,
  y_position integer NOT NULL,
  viewport_width integer NOT NULL,
  viewport_height integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Scroll depth tracking
CREATE TABLE public.scroll_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id text NOT NULL,
  page_path text NOT NULL,
  scroll_depth_percent integer NOT NULL,
  max_scroll_depth integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create indexes for better query performance
CREATE INDEX idx_site_analytics_session ON public.site_analytics(session_id);
CREATE INDEX idx_site_analytics_page ON public.site_analytics(page_path);
CREATE INDEX idx_site_analytics_created ON public.site_analytics(created_at DESC);
CREATE INDEX idx_click_events_session ON public.click_events(session_id);
CREATE INDEX idx_click_events_page ON public.click_events(page_path);
CREATE INDEX idx_click_events_created ON public.click_events(created_at DESC);
CREATE INDEX idx_scroll_events_session ON public.scroll_events(session_id);
CREATE INDEX idx_scroll_events_page ON public.scroll_events(page_path);

-- Enable RLS
ALTER TABLE public.site_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.click_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.scroll_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Anyone can insert (for tracking), only admins can view
CREATE POLICY "Anyone can insert analytics"
  ON public.site_analytics
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all analytics"
  ON public.site_analytics
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert click events"
  ON public.click_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all click events"
  ON public.click_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can insert scroll events"
  ON public.scroll_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all scroll events"
  ON public.scroll_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to get unique visitors count
CREATE OR REPLACE FUNCTION public.get_unique_visitors(
  start_date timestamptz DEFAULT now() - interval '30 days',
  end_date timestamptz DEFAULT now()
)
RETURNS bigint
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(DISTINCT session_id)
  FROM site_analytics
  WHERE created_at BETWEEN start_date AND end_date;
$$;

-- Function to get page stats
CREATE OR REPLACE FUNCTION public.get_page_stats(
  start_date timestamptz DEFAULT now() - interval '30 days',
  end_date timestamptz DEFAULT now()
)
RETURNS TABLE(
  page_path text,
  views bigint,
  unique_visitors bigint,
  avg_duration numeric
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    page_path,
    COUNT(*) as views,
    COUNT(DISTINCT session_id) as unique_visitors,
    ROUND(AVG(duration_seconds)::numeric, 2) as avg_duration
  FROM site_analytics
  WHERE created_at BETWEEN start_date AND end_date
  GROUP BY page_path
  ORDER BY views DESC;
$$;

-- Function to get click density for heatmap
CREATE OR REPLACE FUNCTION public.get_click_density(
  target_page text,
  start_date timestamptz DEFAULT now() - interval '30 days',
  end_date timestamptz DEFAULT now()
)
RETURNS TABLE(
  x integer,
  y integer,
  count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    x_position as x,
    y_position as y,
    COUNT(*) as count
  FROM click_events
  WHERE page_path = target_page
    AND created_at BETWEEN start_date AND end_date
  GROUP BY x_position, y_position;
$$;