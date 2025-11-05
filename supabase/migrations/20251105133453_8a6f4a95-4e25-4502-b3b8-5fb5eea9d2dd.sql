-- Criar tipo enum para roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Tabela de roles dos usuários
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Habilitar RLS
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Função para verificar se usuário tem role específica
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Policy: Apenas admins podem ver roles
CREATE POLICY "Admins can view all roles"
ON public.user_roles
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de conteúdo do Hero
CREATE TABLE public.hero_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  cta_primary TEXT NOT NULL,
  cta_secondary TEXT NOT NULL,
  stat1_number TEXT NOT NULL,
  stat1_label TEXT NOT NULL,
  stat2_number TEXT NOT NULL,
  stat2_label TEXT NOT NULL,
  stat3_number TEXT NOT NULL,
  stat3_label TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.hero_content ENABLE ROW LEVEL SECURITY;

-- Inserir conteúdo padrão do Hero
INSERT INTO public.hero_content (
  headline, subtitle, cta_primary, cta_secondary,
  stat1_number, stat1_label, stat2_number, stat2_label, stat3_number, stat3_label
) VALUES (
  'Explorando o futuro da tecnologia e criatividade humana',
  'Palestrante, autor e especialista em Inteligência Artificial comprometido com o impacto positivo da inovação tecnológica.',
  'Conheça o Livro',
  'Veja o Blog',
  '15+', 'Anos de Experiência',
  '500+', 'Palestras Realizadas',
  '50k+', 'Pessoas Impactadas'
);

-- Policies para Hero
CREATE POLICY "Anyone can view hero content"
ON public.hero_content FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can update hero content"
ON public.hero_content FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de conteúdo do Sobre
CREATE TABLE public.about_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.about_content ENABLE ROW LEVEL SECURITY;

INSERT INTO public.about_content (title, description) VALUES (
  'Sobre Jefferson Lobo',
  'Com mais de 15 anos de experiência em tecnologia, venho dedicando minha carreira a desvendar as possibilidades da Inteligência Artificial e seu impacto na sociedade. Como autor, palestrante e consultor, trabalho para tornar a IA acessível e compreensível, explorando tanto suas oportunidades quanto seus desafios éticos.'
);

CREATE POLICY "Anyone can view about content"
ON public.about_content FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can update about content"
ON public.about_content FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de serviços
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

INSERT INTO public.services (icon, title, description, display_order) VALUES
('Mic', 'Palestras Inspiradoras', 'Palestras envolventes sobre IA, inovação e o futuro da tecnologia para empresas e eventos.', 1),
('GraduationCap', 'Cursos e Workshops', 'Treinamentos práticos em IA, machine learning e transformação digital.', 2),
('Users', 'Consultoria Estratégica', 'Assessoria especializada em implementação de IA e estratégia de inovação.', 3),
('BookOpen', 'Produção de Conteúdo', 'Artigos, vídeos e materiais educativos sobre tecnologia e IA.', 4);

CREATE POLICY "Anyone can view services"
ON public.services FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Admins can manage services"
ON public.services FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de conteúdo do Livro
CREATE TABLE public.book_content (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL,
  description TEXT NOT NULL,
  purchase_link TEXT,
  sample_link TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.book_content ENABLE ROW LEVEL SECURITY;

INSERT INTO public.book_content (title, subtitle, description, purchase_link, sample_link) VALUES (
  'IA: O Futuro é Agora',
  'Desvendando os Mistérios da Inteligência Artificial',
  'Uma jornada completa pelo universo da Inteligência Artificial, desde seus fundamentos até as aplicações mais inovadoras. Este livro oferece uma visão clara e acessível sobre como a IA está transformando nosso mundo e como podemos nos preparar para esse futuro.',
  'https://amazon.com.br',
  'https://example.com/sample'
);

CREATE POLICY "Anyone can view book content"
ON public.book_content FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can update book content"
ON public.book_content FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de características do livro
CREATE TABLE public.book_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  icon TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  display_order INTEGER NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.book_features ENABLE ROW LEVEL SECURITY;

INSERT INTO public.book_features (icon, title, description, display_order) VALUES
('BookOpen', 'Conteúdo Prático', 'Exemplos reais e aplicações práticas de IA no dia a dia.', 1),
('Lightbulb', 'Insights Únicos', 'Análises aprofundadas sobre o impacto da IA na sociedade.', 2),
('Users', 'Para Todos', 'Linguagem acessível para iniciantes e profissionais.', 3);

CREATE POLICY "Anyone can view book features"
ON public.book_features FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Admins can manage book features"
ON public.book_features FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Tabela de posts do blog
CREATE TABLE public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  excerpt TEXT NOT NULL,
  category TEXT NOT NULL,
  date DATE NOT NULL,
  linkedin_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_by UUID REFERENCES auth.users(id)
);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

INSERT INTO public.blog_posts (title, excerpt, category, date, linkedin_url) VALUES
('O Futuro da IA Generativa', 'Explorando as tendências mais promissoras da inteligência artificial generativa e seu impacto nos próximos anos.', 'Inteligência Artificial', '2024-03-15', 'https://linkedin.com/in/jeffersonlobo'),
('Ética em IA: Desafios e Oportunidades', 'Uma reflexão profunda sobre os dilemas éticos no desenvolvimento e implementação de sistemas de IA.', 'Ética & Tecnologia', '2024-03-10', 'https://linkedin.com/in/jeffersonlobo'),
('Machine Learning na Prática', 'Guia prático para implementar soluções de machine learning em ambientes corporativos.', 'Tecnologia', '2024-03-05', 'https://linkedin.com/in/jeffersonlobo'),
('IA e o Futuro do Trabalho', 'Como a inteligência artificial está transformando o mercado de trabalho e criando novas oportunidades.', 'Futuro', '2024-02-28', 'https://linkedin.com/in/jeffersonlobo');

CREATE POLICY "Anyone can view active blog posts"
ON public.blog_posts FOR SELECT TO authenticated USING (active = true);

CREATE POLICY "Admins can manage blog posts"
ON public.blog_posts FOR ALL TO authenticated
USING (public.has_role(auth.uid(), 'admin'));

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_services_updated_at
BEFORE UPDATE ON public.services
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hero_content_updated_at
BEFORE UPDATE ON public.hero_content
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_about_content_updated_at
BEFORE UPDATE ON public.about_content
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_content_updated_at
BEFORE UPDATE ON public.book_content
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();