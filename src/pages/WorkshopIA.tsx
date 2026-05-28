import CommercialLanding from "@/components/CommercialLanding";

export default function WorkshopIA() {
  return (
    <CommercialLanding
      slug="workshop-ia"
      kicker="Workshop de IA in-company"
      h1="Workshop de Inteligência Artificial para"
      h1Highlight="times de marketing e negócios"
      subtitle="Imersões práticas in-company para destravar o uso real de IA generativa: do prompt à orquestração de fluxos, com exercícios baseados nos casos reais da sua operação."
      seoTitle="Workshop de IA in-company — Jefferson Lobo | Imersão prática de IA"
      seoDescription="Workshop in-company de Inteligência Artificial para times de marketing, vendas e negócios. Imersão prática, hands-on, com casos reais da sua empresa. Presencial ou online."
      serviceType="Workshop de Inteligência Artificial"
      forWho={[
        "Times de marketing que precisam sair da fase de 'brincar com ChatGPT' para fluxos produtivos reais",
        "Diretorias que querem capacitar gerência intermediária para liderar projetos de IA",
        "Empresas que cansaram de cursos gravados genéricos e querem mão na massa com o próprio contexto",
        "Áreas de comunicação, comercial e operações estruturando o próximo trimestre com IA no centro",
      ]}
      deliverables={[
        {
          title: "Roteiro hands-on",
          description:
            "Estrutura modular com exercícios práticos aplicados em ferramentas reais (ChatGPT, Gemini, Claude, agentes) usando casos da própria empresa.",
        },
        {
          title: "Biblioteca de prompts",
          description:
            "Conjunto de prompts e fluxos prontos para o time aplicar no dia seguinte, organizados por função (copy, análise, pesquisa, atendimento).",
        },
        {
          title: "Plano de aplicação",
          description:
            "Documento de saída com próximos passos, quick wins e roadmap de 90 dias adaptado à maturidade real do time.",
        },
      ]}
      formats={[
        {
          name: "Workshop intensivo (1 dia)",
          duration: "6 a 8 horas",
          description:
            "Imersão completa em um único dia: fundamentos, prática guiada e construção de fluxos. Ideal para times de até 30 pessoas.",
        },
        {
          name: "Trilha em módulos",
          duration: "4 encontros de 3h",
          description:
            "Distribuído em semanas, com lições de casa entre módulos. Melhor absorção e tempo para o time aplicar entre encontros.",
        },
        {
          name: "Workshop executivo",
          duration: "Meio período",
          description:
            "Formato condensado para diretoria e gerência sênior, com foco em decisão estratégica e governança de IA.",
        },
      ]}
      faq={[
        {
          q: "O workshop é presencial ou online?",
          a: "Ambos os formatos estão disponíveis. Presencial gera mais conexão e troca; online permite envolver times distribuídos em várias praças. A escolha depende do objetivo e da geografia do seu time.",
        },
        {
          q: "Qual o tamanho ideal de turma?",
          a: "Para hands-on com qualidade, recomendamos turmas de até 30 pessoas. Para grupos maiores, podemos desenhar formato híbrido com keynote para todos e oficinas em paralelo para subgrupos.",
        },
        {
          q: "O time precisa ter conhecimento prévio em IA?",
          a: "Não. O workshop é desenhado a partir do nível real do time, identificado em briefing prévio. Existe versão para iniciantes (do zero ao primeiro fluxo) e para times já intermediários (orquestração e agentes).",
        },
        {
          q: "Quais ferramentas são usadas no workshop?",
          a: "Ferramentas gratuitas e amplamente disponíveis (ChatGPT, Gemini, Claude) e, quando faz sentido, demonstrações de plataformas de agentes e automação. Não exige licenças corporativas para começar.",
        },
        {
          q: "É possível customizar o conteúdo para o setor da empresa?",
          a: "Sim — esse é o diferencial. Antes do workshop, fazemos um briefing aprofundado para mapear o setor, fluxos críticos, dores específicas e adaptar todos os exercícios ao contexto real.",
        },
      ]}
    />
  );
}
