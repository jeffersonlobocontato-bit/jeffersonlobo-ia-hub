
-- ESTRATÉGIA · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Sem clareza estratégica, IA vira despesa de TI e gera ceticismo. Quem define onde IA gera valor controla o orçamento, a narrativa e os próximos 3 anos da carreira ou do negócio.',
  acao_pf_30d = 'Mapeie 5 tarefas que você faz toda semana e estime quanto tempo cada uma consome. Identifique 2 onde IA generativa já cortaria 50% do esforço (e-mails, pesquisa, resumos, primeiros rascunhos).',
  acao_pf_60d = 'Construa um "case pessoal de IA": um problema do seu time que você resolve com IA em 2 semanas. Documente antes/depois com números (tempo, qualidade, retrabalho). Vire o cara que entregou.',
  acao_pf_90d = 'Apresente o case internamente (all-hands, Slack, demo). Use isso para pedir um projeto maior, uma promoção ou para alimentar seu LinkedIn — sua marca pessoal de "operador de IA" começa aqui.',
  acao_pj_30d = 'Conduza um workshop de 2h com sua liderança usando o framework "Where to Play / How to Win" aplicado a IA. Saída: 3 dores de negócio onde IA muda o jogo (não onde "seria legal usar").',
  acao_pj_60d = 'Priorize 1 caso de uso com ROI mensurável em 90 dias (ex: redução de tempo de atendimento, aumento de conversão, automação de back-office). Defina baseline, meta e dono executivo.',
  acao_pj_90d = 'Rode um piloto controlado com métricas semanais. Comunique resultados (bons OU ruins) para o board. Aprenda em público — isso constrói a cultura mais rápido que qualquer treinamento.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"AI For Everyone","fonte":"Andrew Ng / Coursera","link":"https://www.coursera.org/learn/ai-for-everyone"},
    {"tipo":"Livro","titulo":"Co-Intelligence: Living and Working with AI","fonte":"Ethan Mollick","link":""},
    {"tipo":"Newsletter","titulo":"One Useful Thing","fonte":"Ethan Mollick (Substack)","link":"https://www.oneusefulthing.org/"},
    {"tipo":"Prática","titulo":"Diário de prompts","fonte":"Anote 1 prompt útil por dia durante 30 dias","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Curso","titulo":"AI Strategy and Leadership","fonte":"MIT Sloan Executive Education","link":"https://executive.mit.edu/"},
    {"tipo":"Livro","titulo":"Competing in the Age of AI","fonte":"Marco Iansiti & Karim Lakhani (HBR Press)","link":""},
    {"tipo":"Framework","titulo":"AI Transformation Playbook","fonte":"Andrew Ng / Landing AI","link":"https://landing.ai/case-studies/the-ai-transformation-playbook"},
    {"tipo":"Comunidade","titulo":"WEF — AI Governance Alliance","fonte":"World Economic Forum","link":"https://www.weforum.org/communities/ai-governance-alliance/"}
  ]'::jsonb
WHERE competencia='estrategia' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'No nível intermediário, o risco muda: deixou de ser "fazer IA", passou a ser "fazer IA escalar". Sem roadmap, sponsor e orçamento dedicado, projetos morrem na transição do piloto para produção.',
  acao_pf_30d = 'Escreva sua tese pessoal de IA em 1 página: qual sua aposta nos próximos 3 anos (vertical, função, tipo de IA), e por quê. Compartilhe com 5 mentores e peça crítica honesta.',
  acao_pf_60d = 'Especialize-se em 1 stack profunda (ex.: agentes com LangGraph, automação com n8n + LLMs, fine-tuning para o seu domínio). Vire referência interna em algo, não generalista de tudo.',
  acao_pf_90d = 'Publique. Um artigo no LinkedIn por mês, uma palestra interna por trimestre, 1 case público por semestre. Distribuição é o multiplicador da sua tese.',
  acao_pj_30d = 'Defina OKRs de IA por diretoria com baseline numérico e métrica de adoção (não só métrica de output). Aloque sponsor executivo nominal — sem dono, sem ROI.',
  acao_pj_60d = 'Monte um squad dedicado (PM + tech lead + champion de negócio) com orçamento próprio e cadência quinzenal de review com o CEO/Conselho. IA não pode ser "extra do dia".',
  acao_pj_90d = 'Reporte trimestralmente: % adoção real por área, horas economizadas, NPS interno da ferramenta, ROI por caso. Cancele o que não engaja em 60 dias. Dobre a aposta no que funciona.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"Generative AI with Large Language Models","fonte":"DeepLearning.AI / AWS","link":"https://www.coursera.org/learn/generative-ai-with-llms"},
    {"tipo":"Livro","titulo":"The AI-First Company","fonte":"Ash Fontana","link":""},
    {"tipo":"Newsletter","titulo":"Latent Space","fonte":"swyx & Alessio","link":"https://www.latent.space/"},
    {"tipo":"Comunidade","titulo":"AI Engineer Foundation","fonte":"Discord + conferências","link":"https://www.ai.engineer/"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Curso","titulo":"AI: Implications for Business Strategy","fonte":"MIT Sloan + CSAIL","link":"https://executive-ed.mit.edu/ai"},
    {"tipo":"Livro","titulo":"Power and Prediction","fonte":"Agrawal, Gans, Goldfarb (HBR Press)","link":""},
    {"tipo":"Framework","titulo":"Rewired — The McKinsey Guide to Outcompeting in the Age of AI","fonte":"McKinsey","link":""},
    {"tipo":"Newsletter","titulo":"The Algorithm","fonte":"MIT Technology Review","link":"https://www.technologyreview.com/newsletters/"}
  ]'::jsonb
WHERE competencia='estrategia' AND nivel='INTERMEDIARIO';

-- PROCESSOS · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Automatizar um processo ruim com IA = ter um processo ruim mais rápido. Quem mapeia primeiro economiza 10x e evita o vício de "IA-washing" que destrói credibilidade.',
  acao_pf_30d = 'Liste os 10 processos que mais consomem seu tempo na semana. Marque com ⏱️ os repetitivos, 🧠 os criativos, 🤝 os relacionais. IA ataca primeiro o ⏱️.',
  acao_pf_60d = 'Escolha 1 processo ⏱️ e crie sua própria mini-automação (ex.: GPT + Zapier/Make/n8n para triagem de e-mails, geração de relatórios, sumarização de reuniões com Granola/Otter).',
  acao_pf_90d = 'Documente o playbook em vídeo de 5 min e compartilhe com o time. Quem ensina vira líder técnico informal — mesmo sem cargo.',
  acao_pj_30d = 'Sente com 3 áreas e mapeie os 5 processos mais doloridos de cada (volume × dor × variabilidade). Não use post-it — use planilha com horas/mês e custo estimado.',
  acao_pj_60d = 'Eleja 2 processos para reengenharia com IA usando o mindset "Process Mining + Copilot": redesenhe primeiro, automatize depois. Não copie o processo manual para a IA.',
  acao_pj_90d = 'Defina SLAs com IA embarcada (ex.: "respondemos lead em < 5 min, 24/7") e meça impacto em receita/satisfação, não em "tarefas automatizadas".',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"Automatize Tudo com IA + n8n","fonte":"Asimov Academy / Lobo+IA","link":""},
    {"tipo":"Prática","titulo":"Construa 1 automação real por semana","fonte":"Make.com ou n8n + OpenAI/Claude API","link":"https://n8n.io/"},
    {"tipo":"Livro","titulo":"The 4-Hour Workweek (cap. automação)","fonte":"Tim Ferriss","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Curso","titulo":"Operations Analytics","fonte":"Wharton / Coursera","link":"https://www.coursera.org/learn/wharton-operations-analytics"},
    {"tipo":"Livro","titulo":"The Lean Startup","fonte":"Eric Ries","link":""},
    {"tipo":"Framework","titulo":"BPMN 2.0 + AI augmentation","fonte":"OMG + Camunda","link":"https://camunda.com/"},
    {"tipo":"Comunidade","titulo":"ABPMP Brasil","fonte":"Associação de Profissionais de BPM","link":"https://www.abpmp-br.org/"}
  ]'::jsonb
WHERE competencia='processos' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'IA isolada vira "feature exótica". Embarcada no fluxo (CRM, ERP, Slack, Teams), vira sistema operacional invisível — e isso muda quem decide o quê em silêncio.',
  acao_pf_30d = 'Conecte sua IA preferida aos seus sistemas via API (HubSpot, Notion, Jira, Slack). Substitua 1 tela que você abre toda manhã por um agente que entrega o resumo.',
  acao_pf_60d = 'Construa 1 agente vertical para seu papel (ex.: assistente de pré-venda, analista de PnL, revisor jurídico). Compartilhe com 3 colegas e itere com feedback real.',
  acao_pf_90d = 'Meça e publique seus ganhos pessoais (horas/semana, erros evitados, decisões aceleradas). Use isso na próxima conversa de promoção/aumento.',
  acao_pj_30d = 'Identifique os 3 sistemas de registro críticos do negócio (CRM, ERP, BI). Mapeie pontos onde uma camada de IA agrega contexto, recomendação ou ação.',
  acao_pj_60d = 'Crie SOPs híbridos (humano + agente) com governança clara: quem aprova o quê, quando IA decide sozinha, quando escala. Documente em Notion/Confluence público interno.',
  acao_pj_90d = 'Monte dashboard executivo: tempo economizado por processo, % de tarefas com IA-in-the-loop, erros evitados, custo por automação. Sem isso, IA vira fé.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"Building AI Agents (LangGraph)","fonte":"DeepLearning.AI","link":"https://www.deeplearning.ai/short-courses/"},
    {"tipo":"Livro","titulo":"Designing Machine Learning Systems","fonte":"Chip Huyen","link":""},
    {"tipo":"Prática","titulo":"3 agentes verticais em 30 dias","fonte":"OpenAI Agents SDK ou CrewAI","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Curso","titulo":"Digital Transformation","fonte":"INSEAD / BCG Digital Ventures","link":""},
    {"tipo":"Livro","titulo":"The AI Playbook","fonte":"Eric Siegel","link":""},
    {"tipo":"Framework","titulo":"Composite AI architecture","fonte":"Gartner","link":""},
    {"tipo":"Comunidade","titulo":"CIO Brasil","fonte":"Encontros executivos","link":"https://www.itforum.com.br/cio/"}
  ]'::jsonb
WHERE competencia='processos' AND nivel='INTERMEDIARIO';

-- DADOS · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Garbage in, garbage out — agora em escala industrial. Modelos topo de linha sobre dados sujos produzem alucinação confiante: o pior tipo de erro.',
  acao_pf_30d = 'Inventário pessoal: onde estão seus dados de trabalho (Drive, Notion, e-mail, planilhas)? Estabeleça 1 fonte da verdade por tipo (cliente, projeto, métrica).',
  acao_pf_60d = 'Aprenda SQL básico (90% das análises reais). Curso de SQL do Khan Academy ou Mode Analytics — 10h te colocam acima de 80% dos profissionais não-técnicos.',
  acao_pf_90d = 'Construa 1 dashboard pessoal de KPIs (do seu time ou da sua carreira) usando Sheets + GPT para gerar insights semanais. Vire a pessoa data-fluent do time.',
  acao_pj_30d = 'Inventarie fontes de dados (sistemas, planilhas paralelas, dados externos). Classifique por criticidade × qualidade × acessibilidade. Mostre o mapa para a liderança.',
  acao_pj_60d = 'Defina governança mínima viável: dono de cada dataset, dicionário de dados, SLAs de freshness e completeness. Sem dono, sem qualidade.',
  acao_pj_90d = 'Consolide em data warehouse/lakehouse (BigQuery, Snowflake, Databricks). Sem camada analítica unificada, IA generativa fica brincando com fragmentos.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"SQL for Data Analysis","fonte":"Mode Analytics (gratuito)","link":"https://mode.com/sql-tutorial"},
    {"tipo":"Curso","titulo":"Data Analysis with Python","fonte":"freeCodeCamp","link":"https://www.freecodecamp.org/learn/data-analysis-with-python/"},
    {"tipo":"Livro","titulo":"Storytelling with Data","fonte":"Cole Nussbaumer Knaflic","link":""},
    {"tipo":"Newsletter","titulo":"Data Elixir","fonte":"Curated weekly","link":"https://dataelixir.com/"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Curso","titulo":"Data Strategy for Business Leaders","fonte":"MIT Sloan","link":""},
    {"tipo":"Livro","titulo":"Data Strategy","fonte":"Bernard Marr","link":""},
    {"tipo":"Framework","titulo":"DAMA-DMBOK 2","fonte":"Data Management Body of Knowledge","link":"https://www.dama.org/"},
    {"tipo":"Comunidade","titulo":"CDO Brasil","fonte":"Chief Data Officers community","link":""}
  ]'::jsonb
WHERE competencia='dados' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Sair de "dashboards descritivos" (o que aconteceu) para "prescritivos" (o que fazer) é a fronteira que separa quem é tomado decisão de quem toma decisão.',
  acao_pf_30d = 'Implemente 1 modelo preditivo simples (regressão, classificação) usando AutoML (BigQuery ML, Vertex AI) ou ChatGPT Code Interpreter sobre seus dados reais.',
  acao_pf_60d = 'Aprenda a interpretar (não construir do zero): viés, overfitting, métricas (precisão, recall, AUC). Sem isso você é refém do que o cientista de dados diz.',
  acao_pf_90d = 'Vire ponte: traduza problemas de negócio em hipóteses testáveis para os times de dados. Essa é a habilidade mais escassa e melhor paga de 2026.',
  acao_pj_30d = 'Migre de dashboards passivos para alertas acionáveis (anomalias, churn risk, oportunidade). Cada métrica deve ter "o que fazer se subir/cair".',
  acao_pj_60d = 'Treine lideranças em interpretação de dados e IA (data fluency executiva). Tomada de decisão por intuição é o legado mais caro do século XX.',
  acao_pj_90d = 'Crie cultura data-driven com rituais: weekly business review baseado em dados, post-mortems baseados em evidência, OKRs com métrica clara — não vibe.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"Machine Learning Specialization","fonte":"Andrew Ng / Coursera","link":"https://www.coursera.org/specializations/machine-learning-introduction"},
    {"tipo":"Livro","titulo":"Practical Statistics for Data Scientists","fonte":"Peter Bruce","link":""},
    {"tipo":"Prática","titulo":"Kaggle Learn — Intermediate ML","fonte":"Kaggle","link":"https://www.kaggle.com/learn"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Curso","titulo":"Leading with Analytics & AI","fonte":"Wharton Executive Education","link":""},
    {"tipo":"Livro","titulo":"Competing on Analytics","fonte":"Thomas Davenport","link":""},
    {"tipo":"Framework","titulo":"DataOps Manifesto","fonte":"dataopsmanifesto.org","link":"https://dataopsmanifesto.org/"},
    {"tipo":"Comunidade","titulo":"Data Leaders Brasil","fonte":"Encontros de CDOs e Heads of Data","link":""}
  ]'::jsonb
WHERE competencia='dados' AND nivel='INTERMEDIARIO';

-- FERRAMENTAS · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Versão gratuita é demonstração — não ferramenta de trabalho. Quem usa só a free está competindo com 1 mão amarrada. Ganhos reais aparecem com a versão Pro/Team integrada ao fluxo.',
  acao_pf_30d = 'Assine 1 ferramenta paga de IA generativa por 90 dias (ChatGPT Plus, Claude Pro ou Gemini Advanced). Custo: ~R$120/mês. Retorno: horas/semana — o melhor ROI da sua vida.',
  acao_pf_60d = 'Construa sua stack pessoal: LLM principal + transcrição (Granola/Otter) + automação (Make/n8n) + busca (Perplexity). Use por 30 dias com disciplina.',
  acao_pf_90d = 'Crie sua biblioteca de prompts (Notion ou GitHub) com 30+ prompts testados. Documente o que funciona e por quê — vire seu manual de produtividade.',
  acao_pj_30d = 'Forneça licenças pagas (ChatGPT Team, Claude for Work, Copilot M365) para times-chave (vendas, marketing, jurídico, operações). Sem licença, time usa pessoal e vaza dados.',
  acao_pj_60d = 'Crie biblioteca interna de prompts e GPTs/Projects compartilhados por função. Padronize o "como" — deixe o "que" para cada profissional.',
  acao_pj_90d = 'Padronize ferramentas por papel + KPI de adoção (% MAUs, prompts/dia, casos de uso ativos). Cancele licenças não usadas em 60 dias para reinvestir.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"ChatGPT Prompt Engineering for Developers","fonte":"DeepLearning.AI (gratuito)","link":"https://www.deeplearning.ai/short-courses/chatgpt-prompt-engineering-for-developers/"},
    {"tipo":"Newsletter","titulo":"Ben''s Bites","fonte":"Daily AI news + ferramentas","link":"https://bensbites.beehiiv.com/"},
    {"tipo":"Comunidade","titulo":"r/ChatGPT, r/LocalLLaMA","fonte":"Reddit","link":""},
    {"tipo":"Prática","titulo":"30-day prompt journal","fonte":"1 prompt útil/dia documentado","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"AI Tool Stack Canvas","fonte":"Mapeie stack por função × maturidade","link":""},
    {"tipo":"Curso","titulo":"Copilot for M365 — Adoption Toolkit","fonte":"Microsoft Learn","link":"https://adoption.microsoft.com/copilot/"},
    {"tipo":"Comunidade","titulo":"CHRO + CTO roundtables de adoção de IA","fonte":"Encontros executivos locais","link":""},
    {"tipo":"Newsletter","titulo":"The Pragmatic Engineer","fonte":"Gergely Orosz","link":"https://newsletter.pragmaticengineer.com/"}
  ]'::jsonb
WHERE competencia='ferramentas' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Ferramenta horizontal (ChatGPT) entrega 80% do valor genérico. Os outros 20% — onde está a margem competitiva — vêm de IA vertical no seu setor (saúde, jurídico, indústria, finanças).',
  acao_pf_30d = 'Pesquise 3 ferramentas verticais do seu setor (ex.: Harvey/Spellbook no jurídico, Glass.health na medicina, Bloomberg GPT em finanças). Teste 1 em trial.',
  acao_pf_60d = 'Especialize-se: vire o early adopter oficial de 1 ferramenta vertical na sua empresa. Demos internas viram convites para projetos estratégicos.',
  acao_pf_90d = 'Publique um comparativo honesto (LinkedIn ou blog) das ferramentas que testou. Vira sua porta de entrada para conversas com fundadores e VCs do setor.',
  acao_pj_30d = 'Benchmark estruturado: 3 ferramentas × 5 critérios (acurácia, integração, segurança, preço, suporte). Envolva usuário final na avaliação, não só TI.',
  acao_pj_60d = 'POC de 6 semanas com a vencedora, escopo cirúrgico (1 caso de uso, 1 equipe, métricas claras). POCs longas viram permanentes sem ROI.',
  acao_pj_90d = 'Negocie contrato anual com SLA específico (uptime, acurácia, suporte em PT-BR, treinamento). Use a POC bem-sucedida como leverage de preço.',
  aprendizado_pf = '[
    {"tipo":"Newsletter","titulo":"AI Tool Report","fonte":"Curated vertical AI tools","link":"https://aitoolreport.beehiiv.com/"},
    {"tipo":"Comunidade","titulo":"Product Hunt — AI section","fonte":"Discovery diário","link":"https://www.producthunt.com/topics/artificial-intelligence"},
    {"tipo":"Prática","titulo":"Trial mensal","fonte":"Teste 1 ferramenta vertical nova/mês","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"Gartner Magic Quadrant — categoria do seu setor","fonte":"Gartner","link":""},
    {"tipo":"Curso","titulo":"Vendor Management for AI","fonte":"a16z + execs","link":""},
    {"tipo":"Comunidade","titulo":"Setor-específica","fonte":"Ex.: HIMSS (saúde), ABBC (bancos)","link":""}
  ]'::jsonb
WHERE competencia='ferramentas' AND nivel='INTERMEDIARIO';

-- PESSOAS · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Sem letramento em IA, o time se divide em 3 grupos: os que ignoram (estagnam), os que usam escondido (geram risco), os que usam mal (geram alucinação). Letramento é a base de tudo.',
  acao_pf_30d = 'Bloqueie 30 min/dia para AI training time — sua academia mental. 1 curso curto, 1 artigo, 1 novo workflow. Hábito > evento.',
  acao_pf_60d = 'Ensine alguém. Workshop de 1h para 5 colegas sobre "como uso IA na semana". Ensinar consolida e te posiciona como referência.',
  acao_pf_90d = 'Portfólio público: 3 cases reais (com permissão), 1 talk, presença ativa em comunidade. Sua marca de operador de IA vira moeda no mercado.',
  acao_pj_30d = 'Treinamento obrigatório de 4h para 100% dos colaboradores — fundamentos, casos práticos, riscos, política interna. Sem nivelar a base, nada escala.',
  acao_pj_60d = 'Workshop hands-on por área (vendas, marketing, RH, operações) com cases reais da sua empresa. Genérico não engaja — específico vira hábito.',
  acao_pj_90d = 'Comunidade interna de prática (Slack/Teams + encontros mensais) com champions por área. Aprendizagem horizontal escala mais que treinamento top-down.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"Generative AI for Everyone","fonte":"Andrew Ng / DeepLearning.AI","link":"https://www.deeplearning.ai/courses/generative-ai-for-everyone/"},
    {"tipo":"Livro","titulo":"Co-Intelligence","fonte":"Ethan Mollick","link":""},
    {"tipo":"Prática","titulo":"Build in public","fonte":"1 aprendizado/semana no LinkedIn","link":""},
    {"tipo":"Comunidade","titulo":"Lobo+IA","fonte":"Comunidade BR de IA aplicada","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Curso","titulo":"AI Literacy for HR Leaders","fonte":"SHRM / LinkedIn Learning","link":""},
    {"tipo":"Livro","titulo":"Reskilling Revolution","fonte":"World Economic Forum","link":""},
    {"tipo":"Framework","titulo":"AI Skills Taxonomy","fonte":"WEF Future of Jobs Report","link":"https://www.weforum.org/reports/the-future-of-jobs-report-2025/"},
    {"tipo":"Comunidade","titulo":"Conarh","fonte":"Maior congresso de RH da AL","link":""}
  ]'::jsonb
WHERE competencia='pessoas' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Champions internos escalam IA 10x mais rápido que consultoria externa — conhecem o contexto, têm crédito interno e ficam depois do projeto. Mas precisam de tempo, palco e patrocínio.',
  acao_pf_30d = 'Candidate-se a ser champion na sua área. Não espere convite — proponha um roadmap de IA de 90 dias para o seu time direto.',
  acao_pf_60d = 'Encontre mentor externo (paid ou troca de valor) em IA aplicada ao seu setor. 1h/semana acelera mais que 10h de curso isolado.',
  acao_pf_90d = 'Lidere uma iniciativa cross-funcional de IA. Resultado visível + network novo = combustível para próximo salto de carreira (interno ou externo).',
  acao_pj_30d = 'Identifique 1 champion por departamento via processo aberto (não indicação). Critério: curiosidade + influência informal — não cargo.',
  acao_pj_60d = 'Reserve 20% do tempo dos champions para IA (não "além do trabalho"). Cadência semanal com especialista externo + budget para experimentos.',
  acao_pj_90d = 'Champions lideram squads de IA com escopo, prazo e métrica. Reconheça publicamente (bônus, palco, promoção). Sem incentivo real, o champion vira fantasma.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"AI Product Manager Nanodegree","fonte":"Udacity","link":""},
    {"tipo":"Livro","titulo":"The Minto Pyramid Principle","fonte":"Barbara Minto","link":""},
    {"tipo":"Comunidade","titulo":"AI Tinkerers","fonte":"Hands-on builder meetups globais","link":"https://aitinkerers.org/"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"AI Champions Program","fonte":"Modelo BCG / Bain de liderança de mudança","link":""},
    {"tipo":"Livro","titulo":"The Heart of Change","fonte":"John Kotter","link":""},
    {"tipo":"Curso","titulo":"Change Management for AI Transformation","fonte":"Prosci","link":"https://www.prosci.com/"}
  ]'::jsonb
WHERE competencia='pessoas' AND nivel='INTERMEDIARIO';

-- ÉTICA · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'O dano reputacional por IA mal usada é assimétrico: ganhos vêm devagar, escândalos viralizam em 24h. Quem define diretrizes antes do incidente economiza milhões e blinda a marca.',
  acao_pf_30d = 'Crie sua checklist ética pessoal antes de usar IA em qualquer entregável: revelei a fonte? validei fatos? respeitei privacidade? evitei viés? imprima e cole no monitor.',
  acao_pf_60d = 'Estude 2 casos públicos de fracasso ético com IA (ex.: Amazon hiring tool, COMPAS, Tay) e escreva o que você teria feito diferente. Vire um leitor crítico, não fanboy.',
  acao_pf_90d = 'Adicione "AI Ethics" à sua bio profissional com lastro real: 1 post, 1 talk, 1 projeto. Em 2026 isso vira diferencial competitivo, não custo.',
  acao_pj_30d = 'Publique política interna de uso de IA em 1 página (sim/não, quem decide, como reportar incidente). Linguagem humana, não legalês.',
  acao_pj_60d = 'Treine time em vieses (gênero, raça, idade, regional) e responsabilidade. Aplique testes cegos em modelos antes de produção.',
  acao_pj_90d = 'Crie comitê de ética em IA multidisciplinar (legal + tech + negócio + RH + externo). Reúne mensalmente, decisões em ata pública interna.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"Ethics of AI","fonte":"University of Helsinki (gratuito)","link":"https://ethics-of-ai.mooc.fi/"},
    {"tipo":"Livro","titulo":"Weapons of Math Destruction","fonte":"Cathy O''Neil","link":""},
    {"tipo":"Livro","titulo":"Atlas of AI","fonte":"Kate Crawford","link":""},
    {"tipo":"Podcast","titulo":"The AI Ethics Brief","fonte":"Montreal AI Ethics Institute","link":"https://montrealethics.ai/"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"NIST AI Risk Management Framework","fonte":"NIST AI RMF 1.0","link":"https://www.nist.gov/itl/ai-risk-management-framework"},
    {"tipo":"Framework","titulo":"EU AI Act — guia executivo","fonte":"European Commission","link":"https://artificialintelligenceact.eu/"},
    {"tipo":"Livro","titulo":"AI Snake Oil","fonte":"Arvind Narayanan & Sayash Kapoor","link":""},
    {"tipo":"Comunidade","titulo":"IAPP — AI Governance Center","fonte":"International Association of Privacy Professionals","link":"https://iapp.org/"}
  ]'::jsonb
WHERE competencia='etica' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Modelo não-explicável é passivo legal e reputacional. Regulação (LGPD, EU AI Act, AI Act-BR) está saindo do papel — e a multa não pergunta se você é PME.',
  acao_pf_30d = 'Aprenda os 3 níveis de explicabilidade (global, local, contrafactual) com ferramentas como SHAP e LIME. Vira diferencial em entrevistas técnicas e regulatórias.',
  acao_pf_60d = 'Faça 1 auditoria fictícia (ou real, com permissão) de um modelo: documente vieses encontrados, recomendações, plano de mitigação. Material de portfólio premium.',
  acao_pf_90d = 'Especialize-se em AI Governance/Risk como vertical de carreira. Certificações como AIGP (IAPP) abrem porta para cargos escassos e bem pagos.',
  acao_pj_30d = 'Audite 1 caso de uso crítico quanto a vieses (gênero, raça, idade, geografia). Ferramentas: Aequitas, IBM AI Fairness 360, Microsoft Fairlearn.',
  acao_pj_60d = 'Documente todas as decisões algorítmicas em "model cards" (Google) e "datasheets for datasets" (Gebru et al.). Padrão para auditorias e venda B2B.',
  acao_pj_90d = 'Publique transparência: relatório anual de IA (modelos em uso, casos auditados, incidentes, melhorias). Pioneirismo vira moat regulatório nos próximos 24 meses.',
  aprendizado_pf = '[
    {"tipo":"Certificação","titulo":"AIGP — Artificial Intelligence Governance Professional","fonte":"IAPP","link":"https://iapp.org/certify/aigp/"},
    {"tipo":"Curso","titulo":"AI Safety Fundamentals","fonte":"BlueDot Impact (gratuito)","link":"https://aisafetyfundamentals.com/"},
    {"tipo":"Livro","titulo":"The Alignment Problem","fonte":"Brian Christian","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"ISO/IEC 42001 — AI Management System","fonte":"ISO","link":"https://www.iso.org/standard/81230.html"},
    {"tipo":"Framework","titulo":"OECD AI Principles","fonte":"OECD","link":"https://oecd.ai/en/ai-principles"},
    {"tipo":"Livro","titulo":"The Worlds I See","fonte":"Fei-Fei Li","link":""},
    {"tipo":"Comunidade","titulo":"Partnership on AI","fonte":"Multistakeholder","link":"https://partnershiponai.org/"}
  ]'::jsonb
WHERE competencia='etica' AND nivel='INTERMEDIARIO';

-- SEGURANÇA · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Funcionário colando dados sigilosos em chatbot público é um vazamento ativo acontecendo agora — sem alerta, sem log, sem volta. O caso Samsung + ChatGPT (2023) custou meses de IP.',
  acao_pf_30d = 'Faça uma "auditoria pessoal": liste tudo que você já colou em LLM público (clientes, salários, contratos, código). Pare. Revogue acessos de apps suspeitos.',
  acao_pf_60d = 'Aprenda a usar modelos locais (Ollama + LM Studio com Llama/Mistral) para dados sensíveis. Roda no seu laptop, zero vazamento, zero custo.',
  acao_pf_90d = 'Certifique-se em fundamentos de AI Security (ex.: ISC2 Certified in AI Security ou AI Safety Fundamentals da BlueDot). Diferencial enorme em vagas premium.',
  acao_pj_30d = 'Publique a lista de ferramentas homologadas (sim) e bloqueadas (não) + canal único de pedido. Comunique em town hall — não em e-mail que ninguém lê.',
  acao_pj_60d = 'Implemente DLP específico para IA (Microsoft Purview, Nightfall, Forcepoint AI Mesh). Bloqueia upload de dados classificados a chatbots não autorizados.',
  acao_pj_90d = 'Simule um incidente de vazamento via chatbot (red team). Treine liderança em resposta. Faça uma vez por trimestre — sem treino, política é teatro.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"AI Safety Fundamentals","fonte":"BlueDot Impact","link":"https://aisafetyfundamentals.com/"},
    {"tipo":"Prática","titulo":"Rode LLM local","fonte":"Ollama + Llama 3.1 no seu laptop","link":"https://ollama.com/"},
    {"tipo":"Newsletter","titulo":"Risky Business","fonte":"Segurança ofensiva semanal","link":"https://risky.biz/"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"OWASP Top 10 for LLM Applications","fonte":"OWASP","link":"https://owasp.org/www-project-top-10-for-large-language-model-applications/"},
    {"tipo":"Framework","titulo":"NIST AI RMF + Generative AI Profile","fonte":"NIST","link":"https://www.nist.gov/itl/ai-risk-management-framework"},
    {"tipo":"Curso","titulo":"Cybersecurity Leadership","fonte":"MIT Sloan Executive Education","link":""},
    {"tipo":"Comunidade","titulo":"CISO Brasil","fonte":"Encontros de líderes de segurança","link":""}
  ]'::jsonb
WHERE competencia='seguranca' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'IA em produção é superfície de ataque nova: prompt injection, model extraction, data poisoning. Controles tradicionais não cobrem — e o regulador vai cobrar mesmo assim.',
  acao_pf_30d = 'Estude OWASP Top 10 for LLM Apps. Reproduza 3 ataques em ambiente controlado (Gandalf, Lakera Red). Vira história forte em entrevista de Security/AI.',
  acao_pf_60d = 'Especialize-se em AI Red Team: combine pentest + prompt injection + jailbreaks. Vaga em alta, oferta escassa, salário top-tier.',
  acao_pf_90d = 'Apresente em conferência (CryptoRave, H2HC, BSides) ou publique writeup detalhado. Reputação na comunidade vira oferta de emprego direta.',
  acao_pj_30d = 'Contrate pen test específico para soluções de IA (não só app web). Empresas como Lakera, Adversa AI, Trail of Bits — não terceiriza para qualquer um.',
  acao_pj_60d = 'Implemente logging e monitoramento de prompts, outputs e custos por usuário/feature. Sem observability, incidente vira mistério caro.',
  acao_pj_90d = 'Tenha plano formal de resposta a incidentes de IA: quem é avisado, em quanto tempo, como contém, como comunica externamente. Tabletop exercise trimestral.',
  aprendizado_pf = '[
    {"tipo":"Prática","titulo":"Lakera Gandalf","fonte":"Desafio de prompt injection (gratuito)","link":"https://gandalf.lakera.ai/"},
    {"tipo":"Curso","titulo":"AI Red Team","fonte":"Securing AI / hands-on","link":""},
    {"tipo":"Comunidade","titulo":"AI Village @ DEF CON","fonte":"Comunidade global de AI Security","link":"https://aivillage.org/"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"MITRE ATLAS — Adversarial Threat Landscape for AI","fonte":"MITRE","link":"https://atlas.mitre.org/"},
    {"tipo":"Curso","titulo":"AI Security for Executives","fonte":"SANS Institute","link":"https://www.sans.org/"},
    {"tipo":"Comunidade","titulo":"FS-ISAC AI Working Group (setor financeiro)","fonte":"FS-ISAC","link":"https://www.fsisac.com/"}
  ]'::jsonb
WHERE competencia='seguranca' AND nivel='INTERMEDIARIO';

-- GOVERNANÇA · BÁSICO
UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Sem dono claro, IA vira "projeto de cada um e de ninguém". Governança não é burocracia — é o que impede 47 pilotos paralelos sem ROI, sem padrão e sem ninguém prestando contas.',
  acao_pf_30d = 'Para cada projeto seu com IA, defina (mesmo informalmente): dono, métrica de sucesso, prazo, critério de matar. Quem governa o próprio trabalho vira líder.',
  acao_pf_60d = 'Estude RACI aplicado a IA. Aprenda a desenhar quem é Responsável, Aprovador, Consultado, Informado em cada decisão automatizada. Material de proposta de promoção.',
  acao_pf_90d = 'Lidere a definição de governança em pelo menos 1 projeto de IA do seu time. Mesmo sem cargo formal, isso te coloca na mesa onde decisões acontecem.',
  acao_pj_30d = 'Nomeie sponsor executivo de IA (C-level, não gerente). Sem alguém com poder de alocar dinheiro e demitir, IA é hobby corporativo.',
  acao_pj_60d = 'Defina papéis: AI Lead (estratégia), AI PM (entrega), AI Engineer (build), AI Champion por área (adoção), Ethics Officer (risco). Pode ser overlap, não pode ser vazio.',
  acao_pj_90d = 'Estabeleça comitê multidisciplinar com cadência mensal: prioriza portfólio, libera budget, mata projetos sem ROI, audita riscos. Sem comitê, vira lobby.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"AI Product Management","fonte":"Reforge / Udacity","link":""},
    {"tipo":"Livro","titulo":"Inspired","fonte":"Marty Cagan","link":""},
    {"tipo":"Prática","titulo":"Escreva 1 PRD de IA","fonte":"Template público de PRD para feature de IA","link":""}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"COBIT 2019 + AI extensions","fonte":"ISACA","link":"https://www.isaca.org/resources/cobit"},
    {"tipo":"Curso","titulo":"Corporate Governance of AI","fonte":"Stanford GSB Executive Ed","link":""},
    {"tipo":"Livro","titulo":"The Geek Way","fonte":"Andrew McAfee","link":""},
    {"tipo":"Comunidade","titulo":"IBGC — grupos de Conselheiros sobre IA","fonte":"IBGC Brasil","link":"https://www.ibgc.org.br/"}
  ]'::jsonb
WHERE competencia='governanca' AND nivel='BASICO';

UPDATE public.ia_maturity_recommendations SET
  por_que_importa = 'Sem pipeline claro do conceito ao deploy, projetos morrem na transição "POC → produção" — o cemitério mais caro de IA. Padronizar isso libera 5x mais valor com a mesma equipe.',
  acao_pf_30d = 'Domine 1 framework de business case (ex.: ICE, RICE, MoSCoW). Vai usar em 100% das próximas conversas sobre priorização de IA.',
  acao_pf_60d = 'Aprenda a construir post-mortems honestos de projetos de IA (o que funcionou, o que não, o que tentaria diferente). Skill rara, valorizadíssima.',
  acao_pf_90d = 'Vire o PM/Lead go-to da empresa para projetos de IA. Reputação aqui = headhunter te liga para vagas de Head of AI Product.',
  acao_pj_30d = 'Crie template padronizado de business case de IA: problema, hipótese, dados, modelo, métrica, risco, custo, ROI. Vire pré-requisito de aprovação.',
  acao_pj_60d = 'Defina critérios go/no-go por estágio (POC → MVP → Produção → Scale). Mate o que não passa. Sem disciplina, portfólio vira lixão.',
  acao_pj_90d = 'Implemente revisão trimestral de portfólio com o comitê. Mantenha "kill list" pública internamente. Coragem de matar projetos separa cultura madura de teatro.',
  aprendizado_pf = '[
    {"tipo":"Curso","titulo":"AI for Product Managers","fonte":"Reforge","link":""},
    {"tipo":"Livro","titulo":"Escaping the Build Trap","fonte":"Melissa Perri","link":""},
    {"tipo":"Newsletter","titulo":"Lenny''s Newsletter — AI PM","fonte":"Lenny Rachitsky","link":"https://www.lennysnewsletter.com/"}
  ]'::jsonb,
  aprendizado_pj = '[
    {"tipo":"Framework","titulo":"CRISP-DM atualizado para IA generativa","fonte":"Adaptação do clássico","link":""},
    {"tipo":"Curso","titulo":"Strategic AI Leadership","fonte":"Cornell + LinkedIn Learning","link":""},
    {"tipo":"Livro","titulo":"Trillion Dollar Coach","fonte":"Bill Campbell","link":""},
    {"tipo":"Comunidade","titulo":"Endeavor — Conselheiros de tech","fonte":"Endeavor BR","link":"https://endeavor.org.br/"}
  ]'::jsonb
WHERE competencia='governanca' AND nivel='INTERMEDIARIO';
