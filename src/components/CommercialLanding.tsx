import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import LogosBarSection from "@/components/LogosBarSection";
import TrustBarSection from "@/components/TrustBarSection";
import StagePhotosSection from "@/components/StagePhotosSection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { ArrowRight, Check, Sparkles } from "lucide-react";

const SITE_URL = "https://jeffersonlobo.tech";

export interface CommercialLandingProps {
  slug: string;
  kicker: string;
  h1: string;
  h1Highlight?: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  serviceType: string;
  forWho: string[];
  deliverables: { title: string; description: string }[];
  formats: { name: string; duration: string; description: string }[];
  faq: { q: string; a: string }[];
  ctaLabel?: string;
}

// Pílula de kicker brutalista (amarelo sólido + borda preta)
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-block bg-primary text-primary-foreground font-black uppercase text-xs tracking-widest px-3 py-1.5 border-2 border-foreground shadow-[3px_3px_0_hsl(var(--foreground))]">
      {children}
    </span>
  );
}

// Cabeçalho de seção com linha amarela
function SectionHead({
  kicker,
  title,
  invert = false,
}: {
  kicker: string;
  title: string;
  invert?: boolean;
}) {
  return (
    <div className="text-center mb-14 flex flex-col items-center gap-4">
      <Kicker>{kicker}</Kicker>
      <h2
        className={`display-title text-3xl md:text-5xl tracking-tight ${
          invert ? "text-background" : "text-foreground"
        }`}
      >
        {title}
      </h2>
      <div className="h-1.5 w-20 bg-primary" />
    </div>
  );
}

export default function CommercialLanding(props: CommercialLandingProps) {
  const url = `${SITE_URL}/${props.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        name: props.serviceType,
        serviceType: props.serviceType,
        provider: { "@id": `${SITE_URL}/#person` },
        areaServed: { "@type": "Country", name: "Brasil" },
        url,
        description: props.seoDescription,
        offers: props.formats.map((f) => ({
          "@type": "Offer",
          name: f.name,
          description: `${f.description} Duração: ${f.duration}.`,
          availability: "https://schema.org/InStock",
          priceCurrency: "BRL",
          url: `${url}#briefing`,
        })),
      },
      {
        "@type": "FAQPage",
        "@id": `${url}#faq`,
        mainEntity: props.faq.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
          { "@type": "ListItem", position: 2, name: props.serviceType, item: url },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>{props.seoTitle}</title>
        <meta name="description" content={props.seoDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content={props.seoTitle} />
        <meta property="og:description" content={props.seoDescription} />
        <meta property="og:url" content={url} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <main className="flex-1 pt-24">
        {/* HERO */}
        <section className="relative overflow-hidden bg-background py-20 md:py-28">
          <div className="absolute inset-0 z-0 bg-brand-grid opacity-60" />
          <div className="absolute inset-x-0 bottom-0 h-2 bg-foreground z-10" />
          <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center space-y-6 flex flex-col items-center">
            <Kicker>{props.kicker}</Kicker>
            <h1 className="display-title text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground">
              {props.h1}{" "}
              {props.h1Highlight && (
                <span className="highlight-yellow">{props.h1Highlight}</span>
              )}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              {props.subtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button asChild size="lg">
                <a href="/#briefing">
                  {props.ctaLabel || "Solicitar proposta"}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </a>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/teste-ia">Fazer Teste de Maturidade em IA</Link>
              </Button>
            </div>
          </div>
        </section>

        <LogosBarSection />

        {/* PARA QUEM — fundo SKY azul claro */}
        <section className="bg-surface-sky py-20 border-y-2 border-foreground">
          <div className="container mx-auto px-4 max-w-5xl">
            <SectionHead
              kicker="Para quem é"
              title="Feito para lideranças que precisam de resultado real"
            />
            <div className="grid md:grid-cols-2 gap-5">
              {props.forWho.map((item, i) => {
                const palette = [
                  { icon: "bg-primary", card: "bg-card" },
                  { icon: "bg-secondary", card: "bg-surface-cream" },
                  { icon: "bg-surface-mint", card: "bg-card" },
                  { icon: "bg-surface-coral", card: "bg-card" },
                ];
                const p = palette[i % palette.length];
                return (
                  <Card
                    key={i}
                    className={`border-2 border-foreground ${p.card} rounded-none shadow-[5px_5px_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_hsl(var(--foreground))] transition-all`}
                  >
                    <CardContent className="p-6 flex gap-4 items-start">
                      <div
                        className={`shrink-0 inline-flex h-9 w-9 items-center justify-center border-2 border-foreground ${p.icon}`}
                      >
                        <Check className="w-5 h-5 text-foreground" />
                      </div>
                      <span className="text-foreground font-bold uppercase text-sm leading-relaxed">
                        {item}
                      </span>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* O QUE ENTREGA — bloco PRETO de impacto */}
        <section className="bg-foreground py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-grid opacity-10" />
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <SectionHead
              kicker="O que você leva"
              title="Entregas concretas, não slides genéricos"
              invert
            />
            <div className="grid md:grid-cols-3 gap-6">
              {props.deliverables.map((d, i) => {
                const accent = i === 1;
                return (
                  <Card
                    key={i}
                    className={`rounded-none border-2 ${
                      accent ? "border-secondary" : "border-primary"
                    } bg-background/5 backdrop-blur shadow-[6px_6px_0_hsl(var(--primary))] ${
                      accent ? "shadow-[6px_6px_0_hsl(var(--secondary))]" : ""
                    } hover:translate-x-[-2px] hover:translate-y-[-2px] transition-all`}
                  >
                    <CardContent className="p-6 space-y-4">
                      <div
                        className={`inline-flex h-12 w-12 items-center justify-center border-2 ${
                          accent
                            ? "border-secondary bg-secondary"
                            : "border-primary bg-primary"
                        }`}
                      >
                        <Sparkles className="w-6 h-6 text-foreground" />
                      </div>
                      <h3 className="text-lg font-black uppercase text-background tracking-tight">
                        {d.title}
                      </h3>
                      <p className="text-sm text-background/75 leading-relaxed">
                        {d.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* FORMATOS — fundo CREME */}
        <section className="bg-surface-cream py-20 border-y-2 border-foreground">
          <div className="container mx-auto px-4 max-w-5xl">
            <SectionHead
              kicker="Formatos disponíveis"
              title="Adaptado ao seu contexto"
            />
            <div className="space-y-4">
              {props.formats.map((f, i) => {
                const badges = ["bg-primary", "bg-secondary", "bg-surface-mint", "bg-surface-sky"];
                const badge = badges[i % badges.length];
                return (
                  <Card
                    key={i}
                    className="rounded-none border-2 border-foreground bg-card shadow-[5px_5px_0_hsl(var(--foreground))] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0_hsl(var(--foreground))] transition-all"
                  >
                    <CardContent className="p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
                      <div>
                        <h3 className="text-xl font-black uppercase text-foreground mb-1 tracking-tight">
                          {f.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{f.description}</p>
                      </div>
                      <div className={`text-xs uppercase font-black text-foreground border-2 border-foreground ${badge} px-4 py-2 w-fit shadow-[3px_3px_0_hsl(var(--foreground))]`}>
                        {f.duration}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <TrustBarSection />
        <StagePhotosSection />

        {/* FAQ — fundo PÊSSEGO */}
        <section className="bg-surface-peach py-20 border-y-2 border-foreground">
          <div className="container mx-auto px-4 max-w-3xl">
            <SectionHead kicker="Perguntas frequentes" title="Dúvidas comuns" />
            <Accordion type="single" collapsible className="w-full">
              {props.faq.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b-2 border-foreground"
                >
                  <AccordionTrigger className="text-left font-black uppercase text-foreground hover:no-underline">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-foreground/80 leading-relaxed text-base">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL — bloco AMARELO de fechamento */}
        <section className="bg-primary py-24 border-t-2 border-foreground relative overflow-hidden">
          <div className="absolute inset-0 bg-brand-grid opacity-20" />
          <div className="container mx-auto px-4 max-w-3xl text-center space-y-6 relative z-10 flex flex-col items-center">
            <Kicker>Próximo passo</Kicker>
            <h2 className="display-title text-4xl md:text-6xl text-primary-foreground tracking-tight">
              Pronto para começar?
            </h2>
            <p className="text-lg md:text-xl text-primary-foreground/85 font-bold max-w-xl">
              Conte o contexto da sua empresa e eu volto com formatos, datas e investimento em até 24h.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-foreground text-background hover:bg-foreground/90 border-2 border-foreground shadow-[5px_5px_0_hsl(var(--background))] font-black"
            >
              <a href="/#briefing">
                {props.ctaLabel || "Solicitar proposta"}
                <ArrowRight className="ml-2 w-4 h-4" />
              </a>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
