-- Tabela para estatísticas da seção de confiança
CREATE TABLE public.trust_stats (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  icon text NOT NULL,
  value text NOT NULL,
  label text NOT NULL,
  display_order integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Tabela para depoimentos
CREATE TABLE public.testimonials (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quote text NOT NULL,
  author_name text NOT NULL,
  author_title text NOT NULL,
  rating numeric DEFAULT 5.0,
  display_order integer NOT NULL,
  active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.trust_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- Políticas para trust_stats
CREATE POLICY "Anyone can view active trust stats"
  ON public.trust_stats
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage trust stats"
  ON public.trust_stats
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Políticas para testimonials
CREATE POLICY "Anyone can view active testimonials"
  ON public.testimonials
  FOR SELECT
  USING (active = true);

CREATE POLICY "Admins can manage testimonials"
  ON public.testimonials
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger para updated_at em trust_stats
CREATE TRIGGER update_trust_stats_updated_at
  BEFORE UPDATE ON public.trust_stats
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para updated_at em testimonials
CREATE TRIGGER update_testimonials_updated_at
  BEFORE UPDATE ON public.testimonials
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados iniciais nas trust_stats
INSERT INTO public.trust_stats (icon, value, label, display_order) VALUES
  ('Users', '127', 'Palestras realizadas', 1),
  ('TrendingUp', '45+', 'Empresas transformadas', 2),
  ('Award', '97%', 'Taxa de satisfação', 3),
  ('Star', '1.247+', 'Profissionais capacitados', 4);

-- Inserir depoimento inicial
INSERT INTO public.testimonials (quote, author_name, author_title, rating, display_order) VALUES
  ('A abordagem de Jefferson sobre IA é prática e transformadora. Em poucos meses, implementamos soluções que economizaram milhões em custos operacionais.', 'Carlos Silva', 'CTO de empresa Fortune 500', 5.0, 1);