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
  /** Registro mais sóbrio para páginas voltadas a diretoria/C-level (ex.: Consultoria) —
   * mesma estrutura, sem bloco preto/CTA cheio de cor, sombras discretas. */
  sober?: boolean;
}

// Pílula de kicker editorial (mono, contorno fino)
function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full border border-primary/30 bg-primary/10 text-primary font-semibold uppercase text-xs tracking-widest px-3 py-1.5"
      style={{ fontFamily: "'IBM Plex Mono', monospace" }}
    >
      {children}
    </span>
  );
}

// Cabeçalho de seção
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
      <div className="h-px w-20 bg-primary/40" />
    </div>
  );
}

export default function CommercialLanding(props: CommercialLandingProps) {
  const url = `${SITE_URL}/${props.slug}`;
  const sober = props.sober === true;

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
        <section className="relative overflow-hidden bg-background py-20 md:py-28 border-b border-border">
          <div className="absolute inset-0 z-0 bg-brand-grid opacity-20" />
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

        {/* PARA QUEM */}
        <section className={sober ? "bg-muted/40 py-20 border-y border-border" : "bg-foreground py-20 border-y border-foreground/10"}>
          <div className="container mx-auto px-4 max-w-5xl">
            <SectionHead
              kicker="Para quem é"
              title="Feito para lideranças que precisam de resultado real"
              invert={!sober}
            />
            <div className="grid md:grid-cols-2 gap-5">
              {props.forWho.map((item, i) => (
                <Card
                  key={i}
                  className="rounded-xl border border-border bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <CardContent className="p-6 flex gap-4 items-start">
                    <div className="shrink-0 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary">
                      <Check className="w-5 h-5 text-primary-foreground" />
                    </div>
                    <span className="text-foreground text-sm leading-relaxed">
                      {item}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* O QUE ENTREGA */}
        <section className="bg-background py-24 relative overflow-hidden border-b border-border">
          <div className="absolute inset-0 bg-brand-grid opacity-15" />
          <div className="container mx-auto px-4 max-w-5xl relative z-10">
            <SectionHead
              kicker="O que você leva"
              title="Entregas concretas, não slides genéricos"
            />
            <div className="grid md:grid-cols-3 gap-6">
              {props.deliverables.map((d, i) => (
                <Card
                  key={i}
                  className="rounded-xl border border-border bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="text-lg text-foreground tracking-tight">
                      {d.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {d.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* FORMATOS */}
        <section className="bg-background py-20 border-b border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <SectionHead
              kicker="Formatos disponíveis"
              title="Adaptado ao seu contexto"
            />
            <div className="space-y-4">
              {props.formats.map((f, i) => {
                const highlight = !sober && i === 1; // um único destaque de cor por LP (desativado no registro sóbrio)
                const badge = highlight
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-foreground/70";
                return (
                  <Card
                    key={i}
                    className="rounded-xl border border-border bg-card shadow-sm hover:-translate-y-0.5 hover:shadow-md transition-all"
                  >
                    <CardContent className="p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
                      <div>
                        <h3 className="text-xl text-foreground mb-1 tracking-tight">
                          {f.name}
                        </h3>
                        <p className="text-sm text-muted-foreground">{f.description}</p>
                      </div>
                      <div className={`text-xs font-medium uppercase rounded-full ${badge} px-4 py-2 w-fit`} style={{ fontFamily: "'IBM Plex Mono', monospace" }}>
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

        {/* FAQ */}
        <section className="bg-background py-20 border-y border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <SectionHead kicker="Perguntas frequentes" title="Dúvidas comuns" />
            <Accordion type="single" collapsible className="w-full">
              {props.faq.map((f, i) => (
                <AccordionItem
                  key={i}
                  value={`item-${i}`}
                  className="border-b border-border"
                >
                  <AccordionTrigger className="text-left font-semibold text-foreground hover:no-underline">
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

        {/* CTA FINAL — cheio de cor nas páginas de palestra/workshop; painel discreto no registro sóbrio */}
        <section
          className={
            sober
              ? "bg-muted/40 py-24 border-t border-border relative overflow-hidden"
              : "bg-primary py-24 relative overflow-hidden"
          }
        >
          {!sober && <div className="absolute inset-0 bg-brand-grid opacity-15" />}
          <div className="container mx-auto px-4 max-w-3xl text-center space-y-6 relative z-10 flex flex-col items-center">
            <Kicker>Próximo passo</Kicker>
            <h2
              className={`display-title text-4xl md:text-6xl tracking-tight ${
                sober ? "text-foreground" : "text-primary-foreground"
              }`}
            >
              Pronto para começar?
            </h2>
            <p
              className={`text-lg md:text-xl max-w-xl ${
                sober ? "text-muted-foreground" : "text-primary-foreground/85"
              }`}
            >
              Conte o contexto da sua empresa e eu volto com formatos, datas e investimento em até 24h.
            </p>
            <Button
              asChild
              size="lg"
              variant={sober ? "default" : "secondary"}
              className={sober ? "" : "bg-foreground text-background hover:bg-foreground/90"}
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
