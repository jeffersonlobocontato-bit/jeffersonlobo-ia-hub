// Fonte única da base de conhecimento estática do Jefferson Lobo.
// Usada tanto por populate-knowledge (indexação em embeddings para o RAG)
// quanto por chat-uivo-lobo (fallback direto no prompt quando o RAG não
// encontra nada relevante) — antes esse conteúdo existia duplicado nos
// dois arquivos e podia ficar dessincronizado.

export interface KnowledgeDoc {
  titulo: string;
  fonte: string;
  categoria: string;
  conteudo: string;
}

export const KNOWLEDGE_DOCUMENTS: KnowledgeDoc[] = [
  {
    titulo: 'Método DEL - Visão Geral',
    fonte: 'Livro Método DEL',
    categoria: 'metodo-del',
    conteudo: `O Método DEL (Decomposição de Estrutura de Linguagem) é a metodologia proprietária de Jefferson Lobo para criação de agentes de IA personalizados com fidelidade autoral.

O DEL surge como resposta à homogeneização discursiva das IAs generativas, oferecendo um modelo técnico-científico para criar agentes com alto grau de fidelidade ao estilo original.

A linguagem é tratada como ativo estratégico, e a autoria em sua forma estrutural, semântica e lexical é replicável, governável e auditável.`,
  },
  {
    titulo: 'Método DEL - Três Eixos',
    fonte: 'Livro Método DEL',
    categoria: 'metodo-del',
    conteudo: `Os três eixos do Método DEL:

1. **Eixo Sintático**: Estrutura gramatical, ordenação de palavras, pontuação e organização frasal
2. **Eixo Semântico**: Significados, conceitos, relações entre termos e campos semânticos
3. **Eixo Lexical**: Escolhas vocabulares específicas, termos técnicos e preferências linguísticas

O método analisa esses três eixos para capturar o DNA autoral de uma marca ou pessoa.`,
  },
  {
    titulo: 'Método DEL - Aplicações',
    fonte: 'Livro Método DEL',
    categoria: 'metodo-del',
    conteudo: `Aplicações do Método DEL por setor:

**Marketing**: Criação de conteúdo com tom de marca consistente
**Jurídico**: Documentos com linguagem técnica precisa
**RH**: Comunicação alinhada à cultura organizacional
**Educação**: Material didático personalizado

O DEL cria agentes que escrevem como sua marca, são personalizados, protegem reputação e mantêm consistência.`,
  },
  {
    titulo: 'Guia de IA - Fundamentos',
    fonte: 'Guia de IA',
    categoria: 'fundamentos',
    conteudo: `IA são sistemas que executam tarefas que requerem inteligência humana: classificar, prever, gerar e decidir.

Principais ramos: Aprendizado de Máquina (ML), Deep Learning, NLP (linguagem), Visão Computacional, Recomendação e Otimização.

IA Generativa: modelos que criam texto, imagem, som, vídeo e código; úteis para prototipagem rápida e automação criativa.`,
  },
  {
    titulo: 'Competências Essenciais em IA',
    fonte: 'Guia de IA',
    categoria: 'competencias',
    conteudo: `Competências essenciais para trabalhar com IA:

1. **Engenharia de prompts**: estruturar pedidos, delimitar papéis, formato de saída, dar exemplos e iterar
2. **Raciocínio e verificação**: peça etapas ("pense passo a passo"), verifique fontes, crie checagens automáticas
3. **Dados**: coletar, higienizar, etiquetar e manter versões; entenda limites (viés, amostras pequenas)
4. **Automação**: compor IA com scripts (Python), APIs, ou plataformas no/low-code
5. **Ética/privacidade**: minimize dados sensíveis; registre consentimentos; avalie riscos`,
  },
  {
    titulo: 'Casos de Uso Pessoais de IA',
    fonte: 'Guia de IA',
    categoria: 'casos-uso',
    conteudo: `Casos de uso de IA em projetos pessoais:

- **Aprendizado**: resumos dirigidos, flashcards, planos de estudo personalizados
- **Produtividade**: priorização de tarefas, rascunhos de e-mails, entrevistas simuladas
- **Criação**: geração de posts, roteiros, descrições de produto, capas e thumbnails
- **Organização**: extração de informações de PDFs/notas, etiquetagem automática, pesquisa semântica`,
  },
  {
    titulo: 'Casos de Uso Profissionais de IA',
    fonte: 'Guia de IA',
    categoria: 'casos-uso',
    conteudo: `Casos de uso profissionais de IA:

- **Marketing/Conteúdo**: variações de copy, SEO briefs, roteiros de vídeo, análise de concorrentes
- **Atendimento**: FAQs com RAG, classificação de tickets, respostas sugeridas
- **Dados & Analytics**: geração de SQL, explicações de dashboards, alertas inteligentes
- **Design/Produto**: ideação rápida, protótipos, análise de feedbacks
- **Operações**: triagem de documentos, extração de campos, geração de relatórios`,
  },
  {
    titulo: 'Boas Práticas de Prompts',
    fonte: 'Guia de IA',
    categoria: 'prompts',
    conteudo: `Receita para criar bons prompts:

1. Defina o **papel** ("Você é um analista de dados…")
2. Forneça **contexto** (objetivo, público, restrições)
3. Especifique **formato de saída** (JSON, tabela, bullets)
4. Inclua **exemplos** ("dado X → resposta Y")
5. Peça **planos/etapas** e **checagem** ("liste suposições; valide com fontes")
6. **Itere**: compare 2-3 versões e escolha a melhor`,
  },
  {
    titulo: 'Playbook - Estratégia e Governança',
    fonte: 'Playbook Empresas',
    categoria: 'governanca',
    conteudo: `Estratégia e governança de IA nas empresas:

- **Patrocínio executivo** e objetivos mensuráveis (OKRs)
- **Framework de risco**: NIST AI RMF (Govern, Map, Measure, Manage)
- **Sistema de gestão**: ISO/IEC 42001 (políticas, responsabilidades, melhoria contínua)
- **Políticas internas**: uso responsável, privacidade, segurança, revisão humana
- **Comitê de IA**: negócios, dados/ML, jurídico, segurança e RH`,
  },
  {
    titulo: 'Playbook - Arquitetura RAG',
    fonte: 'Playbook Empresas',
    categoria: 'arquitetura',
    conteudo: `Arquitetura de RAG corporativo:

- **Index**: Vector DB para busca semântica
- **Guardrails**: Validações e limites de segurança
- **Observabilidade**: Logs, métricas e monitoramento
- **Feedback humano**: Ciclo de melhoria contínua
- **Integrações**: CRM/ERP/ITSM, Single Sign-On, auditoria centralizada`,
  },
  {
    titulo: 'Playbook - Conformidade',
    fonte: 'Playbook Empresas',
    categoria: 'conformidade',
    conteudo: `Conformidade e risco em IA:

**EU AI Act**: Classifique o caso (proibido, alto risco, transparência/GPAI)
**LGPD**: Base legal, minimização, DPO, direitos do titular, DPIA quando aplicável
**Segurança**: Segregação de dados, criptografia, mascaramento, testes adversariais
**Transparência**: Rotule conteúdos gerados, trilhas de auditoria, documentação técnica`,
  },
  {
    titulo: 'Roteiro de Aprendizado - Fundamentos',
    fonte: 'Roteiro Aprendizado',
    categoria: 'aprendizado',
    conteudo: `Roteiro de aprendizado em IA - Fundamentos (2-4 semanas):

- Conceitos de ML, overfitting/underfitting, validação, métricas
- Python científico: NumPy, Pandas, scikit-learn
- Projeto prático: classificações simples com avaliação e explicações

Pré-requisitos: Lógica, estatística básica, Python básico`,
  },
  {
    titulo: 'Roteiro de Aprendizado - NLP',
    fonte: 'Roteiro Aprendizado',
    categoria: 'aprendizado',
    conteudo: `Roteiro de aprendizado - NLP e Transformers (3-6 semanas):

- Tokenização, embeddings, atenção, arquitetura Transformers
- Prática com Hugging Face Transformers (pipelines, fine-tuning)
- Projeto: RAG básico com avaliação de utilidade

Recursos: Hugging Face Transformers Docs, LLM Course`,
  },
  {
    titulo: 'Roteiro de Aprendizado - LLMs',
    fonte: 'Roteiro Aprendizado',
    categoria: 'aprendizado',
    conteudo: `Roteiro de aprendizado - LLMs e IA Generativa:

- Engenharia de prompts avançada
- Cadeias com LangChain
- Agentes com ferramentas
- Avaliação de LLMs (factualidade, toxidade, custo, latência)
- Projeto: Assistente corporativo com RAG e guardrails`,
  },
  {
    titulo: 'Templates de Prompt - Extração',
    fonte: 'Modelos e Templates',
    categoria: 'templates',
    conteudo: `Template para análise e extração estruturada:

Sistema: Você é um analista que extrai informações com alta precisão.
Usuário: Extraia os campos abaixo do documento fornecido.
Saída obrigatória em JSON com chaves fixas: {{campos}}.
Valide inconsistências e reporte "incompleto" quando faltar dado.`,
  },
  {
    titulo: 'Templates de Prompt - RAG',
    fonte: 'Modelos e Templates',
    categoria: 'templates',
    conteudo: `Template para assistente com RAG:

Sistema: Você responde APENAS com base em trechos citados.
Quando faltar evidência, diga "não encontrado".
Usuário: {{pergunta}}
Ferramentas: {{busca/vetor}}
Formato: resposta + lista de trechos com fonte`,
  },
  {
    titulo: 'Ferramentas Recomendadas',
    fonte: 'Guia de IA',
    categoria: 'ferramentas',
    conteudo: `Ferramentas recomendadas para trabalhar com IA:

**LLMs/chat**: ChatGPT, Claude, Gemini, Llama 3
**Imagens/Vídeo**: Midjourney, Ideogram, Runway, Pika
**Automação**: Zapier, Make, n8n
**Dev/ML**: Python, Hugging Face, LangChain, OpenAI/Vertex/Bedrock
**Busca semântica**: FAISS, Pinecone, Weaviate
**Conformidade**: NIST AI RMF, ISO/IEC 42001, LGPD, EU AI Act`,
  },
];

// Resumo compacto (títulos + primeiras linhas) usado como fallback direto
// no prompt do chat-uivo-lobo — não é o conteúdo inteiro, só o suficiente
// pra o modelo saber que recurso existe e mencionar corretamente. O
// conteúdo completo por trecho vem do RAG (busca vetorial), não daqui.
export const KNOWLEDGE_TOPICS_SUMMARY = KNOWLEDGE_DOCUMENTS
  .map((d) => `- **${d.titulo}** (${d.fonte})`)
  .join('\n');
