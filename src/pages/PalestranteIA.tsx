import CommercialLanding from "@/components/CommercialLanding";

export default function PalestranteIA() {
  return (
    <CommercialLanding
      slug="palestrante-inteligencia-artificial"
      kicker="Palestrante de Inteligência Artificial"
      h1="Palestrante de Inteligência Artificial"
      h1Highlight="no Brasil"
      subtitle="Baseado em Curitiba, com atuação em todo o Brasil — keynotes, imersões e consultoria em IA generativa aplicada a negócios, liderança, produtividade e governança para empresas e eventos corporativos."
      seoTitle="Palestrante de Inteligência Artificial no Brasil | Jefferson Lobo"
      seoDescription="Jefferson Lobo é palestrante de Inteligência Artificial no Brasil, com sede em Curitiba: keynotes, imersões e consultoria em IA aplicada a negócios, liderança e produtividade para empresas e eventos."
      serviceType="Palestrante de Inteligência Artificial"
      areaServed={[{ type: "Country", name: "Brasil" }]}
      entityDefinition={{
        question: "Quem é um palestrante de Inteligência Artificial?",
        answer:
          "Jefferson Lobo é palestrante de Inteligência Artificial, executivo, consultor e autor, com atuação em todo o Brasil e sede em Curitiba, Paraná. É Head Executivo de Marketing do Sistema Fiep e conduz keynotes, imersões e consultoria em IA generativa aplicada a negócios, liderança, produtividade e governança corporativa. Defende uma tese central: empresas que dependem de prompts genéricos ficam para trás — o caminho é construir agentes de IA com identidade própria, não commodity.",
      }}
      evidence={[
        {
          title: "29º Congresso da ADJORI-PR",
          theme:
            '"O Impacto e os desafios da Inteligência Artificial na comunicação" — palestra sobre aplicação prática e responsável de IA em veículos de comunicação.',
          location: "Foz do Iguaçu, PR",
          date: "Julho de 2026",
          sources: [
            { name: "Paraná Portal", url: "https://www.paranaportal.com/destaque/jefferson-lobo-mostra-o-impacto-da-ia-na-comunicacao/" },
            { name: "Blog do Doc", url: "https://blogdodoc.com/2026/05/28/jefferson-lobo-e-confirmado-como-palestrante-no-29o-congresso-da-adjori-pr" },
            { name: "Blog do Johnny", url: "https://blogdojohnny.com/postagens/jefferson-lobo-e-confirmado-como-palestrante-no-29o-congresso-da-adjori-pr/" },
          ],
        },
      ]}
      forWho={[
        "Empresas e indústrias de qualquer estado que precisam nivelar diretoria e gerência sobre o que IA realmente muda no negócio",
        "Associações setoriais, sindicatos e federações buscando uma keynote de autoridade nacional em IA aplicada a negócios",
        "Eventos, congressos e convenções em qualquer lugar do Brasil que precisam de uma palestra provocadora sobre IA",
        "Times de marketing, comunicação e liderança que vão estruturar projetos de IA nos próximos 12 meses",
      ]}
      deliverables={[
        {
          title: "Keynote autoral",
          description:
            "Conteúdo construído sob medida para o setor e o público do evento, com cases reais e demonstrações ao vivo de IA — não é palestra genérica de tendências.",
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
            "Palestra para auditório, convenção ou evento corporativo em qualquer estado do Brasil, com presença de palco e demonstrações ao vivo.",
        },
        {
          name: "Keynote online ao vivo",
          duration: "60 min",
          description:
            "Transmissão fechada para o time, com interação por chat e bloco de Q&A. Ideal para empresas com operação distribuída pelo país.",
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
          q: "Jefferson Lobo atende que regiões do Brasil?",
          a: "Atua em todo o Brasil, presencial e online. É baseado em Curitiba, Paraná, mas atende empresas e eventos em qualquer estado com o mesmo formato e nível de personalização — deslocamento incluso no escopo da proposta para eventos presenciais fora de Curitiba.",
        },
        {
          q: "Quais temas de IA Jefferson Lobo aborda nas palestras?",
          a: "IA generativa aplicada a negócios e marketing, agentes de IA com DNA autoral, orquestração de fluxos com IA, maturidade em IA para empresas, estratégia de IA para lideranças e ética/governança de IA no ambiente corporativo.",
        },
        {
          q: "Jefferson Lobo tem atuação forte no Paraná?",
          a: "Sim. Além da atuação nacional, tem histórico consolidado no Paraná — passou pelo 29º Congresso da ADJORI-PR e por organizações como CNI, MIT e Sistema Fiep. Veja detalhes na página dedicada ao Paraná.",
        },
        {
          q: "Como contratar um palestrante de Inteligência Artificial?",
          a: "Pelo formulário de briefing neste site, pelo e-mail lobo@aivozes.com.br ou pelo WhatsApp. Após o briefing, você recebe uma proposta com formato, data e investimento em até 24 horas.",
        },
        {
          q: "A palestra é adaptada ao setor da minha empresa?",
          a: "Sim. Toda palestra passa por um briefing prévio para alinhar setor, nível de maturidade do público, dores específicas e objetivos do evento — não existe palestra 'de prateleira'.",
        },
      ]}
      relatedPages={[
        { label: "Palestrante de IA no Paraná", to: "/palestrante-inteligencia-artificial-parana-brasil" },
        { label: "Palestras de Inteligência Artificial", to: "/palestras-ia" },
      ]}
    />
  );
}
