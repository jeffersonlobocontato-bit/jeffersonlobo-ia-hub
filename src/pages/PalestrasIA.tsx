import CommercialLanding from "@/components/CommercialLanding";

export default function PalestrasIA() {
  return (
    <CommercialLanding
      slug="palestras-ia"
      kicker="Palestras de Inteligência Artificial"
      h1="Palestras de Inteligência Artificial para"
      h1Highlight="empresas e lideranças"
      subtitle="Keynotes presenciais e online sobre IA generativa, agentes, marketing e estratégia — para convenções, kickoffs, lideranças C-level e eventos corporativos em todo o Brasil."
      seoTitle="Palestras de Inteligência Artificial — Jefferson Lobo | Palestrante IA"
      seoDescription="Contrate uma palestra de Inteligência Artificial com Jefferson Lobo: keynotes sobre IA generativa, marketing com IA, agentes e estratégia para empresas. Atende todo o Brasil."
      serviceType="Palestras de Inteligência Artificial"
      forWho={[
        "Convenções de vendas, marketing e líderes que precisam de uma keynote provocadora sobre IA",
        "Empresas que querem nivelar diretoria e gerência sobre o que IA realmente muda no negócio",
        "Eventos corporativos, sindicatos e associações setoriais buscando autoridade nacional em IA",
        "Times de marketing e comunicação que vão estruturar projetos de IA nos próximos 12 meses",
      ]}
      deliverables={[
        {
          title: "Keynote autoral",
          description:
            "Conteúdo construído sob medida para o seu público, com cases reais, demonstrações ao vivo de IA e teses proprietárias — não é palestra genérica de 'tendências'.",
        },
        {
          title: "Q&A executivo",
          description:
            "Bloco de perguntas e respostas com lideranças, transformando dúvidas em direção acionável para a estratégia da empresa.",
        },
        {
          title: "Material de apoio",
          description:
            "Resumo executivo pós-evento com principais insights, ferramentas citadas e próximos passos sugeridos para o time aplicar.",
        },
      ]}
      formats={[
        {
          name: "Keynote presencial",
          duration: "45 a 90 min",
          description:
            "Palestra para auditório, convenção ou evento corporativo, com presença de palco e demonstrações ao vivo.",
        },
        {
          name: "Keynote online ao vivo",
          duration: "60 min",
          description:
            "Transmissão fechada para o time, com interação por chat e bloco de Q&A. Ideal para empresas com operação distribuída.",
        },
        {
          name: "Palestra + painel executivo",
          duration: "Meio período",
          description:
            "Keynote seguida de mesa fechada com diretoria para discutir aplicação prática no contexto da empresa.",
        },
      ]}
      faq={[
        {
          q: "Quais temas de IA Jefferson Lobo aborda nas palestras?",
          a: "IA generativa aplicada a marketing e negócios, agentes de IA com DNA autoral, orquestração de fluxos com IA, maturidade em IA para empresas, estratégia de IA para lideranças e ética/governança de IA no ambiente corporativo brasileiro.",
        },
        {
          q: "A palestra é adaptada ao público da empresa?",
          a: "Sim. Toda palestra passa por um briefing prévio com a empresa contratante para alinhar setor, nível de maturidade do público, dores específicas e objetivos do evento. Não existe palestra 'de prateleira'.",
        },
        {
          q: "Jefferson Lobo atende eventos fora do Paraná?",
          a: "Sim. Atende todo o Brasil em formato presencial, com deslocamento incluído no escopo da proposta, além de keynotes online para empresas com operação distribuída.",
        },
        {
          q: "Como funciona o investimento?",
          a: "O investimento varia conforme formato (presencial ou online), duração, deslocamento e nível de personalização. Após o briefing, você recebe uma proposta detalhada em até 24 horas.",
        },
        {
          q: "Quanto tempo de antecedência preciso para contratar?",
          a: "O ideal é entre 30 e 60 dias para garantir agenda e personalização adequada. Para eventos urgentes (até 15 dias), entre em contato para verificar disponibilidade.",
        },
      ]}
    />
  );
}
