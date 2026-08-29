-- Cases da seção "Ideias que viraram produtos": editável no admin, com upload de foto real da ferramenta.
CREATE TABLE public.product_cases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  domain TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  tags JSONB NOT NULL DEFAULT '[]'::jsonb,
  mockup TEXT NOT NULL DEFAULT 'dashboard',
  image_url TEXT,
  image_alt TEXT,
  focal_x NUMERIC NOT NULL DEFAULT 50,
  focal_y NUMERIC NOT NULL DEFAULT 50,
  zoom NUMERIC NOT NULL DEFAULT 1,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.product_cases TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_cases TO authenticated;
GRANT ALL ON public.product_cases TO service_role;
ALTER TABLE public.product_cases ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active product cases" ON public.product_cases FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage product cases" ON public.product_cases FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_product_cases_updated_at
  BEFORE UPDATE ON public.product_cases
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-cases', 'product-cases', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public can view product case photos"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-cases');

CREATE POLICY "Admins can upload product case photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'product-cases' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update product case photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'product-cases' AND has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete product case photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'product-cases' AND has_role(auth.uid(), 'admin'));

-- Seed com os 4 cases já publicados na Home (copy idêntica à do ProductsSection.tsx original)
INSERT INTO public.product_cases (name, domain, category, description, tags, mockup, display_order) VALUES
('politiza-ia', 'politiza-ia', 'Inteligência territorial',
 'Plataforma de inteligência para campanhas e mobilização política: mapas georreferenciados por município, gestão de equipe de campo em tempo real, diagnóstico de ativos e liderança com apoio de IA.',
 '["IA territorial","Full-stack","Multi-módulo"]'::jsonb, 'map', 1),
('juntosparana399', 'juntosparana', 'Análise de dados e propostas',
 'Análise de dados eleitorais e cruzamento territorial com IA: importação e leitura de bases públicas, biblioteca de documentos com agentes vinculados, chat de análise para leitura de propostas e cenários.',
 '["Agentes de IA","Dados eleitorais","Dashboards"]'::jsonb, 'dashboard', 2),
('connect-chat', 'connect-chat', 'Relações públicas e mensageria',
 'CRM de imprensa e mensageria com geração de conteúdo assistida por IA: campanhas por WhatsApp e e-mail, relacionamento com jornalistas, releases e automação de disparo segmentado.',
 '["Conteúdo com IA","Automação","CRM de imprensa"]'::jsonb, 'chat', 3),
('vozesparanaenses', 'vozesparanaenses.com.br', 'Portal de notícias',
 'Portal de notícias regionais com redação assistida por IA, indexação instantânea em buscadores (IndexNow) e segmentação geográfica por município — publicação e SEO no mesmo fluxo.',
 '["Redação com IA","SEO/GEO","Editorial"]'::jsonb, 'news', 4);
