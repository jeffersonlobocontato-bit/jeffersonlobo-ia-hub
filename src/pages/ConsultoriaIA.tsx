import CommercialLanding from "@/components/CommercialLanding";

export default function ConsultoriaIA() {
  return (
    <CommercialLanding
      slug="consultoria-ia"
      kicker="Consultoria estratégica em IA"
      h1="Consultoria de Inteligência Artificial para"
      h1Highlight="lideranças que vão decidir"
      subtitle="Acompanhamento estratégico para diretoria e C-level: diagnóstico de maturidade, definição de roadmap de IA, governança, escolha de stack e orquestração de fluxos com identidade de marca."
      seoTitle="Consultoria de Inteligência Artificial — Jefferson Lobo | Estratégia de IA"
      seoDescription="Consultoria estratégica de IA para diretoria e C-level: diagnóstico de maturidade, roadmap, governança e orquestração de fluxos de IA com Jefferson Lobo. Atende todo o Brasil."
      serviceType="Consultoria de Inteligência Artificial"
      sober
      forWho={[
        "Diretoria e C-level que precisam decidir onde investir em IA nos próximos 12 a 24 meses",
        "Empresas que querem estruturar governança e política interna de uso de IA generativa",
        "Times de marketing e produto desenhando agentes de IA com identidade própria (DNA autoral)",
        "Lideranças que receberam pressão do board para 'fazer alguma coisa com IA' e querem fazer certo",
      ]}
      deliverables={[
        {
          title: "Diagnóstico de maturidade",
          description:
            "Avaliação estruturada da maturidade real da empresa em IA — pessoas, processos, dados e governança — com benchmark setorial.",
        },
        {
          title: "Roadmap de 12 meses",
          description:
            "Plano priorizado de iniciativas, com quick wins, projetos estruturantes e métricas de acompanhamento por trimestre.",
        },
        {
          title: "Acompanhamento executivo",
          description:
            "Sessões mensais com a liderança para revisar avanço, ajustar rota e destravar bloqueios — não é entrega-e-some.",
        },
      ]}
      formats={[
        {
          name: "Sprint de diagnóstico",
          duration: "4 a 6 semanas",
          description:
            "Imersão inicial: entrevistas com stakeholders, análise de processos e entrega do diagnóstico + roadmap priorizado.",
        },
        {
          name: "Acompanhamento estratégico",
          duration: "6 a 12 meses",
          description:
            "Mensoria executiva contínua com cadência mensal, apoio à diretoria nas decisões e revisões trimestrais do roadmap.",
        },
        {
          name: "Mentoria pontual de liderança",
          duration: "Por sessão",
          description:
            "Sessões individuais com diretores ou CMOs para discutir decisões específicas de IA — formato enxuto e cirúrgico.",
        },
      ]}
      faq={[
        {
          q: "Qual a diferença entre consultoria e workshop?",
          a: "Workshop capacita o time em fluxos práticos de IA (mão na massa). Consultoria atua no nível estratégico: define onde a empresa deve investir em IA, com que governança, em qual ordem e com que métricas de sucesso — é direcionada à diretoria.",
        },
        {
          q: "A consultoria entrega projetos de IA prontos?",
          a: "Não. O modelo é de direção estratégica e governança — o desenho do caminho, escolha de stack, prioridades e métricas. A execução técnica fica com o time interno ou com fornecedores indicados, mantendo a empresa no controle do conhecimento.",
        },
        {
          q: "Como funciona o sigilo das informações compartilhadas?",
          a: "Toda contratação prevê NDA (acordo de confidencialidade) padrão. As informações estratégicas, dados de negócio e decisões discutidas são tratadas com sigilo profissional integral.",
        },
        {
          q: "Em quanto tempo vejo resultado?",
          a: "Quick wins identificados no diagnóstico tipicamente entregam ganho de produtividade em 30 a 60 dias. Resultados estruturais de governança e roadmap aparecem a partir do segundo trimestre de acompanhamento.",
        },
        {
          q: "A consultoria substitui um CTO ou líder técnico de IA?",
          a: "Não substitui — complementa. Funciona como mentoria executiva para o C-level e como conselheiro estratégico para o líder técnico existente, acelerando a curva de decisão sem competir com o time interno.",
        },
      ]}
    />
  );
}
