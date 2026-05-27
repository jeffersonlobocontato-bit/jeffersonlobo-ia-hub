
-- Phase 1+3: Palestra formats, logos, stage photos
CREATE TABLE public.palestra_formats (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  kicker TEXT,
  description TEXT NOT NULL,
  audience TEXT,
  duration TEXT,
  deliverables JSONB DEFAULT '[]'::jsonb,
  icon TEXT DEFAULT 'Mic',
  cta_label TEXT DEFAULT 'Quero conversar',
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.palestra_formats TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.palestra_formats TO authenticated;
GRANT ALL ON public.palestra_formats TO service_role;
ALTER TABLE public.palestra_formats ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active palestra formats" ON public.palestra_formats FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage palestra formats" ON public.palestra_formats FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.speaking_logos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  logo_url TEXT,
  link TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.speaking_logos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.speaking_logos TO authenticated;
GRANT ALL ON public.speaking_logos TO service_role;
ALTER TABLE public.speaking_logos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active speaking logos" ON public.speaking_logos FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage speaking logos" ON public.speaking_logos FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TABLE public.stage_photos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  image_url TEXT NOT NULL,
  caption TEXT,
  event_name TEXT,
  display_order INTEGER NOT NULL DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);
GRANT SELECT ON public.stage_photos TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.stage_photos TO authenticated;
GRANT ALL ON public.stage_photos TO service_role;
ALTER TABLE public.stage_photos ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active stage photos" ON public.stage_photos FOR SELECT USING (active = true);
CREATE POLICY "Admins can manage stage photos" ON public.stage_photos FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Phase 2: briefing requests
CREATE TABLE public.briefing_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome TEXT NOT NULL,
  empresa TEXT,
  cargo TEXT,
  email TEXT NOT NULL,
  whatsapp TEXT,
  tipo TEXT NOT NULL,
  data_evento DATE,
  formato TEXT,
  publico TEXT,
  cidade TEXT,
  mensagem TEXT,
  status TEXT NOT NULL DEFAULT 'novo',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT INSERT ON public.briefing_requests TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.briefing_requests TO authenticated;
GRANT ALL ON public.briefing_requests TO service_role;
ALTER TABLE public.briefing_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can submit briefings" ON public.briefing_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admins can view briefings" ON public.briefing_requests FOR SELECT USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can update briefings" ON public.briefing_requests FOR UPDATE USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins can delete briefings" ON public.briefing_requests FOR DELETE USING (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_briefing_requests_updated_at
  BEFORE UPDATE ON public.briefing_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Phase 5: extend testimonials with author photo/company/event
ALTER TABLE public.testimonials
  ADD COLUMN IF NOT EXISTS author_photo TEXT,
  ADD COLUMN IF NOT EXISTS author_company TEXT,
  ADD COLUMN IF NOT EXISTS event_name TEXT;

-- Phase 5: hero video support
ALTER TABLE public.hero_content
  ADD COLUMN IF NOT EXISTS hero_video_url TEXT,
  ADD COLUMN IF NOT EXISTS cta_tertiary TEXT,
  ADD COLUMN IF NOT EXISTS cta_tertiary_target TEXT;

-- Seed: three palestra formats
INSERT INTO public.palestra_formats (slug, title, kicker, description, audience, duration, deliverables, icon, cta_label, display_order)
VALUES
  ('keynote', 'Keynote de IA', 'Palestra magna', 'Provocação estratégica para abrir convenções, kickoffs e congressos. Conteúdo customizado para o setor da sua empresa, com cases reais e provocações que mudam o mindset da plateia em menos de 1 hora.', 'C-level, lideranças, equipes inteiras, organizadores de eventos', '45 a 75 min + Q&A', '["Conteúdo customizado para o seu setor","Cases reais Brasil e mundo","Slides finais entregues à organização","Sessão de Q&A com a plateia"]'::jsonb, 'Mic', 'Solicitar proposta', 1),
  ('workshop', 'Workshop / Imersão', 'Formato hands-on', 'Imersão prática para times de marketing, produto, RH e operações começarem a usar IA com método. Saímos do hype e entramos no "como fazer" — com playbook próprio aplicado na sua realidade.', 'Times de 8 a 40 pessoas — marketing, produto, RH, operações', '4h, 8h ou 2 dias', '["Diagnóstico de maturidade do time","Playbook de prompts e fluxos","Mini-projeto aplicado ao seu negócio","Acompanhamento de 30 dias pós-imersão"]'::jsonb, 'Users', 'Quero esse formato', 2),
  ('consultoria', 'Consultoria estratégica', 'Para empresas', 'Trilha de consultoria para CEOs e diretorias estruturarem a jornada de IA da empresa — da governança ao roadmap de casos de uso com ROI claro. Sem promessa de mágica, com entregáveis e prazos.', 'CEO, COO, CTO, diretoria e conselho', '90 dias (ciclo) — sprints quinzenais', '["Diagnóstico de maturidade institucional","Roadmap priorizado de casos de uso","Política de uso responsável de IA","Sessões executivas quinzenais"]'::jsonb, 'Briefcase', 'Conversar sobre o projeto', 3);

-- Seed: speaking logos placeholders
INSERT INTO public.speaking_logos (name, display_order) VALUES
  ('Gazeta do Povo', 1),
  ('MIT', 2),
  ('Imersão Internacional', 3),
  ('Sebrae', 4),
  ('Fiep', 5);
