-- Criar enum para finalidade
CREATE TYPE public.finalidade_tipo AS ENUM ('PF', 'PJ');

-- Criar enum para nível
CREATE TYPE public.nivel_tipo AS ENUM ('BASICO', 'INTERMEDIARIO', 'AVANCADO');

-- Criar enum para competência
CREATE TYPE public.competencia_tipo AS ENUM (
  'estrategia',
  'processos',
  'dados',
  'ferramentas',
  'pessoas',
  'etica',
  'seguranca',
  'governanca'
);

-- Criar enum para nível de maturidade
CREATE TYPE public.maturidade_nivel AS ENUM ('Iniciante', 'Em evolução', 'Avançado');

-- Tabela de perguntas
CREATE TABLE public.ia_maturity_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  finalidade finalidade_tipo NOT NULL,
  nivel nivel_tipo NOT NULL,
  competencia competencia_tipo NOT NULL,
  pergunta TEXT NOT NULL,
  ordem INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(finalidade, ordem)
);

-- Tabela de leads e resultados
CREATE TABLE public.ia_maturity_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  nome TEXT NOT NULL,
  email TEXT NOT NULL,
  whatsapp TEXT NOT NULL,
  finalidade finalidade_tipo NOT NULL,
  score_basico FLOAT,
  score_intermediario FLOAT,
  score_avancado FLOAT,
  score_geral FLOAT,
  nivel_maturidade maturidade_nivel,
  competencias JSONB,
  respostas JSONB,
  recomendacoes JSONB,
  concluido BOOLEAN DEFAULT false,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela de mapeamento de conteúdo
CREATE TABLE public.ia_content_map (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  competencia competencia_tipo NOT NULL,
  tipo TEXT NOT NULL,
  titulo TEXT NOT NULL,
  descricao TEXT,
  url TEXT NOT NULL,
  ordem INTEGER DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ia_maturity_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_maturity_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ia_content_map ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view questions"
ON public.ia_maturity_questions
FOR SELECT
USING (true);

CREATE POLICY "Anyone can insert leads"
ON public.ia_maturity_leads
FOR INSERT
WITH CHECK (true);

CREATE POLICY "Users can update their own leads"
ON public.ia_maturity_leads
FOR UPDATE
USING (true);

CREATE POLICY "Anyone can view content map"
ON public.ia_content_map
FOR SELECT
USING (ativo = true);

CREATE POLICY "Admins can manage questions"
ON public.ia_maturity_questions
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage content map"
ON public.ia_content_map
FOR ALL
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can view all leads"
ON public.ia_maturity_leads
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_ia_maturity_leads_updated_at
BEFORE UPDATE ON public.ia_maturity_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir perguntas PF
INSERT INTO public.ia_maturity_questions (finalidade, nivel, competencia, pergunta, ordem) VALUES
-- Básico PF (1-8)
('PF', 'BASICO', 'estrategia', 'Você entende o que é IA generativa e onde ela se aplica no dia a dia?', 1),
('PF', 'BASICO', 'ferramentas', 'Você domina prompts básicos para chatbots de IA?', 2),
('PF', 'BASICO', 'dados', 'Você organiza suas fontes de dados pessoais (arquivos, notas) para usar com IA?', 3),
('PF', 'BASICO', 'processos', 'Você integra IA no seu fluxo de estudos/trabalho (resumos, rascunhos)?', 4),
('PF', 'BASICO', 'etica', 'Você conhece limites e riscos (alucinações, vieses) da IA?', 5),
('PF', 'BASICO', 'seguranca', 'Você usa autenticação e boas práticas ao testar ferramentas de IA?', 6),
('PF', 'BASICO', 'pessoas', 'Você tem rotina de aprendizado contínuo em IA (leituras/cursos)?', 7),
('PF', 'BASICO', 'governanca', 'Você registra boas práticas de uso pessoal (guia/checklist)?', 8),
-- Intermediário PF (9-16)
('PF', 'INTERMEDIARIO', 'ferramentas', 'Você cria prompts estruturados (papel, contexto, formato de saída)?', 9),
('PF', 'INTERMEDIARIO', 'dados', 'Você usa ferramentas para análise de dados pessoais com IA?', 10),
('PF', 'INTERMEDIARIO', 'processos', 'Você mede ganhos de tempo/qualidade quando usa IA?', 11),
('PF', 'INTERMEDIARIO', 'ferramentas', 'Você adapta prompts para diferentes objetivos e tons?', 12),
('PF', 'INTERMEDIARIO', 'etica', 'Você verifica fontes e referencia resultados gerados por IA?', 13),
('PF', 'INTERMEDIARIO', 'seguranca', 'Você protege dados sensíveis ao usar IA (mascaramento)?', 14),
('PF', 'INTERMEDIARIO', 'governanca', 'Você compartilha aprendizados/boas práticas com colegas?', 15),
('PF', 'INTERMEDIARIO', 'estrategia', 'Você traça metas mensais para evoluir em IA?', 16),
-- Avançado PF (17-24)
('PF', 'AVANCADO', 'processos', 'Você cria chains (cadeias) de prompts para tarefas complexas?', 17),
('PF', 'AVANCADO', 'ferramentas', 'Você usa automações (zaps/scripts) com IA no seu fluxo?', 18),
('PF', 'AVANCADO', 'dados', 'Você usa RAG/arquivos próprios para personalizar respostas?', 19),
('PF', 'AVANCADO', 'governanca', 'Você avalia qualidade com critérios objetivos (métricas) em tasks de IA?', 20),
('PF', 'AVANCADO', 'etica', 'Você considera ética de uso (copyright/privacidade) em projetos reais?', 21),
('PF', 'AVANCADO', 'seguranca', 'Você entende políticas de segurança para compartilhar saídas da IA?', 22),
('PF', 'AVANCADO', 'pessoas', 'Você planeja trilhas de aprendizado avançadas alinhadas a objetivos?', 23),
('PF', 'AVANCADO', 'estrategia', 'Você tem um mini-portfólio de projetos/artefatos feitos com IA?', 24);

-- Inserir perguntas PJ
INSERT INTO public.ia_maturity_questions (finalidade, nivel, competencia, pergunta, ordem) VALUES
-- Básico PJ (1-8)
('PJ', 'BASICO', 'estrategia', 'A empresa tem entendimento comum sobre casos de uso de IA?', 1),
('PJ', 'BASICO', 'etica', 'Existem diretrizes mínimas para uso responsável da IA?', 2),
('PJ', 'BASICO', 'dados', 'Os dados básicos (planilhas/docs) estão organizados e acessíveis?', 3),
('PJ', 'BASICO', 'ferramentas', 'Há ferramentas de IA aprovadas pela empresa para uso diário?', 4),
('PJ', 'BASICO', 'processos', 'Processos-chave têm oportunidades identificadas para IA?', 5),
('PJ', 'BASICO', 'etica', 'Há noção de riscos e compliance (LGPD) ao usar IA?', 6),
('PJ', 'BASICO', 'seguranca', 'Práticas básicas de segurança (acessos, logs) estão definidas?', 7),
('PJ', 'BASICO', 'governanca', 'Existe um responsável informal por iniciativas de IA?', 8),
-- Intermediário PJ (9-16)
('PJ', 'INTERMEDIARIO', 'estrategia', 'Há metas e indicadores para iniciativas de IA?', 9),
('PJ', 'INTERMEDIARIO', 'dados', 'Existem pipelines simples para dados (limpeza/atualização)?', 10),
('PJ', 'INTERMEDIARIO', 'ferramentas', 'Ferramentas de IA estão integradas ao fluxo (ex.: CRM, suporte)?', 11),
('PJ', 'INTERMEDIARIO', 'pessoas', 'Times treinam prompts e boas práticas regularmente?', 12),
('PJ', 'INTERMEDIARIO', 'etica', 'Há revisão sistemática de vieses/qualidade das saídas?', 13),
('PJ', 'INTERMEDIARIO', 'seguranca', 'Existem procedimentos de resposta a incidentes ligados à IA?', 14),
('PJ', 'INTERMEDIARIO', 'processos', 'Processos foram redesenhados considerando IA (SOPs)?', 15),
('PJ', 'INTERMEDIARIO', 'governanca', 'Existe comitê ou responsável formal por governança de IA?', 16),
-- Avançado PJ (17-24)
('PJ', 'AVANCADO', 'dados', 'Casos de uso críticos usam RAG ou fine-tuning com dados da empresa?', 17),
('PJ', 'AVANCADO', 'ferramentas', 'Há automações avançadas (integrações/API) com IA em produção?', 18),
('PJ', 'AVANCADO', 'governanca', 'Adoção de métricas (qualidade/custo/tempo) para avaliar ROI de IA?', 19),
('PJ', 'AVANCADO', 'seguranca', 'Políticas de segurança incluem classificação e mascaramento de dados?', 20),
('PJ', 'AVANCADO', 'etica', 'Framework de IA responsável (auditoria e explainability) é aplicado?', 21),
('PJ', 'AVANCADO', 'estrategia', 'Roadmap de IA está alinhado à estratégia e orçamento anual?', 22),
('PJ', 'AVANCADO', 'pessoas', 'Capacitação contínua com trilhas por cargo/unidade?', 23),
('PJ', 'AVANCADO', 'processos', 'Process mining/LLM ops/monitoramento em produção estão ativos?', 24);