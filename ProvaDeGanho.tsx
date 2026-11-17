import { SEO } from "@/components/SEO";
import { PERSON_LD } from "@/lib/seo";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, ExternalLink, Play } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useTrackCTA } from "@/hooks/useTrackCTA";

/*
 * /provadeganho — página do Método Prova de Ganho (nov/2026).
 * O que se vende é o método; o Kerdia ROI é o painel onde o cliente acompanha o ganho.
 * Quem contrata e entrega: Agência de Inteligência Vozes (nunca usar a sigla nas peças).
 * Números do caso Vozes Paranaenses: banco do portal, 30 dias até 15/11/2026.
 */

const SITE_URL = "https://jeffersonlobo.tech";
const URL = `${SITE_URL}/provadeganho`;
const WHATSAPP =
  "https://wa.me/5545999864213?text=" +
  encodeURIComponent("Olá, Jefferson! Quero agendar o diagnóstico do Método Prova de Ganho para a minha empresa.");
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

// Vídeo hospedado no próprio site: nada é baixado até o clique (preload="none");
// celular recebe a versão 720p, telas maiores a 1080p. Arquivos em public/video/.
const VIDEO = {
  capa: "/video/metodo-prova-de-ganho-capa.jpg",
  hd: "/video/metodo-prova-de-ganho-1080.mp4",
  leve: "/video/metodo-prova-de-ganho-720.mp4",
  duracao: "PT3M37S",
  publicado: "2026-11-18",
};

function VideoMetodo({ onPlay }: { onPlay: () => void }) {
  const ref = useRef<HTMLVideoElement>(null);
  const [src, setSrc] = useState(VIDEO.hd);
  const [tocando, setTocando] = useState(false);
  useEffect(() => {
    if (window.matchMedia("(max-width: 900px)").matches) setSrc(VIDEO.leve);
  }, []);
  const tocar = () => {
    setTocando(true);
    onPlay();
    requestAnimationFrame(() => ref.current?.play().catch(() => {}));
  };
  return (
    <figure className="space-y-3">
      <div className="relative overflow-hidden rounded-[24px] border border-primary/30 bg-black shadow-[0_0_80px_-30px_hsl(var(--primary))] aspect-video">
        <video
          ref={ref}
          src={src}
          poster={VIDEO.capa}
          preload="none"
          controls={tocando}
          playsInline
          className="h-full w-full object-cover"
          aria-label="Vídeo: o Método Prova de Ganho por dentro, num caso real"
        />
        {!tocando && (
          <button
            type="button"
            onClick={tocar}
            className="group absolute inset-0 flex items-end justify-center p-5 md:p-8 bg-black/10 transition-colors hover:bg-black/0"
            aria-label="Assistir ao vídeo do método (3 minutos)"
          >
            <span className="inline-flex items-center gap-3 rounded-full border border-primary/60 bg-background/80 px-5 py-3 backdrop-blur shadow-[0_0_40px_-6px_hsl(var(--primary))] transition-transform group-hover:scale-105">
              <Play className="h-5 w-5 text-primary" fill="currentColor" />
              <span className="text-sm font-medium text-foreground" style={mono}>Assistir · 3 min</span>
            </span>
          </button>
        )}
      </div>
      <figcaption className="text-sm text-muted-foreground" style={mono}>
        3 minutos: o método por dentro, num caso real.
      </figcaption>
    </figure>
  );
}

const custos = [
  { n: "Licenças", d: "Assentos de ferramentas de IA pagos todo mês, usados por quem e para quê?" },
  { n: "Créditos", d: "Consumo de modelos que sobe com o volume, sem ninguém saber quanto custa cada entrega." },
  { n: "Horas testando", d: "Pilotos que nunca terminam: time ocupado, ganho nunca medido." },
];

const fases = [
  {
    n: "01",
    nome: "Panorama",
    faz: "Descobre onde a empresa perde: o que custa caro e ninguém mede, o que quebra se a demanda dobrar. O cliente responde conversando, não preenchendo formulário.",
    portao: "A",
    decide: "O mapa de perdas está completo e com número?",
  },
  {
    n: "02",
    nome: "Rota",
    faz: "Toda ideia vira uma ficha de ROI com a fonte de cada número, e com a pergunta que quase ninguém faz: quanto custaria resolver sem IA?",
    portao: "B",
    decide: "O conselho escolhe o que vale a pena, com a alternativa sem IA na mesa.",
  },
  {
    n: "03",
    nome: "Ensaio",
    faz: "A oportunidade escolhida vira um teste pequeno, com linha de base, alvo e medição, e um mapa de quem faz o quê: máquina, pessoa ou os dois.",
    portao: "C",
    decide: "Provou ganho? Escala. Não provou? Ajusta ou encerra.",
  },
  {
    n: "04",
    nome: "Escala",
    faz: "O agente que escala ganha um crachá: o que faz, o que não faz, o que guarda, onde age e até onde.",
    portao: "D",
    decide: "Sem crachá e sem metas, não entra em produção.",
  },
  {
    n: "05",
    nome: "Rotina",
    faz: "Em produção, cada solução é medida todo mês: acerto, custo, tempo e retorno. Saiu da meta, a Sentinela avisa.",
    portao: null,
    decide: "O que sai da meta volta para o mapa.",
  },
];

const ganhos = [
  { n: "Ganho previsto", d: "O que a ficha aprovada prometeu, em reais por mês." },
  { n: "Ganho realizado", d: "O que o último mês fechado entregou, já descontado o custo da solução." },
  { n: "Capacidade liberada", d: "Horas que deixaram de ser necessárias, e quantas pessoas de tempo integral isso representa." },
  { n: "Custo evitado", d: "O gasto que não aconteceu: a contratação, a ferramenta ou o retrabalho que deixou de sair do caixa." },
];

const formatos = [
  {
    nome: "Diagnóstico",
    prazo: "3 a 4 semanas",
    d: "Panorama e Rota: mapa de perdas, fichas de ROI e a pauta para o conselho decidir. É o primeiro passo e já entrega a lista do que vale fazer.",
  },
  {
    nome: "Ensaio",
    prazo: "30 dias por oportunidade",
    d: "Teste medido com linha de base e alvo. No fim, um veredito com número: escalar, ajustar ou encerrar.",
  },
  {
    nome: "Rotina",
    prazo: "Acompanhamento mensal",
    d: "Medição mensal das soluções em produção, revisão por amostra e alertas, com o portal do cliente mostrando a saúde de cada projeto.",
  },
];

const faq = [
  {
    q: "O que é o Método Prova de Ganho?",
    a: "É um método de gestão de projetos de IA em cinco fases (Panorama, Rota, Ensaio, Escala e Rotina), separadas por quatro portões de decisão. Cada solução de IA só passa para a fase seguinte quando prova ganho com número, e depois é medida todo mês. É conduzido pela Agência de Inteligência Vozes, com projetos liderados por Jefferson Lobo.",
  },
  {
    q: "Vocês vendem uma plataforma?",
    a: "Não. O que se contrata é o método. A Agência opera o Kerdia ROI, a plataforma onde todos os projetos são acompanhados, e o cliente tem acesso a um portal para ver a saúde de cada projeto. Kerdia vem do grego κέρδος, que quer dizer ganho.",
  },
  {
    q: "E se a IA não provar ganho?",
    a: "Então o portão diz não, e isso também é resultado. O ensaio tem valor porque evita escalar o que não paga a conta. Muitas vezes a ficha mostra que a alternativa sem IA é mais barata, e o conselho decide com isso na mesa.",
  },
  {
    q: "Qual a diferença para uma consultoria de IA comum?",
    a: "A maioria das consultorias entrega roadmap e recomendações. Aqui, cada recomendação tem ficha de ROI, cada teste tem linha de base e alvo, e cada solução em produção tem metas medidas todo mês, com acerto conferido por amostra revisada e margem de erro.",
  },
  {
    q: "Preciso ter dados organizados para começar?",
    a: "Não. O Panorama parte do que a empresa já sabe e marca o que precisa ser medido. Número sem fonte fica pendente, e a medição entra como parte do ensaio.",
  },
  {
    q: "Quanto tempo leva para ver o primeiro número?",
    a: "O diagnóstico entrega o mapa de perdas e as fichas de ROI em 3 a 4 semanas. O primeiro ganho medido sai ao fim do primeiro ensaio, cerca de 30 dias depois.",
  },
];

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full border border-primary/30 bg-primary/10 text-primary font-semibold uppercase text-xs tracking-widest px-3 py-1.5"
      style={mono}
    >
      {children}
    </span>
  );
}

function Cabeca({ kicker, titulo, texto }: { kicker: string; titulo: React.ReactNode; texto?: string }) {
  return (
    <div className="text-center mb-14 flex flex-col items-center gap-4 max-w-3xl mx-auto">
      <Kicker>{kicker}</Kicker>
      <h2 className="display-title text-3xl md:text-5xl tracking-tight text-foreground">{titulo}</h2>
      {texto && <p className="text-lg text-muted-foreground">{texto}</p>}
      <div className="h-px w-20 bg-primary/40" />
    </div>
  );
}

export default function ProvaDeGanho() {
  const { trackCTA } = useTrackCTA();

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${URL}#service`,
        name: "Método Prova de Ganho",
        serviceType: "Gestão de projetos de Inteligência Artificial com ROI medido",
        provider: { "@type": "Organization", name: "Agência de Inteligência Vozes", founder: PERSON_LD },
        areaServed: { "@type": "Country", name: "Brasil" },
        url: URL,
        description:
          "Método de gestão de projetos de IA em cinco fases e quatro portões: só escala o que provou ganho, e o que está em produção é medido todo mês.",
        offers: formatos.map((f) => ({
          "@type": "Offer",
          name: f.nome,
          description: `${f.d} Prazo: ${f.prazo}.`,
          availability: "https://schema.org/InStock",
          priceCurrency: "BRL",
          url: `${URL}#diagnostico`,
        })),
      },
      {
        "@type": "HowTo",
        "@id": `${URL}#fases`,
        name: "As cinco fases do Método Prova de Ganho",
        step: fases.map((f, i) => ({ "@type": "HowToStep", position: i + 1, name: f.nome, text: f.faz })),
      },
      {
        "@type": "FAQPage",
        "@id": `${URL}#faq`,
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      },
      {
        "@type": "VideoObject",
        "@id": `${URL}#video`,
        name: "Método Prova de Ganho: o método por dentro, num caso real",
        description:
          "Como a Agência de Inteligência Vozes mede o ganho de projetos de IA: as cinco fases, os quatro portões, o Kerdia ROI e o caso real do portal Vozes Paranaenses.",
        thumbnailUrl: `${SITE_URL}${VIDEO.capa}`,
        contentUrl: `${SITE_URL}${VIDEO.hd}`,
        uploadDate: VIDEO.publicado,
        duration: VIDEO.duracao,
        inLanguage: "pt-BR",
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: "Método Prova de Ganho", item: URL },
        ],
      },
    ],
  };

  const agendar = (origem: string) => trackCTA(`provadeganho_${origem}`, "provadeganho");

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SEO
        title="Método Prova de Ganho · ROI medido em projetos de IA | Jefferson Lobo"
        description="Método de gestão de projetos de IA em 5 fases e 4 portões: só escala o que provou ganho. Previsto, realizado, capacidade liberada e custo evitado, medidos todo mês."
        path="/provadeganho"
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28 border-b border-border">
          <div className="pointer-events-none absolute inset-0" aria-hidden="true">
            <div className="hero-orb hero-orb--a" />
          </div>
          <div className="container mx-auto px-4 relative z-10 max-w-5xl space-y-8">
            <Kicker>Método Prova de Ganho</Kicker>
            <h1 className="display-title text-4xl sm:text-5xl md:text-7xl tracking-tight text-foreground max-w-[18ch]">
              Ensaio tem valor. Mas só escala o que <span className="highlight-yellow"><i>provou ganho</i></span>.
            </h1>
            <p className="max-w-2xl text-lg md:text-xl text-foreground/85 leading-relaxed">
              Um método de gestão de projetos de IA para empresas que já pagam por inteligência artificial e precisam
              responder a pergunta do conselho: quanto isso devolveu?
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base px-8 py-6">
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={() => agendar("hero")}>
                  Agendar o diagnóstico <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-6">
                <a href="#fases">Ver as cinco fases</a>
              </Button>
            </div>
            <div className="pt-6">
              <VideoMetodo onPlay={() => trackCTA("provadeganho_video_play", "provadeganho")} />
            </div>
          </div>
        </section>

        {/* Resposta direta (GEO) */}
        <section className="bg-muted/30 py-16 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <h2 className="text-2xl md:text-3xl text-foreground mb-4 tracking-tight">O que é o Método Prova de Ganho?</h2>
            <p className="text-base md:text-lg text-foreground/85 leading-relaxed">{faq[0].a}</p>
          </div>
        </section>

        {/* A tese */}
        <section className="py-20 md:py-24 border-b border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <Cabeca
              kicker="A tese"
              titulo={<>IA sem prova de ganho é <span className="highlight-yellow">hora paga sem retorno</span> e aumento de custo.</>}
              texto="Sua empresa já paga por IA. A maioria não sabe quanto isso devolve."
            />
            <div className="grid md:grid-cols-3 gap-6">
              {custos.map((c) => (
                <div key={c.n} className="rounded-2xl border border-border bg-card p-7">
                  <div className="text-primary text-sm uppercase tracking-widest mb-3" style={mono}>{c.n}</div>
                  <p className="text-foreground/85 leading-relaxed">{c.d}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Fases e portões */}
        <section id="fases" className="py-20 md:py-24 border-b border-border scroll-mt-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <Cabeca
              kicker="Cinco fases · Quatro portões"
              titulo="Cada fase só termina com uma decisão"
              texto="Entre uma fase e outra há um portão. Quem decide é o conselho da empresa, com número na mesa."
            />
            <ol className="relative space-y-5 before:absolute before:left-[27px] before:top-4 before:bottom-4 before:w-px before:bg-primary/30">
              {fases.map((f) => (
                <li key={f.n} className="relative grid grid-cols-[56px_1fr] gap-5">
                  <span
                    className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-primary/60 bg-background text-primary font-semibold shadow-[0_0_24px_-6px_hsl(var(--primary))]"
                    style={mono}
                  >
                    {f.n}
                  </span>
                  <div className="rounded-2xl border border-border bg-card p-6 md:p-7">
                    <h3 className="text-2xl text-foreground tracking-tight mb-2">{f.nome}</h3>
                    <p className="text-foreground/80 leading-relaxed">{f.faz}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
                      {f.portao ? (
                        <span className="rounded-full border border-primary/40 bg-primary/10 px-3 py-1 text-primary" style={mono}>
                          Portão {f.portao}
                        </span>
                      ) : (
                        <span className="rounded-full border border-border px-3 py-1 text-muted-foreground" style={mono}>
                          Todo mês
                        </span>
                      )}
                      <span className="text-muted-foreground">{f.decide}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Os quatro ganhos */}
        <section className="py-20 md:py-24 border-b border-border bg-muted/20">
          <div className="container mx-auto px-4 max-w-5xl">
            <Cabeca
              kicker="O que o conselho lê"
              titulo="Quatro ganhos, em todo projeto"
              texto="Os mesmos quatro números em cada oportunidade, em cada projeto e no total do cliente."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {ganhos.map((g) => (
                <div key={g.n} className="rounded-2xl border border-primary/25 bg-card p-6 shadow-[0_0_40px_-20px_hsl(var(--primary))]">
                  <h3 className="text-lg text-foreground tracking-tight mb-2">{g.n}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{g.d}</p>
                </div>
              ))}
            </div>
            <p className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
              Regra do método: hora liberada só vira dinheiro quando o destino dessa hora é comprovado.
            </p>
          </div>
        </section>

        {/* Caso real */}
        <section className="py-20 md:py-24 border-b border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <Cabeca
              kicker="Caso real"
              titulo={<>Aplicado primeiro no próprio negócio</>}
              texto="Antes de vender o método, a Agência de Inteligência Vozes aplicou no Vozes Paranaenses: um portal regional de notícias operado por IA, com uma pessoa validando."
            />
            <div className="grid sm:grid-cols-3 gap-5">
              {[
                ["1.862", "matérias publicadas em 30 dias"],
                ["R$ 234 mil", "por mês custaria uma redação tradicional para esse volume"],
                ["< R$ 1 mil", "por mês é o custo do portal em ferramentas e IA"],
              ].map(([n, l]) => (
                <div key={n} className="rounded-2xl border border-border bg-card p-6">
                  <div className="display-title text-4xl text-primary">{n}</div>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{l}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-2xl border border-amber-400/30 bg-amber-400/5 p-6 md:p-7">
              <div className="text-amber-300 text-sm uppercase tracking-widest mb-2" style={mono}>O que a medição mostrou</div>
              <p className="text-foreground/85 leading-relaxed">
                A plataforma não deixou comemorar. Em outubro, o portal entregou 57% do ganho previsto. A revisão por
                amostra mostrou textos 100% corretos, mas só 55% das fotos escolhidas pela IA eram coerentes com a
                matéria, e o custo de IA subindo sem aumento de publicação. Achamos, medimos e estamos corrigindo. É
                isso que o método faz.
              </p>
            </div>
            <a
              href="https://vozesparanaenses.com.br"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80"
            >
              Ver o portal no ar <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </section>

        {/* Formatos */}
        <section id="diagnostico" className="py-20 md:py-24 border-b border-border scroll-mt-24">
          <div className="container mx-auto px-4 max-w-5xl">
            <Cabeca
              kicker="Como contratar"
              titulo="Comece pelo diagnóstico"
              texto="Em poucas semanas você sabe onde a sua empresa perde e onde a IA paga a conta."
            />
            <div className="space-y-4">
              {formatos.map((f) => (
                <div key={f.nome} className="rounded-2xl border border-border bg-card p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
                  <div>
                    <h3 className="text-xl text-foreground mb-1 tracking-tight">{f.nome}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
                  </div>
                  <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-1.5 text-sm text-primary whitespace-nowrap" style={mono}>
                    {f.prazo}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kerdia ROI */}
        <section className="py-20 md:py-24 border-b border-border bg-muted/20">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-5">
            <Kicker>Kerdia ROI</Kicker>
            <h2 className="display-title text-3xl md:text-5xl tracking-tight text-foreground">
              Você acompanha tudo pelo portal. <span className="highlight-yellow">Sem relatório maquiado.</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              A Agência opera o Kerdia ROI, a plataforma onde cada projeto é medido. Kerdia vem do grego κέρδος: ganho.
              Você não compra a ferramenta; recebe acesso ao portal com a saúde de cada projeto, os quatro ganhos e os
              alertas do mês.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <Cabeca kicker="Perguntas frequentes" titulo="Antes de começar" />
            <Accordion type="single" collapsible className="space-y-3">
              {faq.map((f, i) => (
                <AccordionItem key={f.q} value={`q${i}`} className="rounded-xl border border-border bg-card px-5">
                  <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Fechamento */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-8">
            <p className="display-title text-3xl md:text-5xl tracking-tight text-foreground">
              Defendemos que, todo ensaio tem valor. <span className="highlight-yellow"><i>Mas só escala o que provou ganho.</i></span>
            </p>
            <p className="text-muted-foreground">
              Agência de Inteligência Vozes · projetos liderados por Jefferson Lobo
            </p>
            <Button size="lg" asChild className="text-base px-8 py-6">
              <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={() => agendar("final")}>
                Agendar o diagnóstico <ArrowRight className="ml-2 w-5 h-5" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
