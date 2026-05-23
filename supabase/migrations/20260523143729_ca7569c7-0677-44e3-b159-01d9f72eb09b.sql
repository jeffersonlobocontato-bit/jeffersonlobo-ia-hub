CREATE TABLE IF NOT EXISTS public.ia_maturity_recommendations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  competencia TEXT NOT NULL,
  nivel TEXT NOT NULL DEFAULT 'BASICO',
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  acao_30d TEXT,
  acao_60d TEXT,
  acao_90d TEXT,
  recursos JSONB DEFAULT '[]'::jsonb,
  ordem INTEGER NOT NULL DEFAULT 0,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.ia_maturity_recommendations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active recommendations"
  ON public.ia_maturity_recommendations FOR SELECT
  USING (ativo = true);

CREATE POLICY "Admins can manage recommendations"
  ON public.ia_maturity_recommendations FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_ia_recs_competencia ON public.ia_maturity_recommendations(competencia, nivel);

INSERT INTO public.ia_maturity_recommendations (competencia, nivel, titulo, descricao, acao_30d, acao_60d, acao_90d, ordem) VALUES
('estrategia','BASICO','Defina visão e casos de uso de IA','Sem clareza estratégica, IA vira despesa. Comece desenhando onde IA pode gerar valor real.','Mapeie 3 dores do negócio que IA pode resolver','Priorize 1 caso de uso com ROI claro','Rode piloto de 30 dias com métricas',1),
('estrategia','INTERMEDIARIO','Construa roadmap de IA','Tenha um plano de 12 meses com marcos, investimento e responsáveis.','Defina OKRs de IA por área','Aloque orçamento e squad dedicado','Reporte resultados para liderança',2),
('processos','BASICO','Mapeie processos críticos','IA acelera processos existentes — você precisa conhecê-los antes de automatizar.','Documente 5 processos mais repetitivos','Identifique gargalos de tempo/erro','Automatize 1 etapa com IA generativa',1),
('processos','INTERMEDIARIO','Integre IA no fluxo de trabalho','Pare de usar IA isoladamente — integre em ferramentas e processos do dia a dia.','Conecte IA aos sistemas atuais via API','Crie SOPs com IA embarcada','Meça redução de tempo por processo',2),
('dados','BASICO','Organize seus dados','IA é tão boa quanto seus dados. Limpe e estruture antes de escalar.','Inventarie fontes de dados da empresa','Defina governança básica e padrões','Centralize em data warehouse/lake',1),
('dados','INTERMEDIARIO','Habilite analytics avançado','Avance de dashboards descritivos para previsão e prescrição com IA.','Implemente modelo preditivo simples','Treine time em interpretação de dados','Crie cultura data-driven na liderança',2),
('ferramentas','BASICO','Adote ferramentas de IA generativa','ChatGPT, Claude, Gemini, Copilot — comece pelo que dá ganho imediato.','Forneça licenças pagas para o time-chave','Crie biblioteca de prompts internos','Padronize ferramentas por função',1),
('ferramentas','INTERMEDIARIO','Avalie plataformas especializadas','Saia das ferramentas genéricas e adote IA específica para seu setor.','Faça benchmark de 3 ferramentas por área','Rode POC com a mais promissora','Negocie contrato anual com SLA',2),
('pessoas','BASICO','Capacite time em fundamentos','Sem letramento em IA, o time resiste ou usa de forma insegura.','Treinamento de 4h em IA para todos','Workshop hands-on com casos reais','Crie comunidade interna de prática',1),
('pessoas','INTERMEDIARIO','Forme champions de IA','Identifique e desenvolva multiplicadores em cada área.','Selecione 1 champion por departamento','Mentoria semanal com especialista','Champions liderem squads de IA',2),
('etica','BASICO','Estabeleça diretrizes éticas','Defina o que é e o que não é aceitável no uso de IA.','Publique política interna de uso de IA','Treine time em vieses e responsabilidade','Crie comitê de ética em IA',1),
('etica','INTERMEDIARIO','Implemente auditoria de modelos','Garanta que decisões automatizadas sejam explicáveis e justas.','Audite 1 caso de uso quanto a vieses','Documente decisões algorítmicas','Reporte transparência publicamente',2),
('seguranca','BASICO','Proteja dados em uso de IA','Funcionários colando dados sigilosos em chatbots é um risco real.','Bloqueie ferramentas não aprovadas','Implemente DLP para IA','Treine time em segurança com IA',1),
('seguranca','INTERMEDIARIO','Segregue ambientes e acessos','IA em produção exige controles tão rigorosos quanto qualquer sistema crítico.','Faça pen test em soluções de IA','Implemente logs e monitoramento','Tenha plano de resposta a incidentes',2),
('governanca','BASICO','Crie estrutura de governança','Sem dono, IA vira projeto de cada um — e ninguém presta contas.','Nomeie sponsor executivo de IA','Defina papéis e responsabilidades','Estabeleça comitê multidisciplinar',1),
('governanca','INTERMEDIARIO','Padronize processos de aprovação','Crie pipeline claro do conceito ao deploy de IA.','Crie template de business case','Defina critérios de go/no-go','Implemente revisão trimestral de portfólio',2);