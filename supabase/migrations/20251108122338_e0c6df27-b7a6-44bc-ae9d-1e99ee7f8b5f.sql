-- Criar tabela para tracking de CTAs estratégicos
CREATE TABLE IF NOT EXISTS public.cta_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  cta_name TEXT NOT NULL,
  cta_location TEXT NOT NULL,
  page_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.cta_events ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can insert CTA events"
  ON public.cta_events
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Admins can view all CTA events"
  ON public.cta_events
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Índices para otimizar queries
CREATE INDEX idx_cta_events_session_id ON public.cta_events(session_id);
CREATE INDEX idx_cta_events_cta_name ON public.cta_events(cta_name);
CREATE INDEX idx_cta_events_created_at ON public.cta_events(created_at);

-- Função para obter estatísticas de CTAs
CREATE OR REPLACE FUNCTION public.get_cta_stats(
  start_date TIMESTAMPTZ DEFAULT now() - INTERVAL '30 days',
  end_date TIMESTAMPTZ DEFAULT now()
)
RETURNS TABLE(
  cta_name TEXT,
  cta_location TEXT,
  total_clicks BIGINT,
  unique_sessions BIGINT
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT 
    cta_name,
    cta_location,
    COUNT(*) as total_clicks,
    COUNT(DISTINCT session_id) as unique_sessions
  FROM cta_events
  WHERE created_at BETWEEN start_date AND end_date
  GROUP BY cta_name, cta_location
  ORDER BY total_clicks DESC;
$$;