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
  slug: string; // ex: "palestras-ia"
  kicker: string;
  h1: string;
  h1Highlight?: string;
  subtitle: string;
  seoTitle: string;
  seoDescription: string;
  serviceType: string; // schema.org Service type label
  forWho: string[];
  deliverables: { title: string; description: string }[];
  formats: { name: string; duration: string; description: string }[];
  faq: { q: string; a: string }[];
  ctaLabel?: string;
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
          <div className="absolute inset-0 z-0 bg-brand-grid opacity-35" />
          <div className="container mx-auto px-4 relative z-10 max-w-4xl text-center space-y-6">
            <div className="section-kicker">{props.kicker}</div>
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
        <section className="bg-background py-20">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <div className="section-kicker">Para quem é</div>
              <h2 className="display-title text-3xl md:text-5xl mt-3">
                Feito para lideranças que precisam de resultado real
              </h2>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {props.forWho.map((item, i) => (
                <Card
                  key={i}
                  className="border-2 border-primary/30 bg-card shadow-[4px_4px_0_hsl(var(--primary))]"
                >
                  <CardContent className="p-6 flex gap-3 items-start">
                    <Check className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-foreground font-bold uppercase text-sm leading-relaxed">
                      {item}
                    </span>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* O QUE ENTREGA */}
        <section className="bg-background py-20 border-t border-primary/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <div className="section-kicker">O que você leva</div>
              <h2 className="display-title text-3xl md:text-5xl mt-3">
                Entregas concretas, não slides genéricos
              </h2>
            </div>
            <div className="grid md:grid-cols-3 gap-6">
              {props.deliverables.map((d, i) => (
                <Card
                  key={i}
                  className="border-2 border-secondary/30 bg-card shadow-[4px_4px_0_hsl(var(--secondary))]"
                >
                  <CardContent className="p-6 space-y-3">
                    <div className="inline-flex h-10 w-10 items-center justify-center border-2 border-secondary bg-secondary/10">
                      <Sparkles className="w-5 h-5 text-secondary" />
                    </div>
                    <h3 className="text-lg font-black uppercase text-foreground">
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
        <section className="bg-background py-20 border-t border-primary/10">
          <div className="container mx-auto px-4 max-w-5xl">
            <div className="text-center mb-12">
              <div className="section-kicker">Formatos disponíveis</div>
              <h2 className="display-title text-3xl md:text-5xl mt-3">
                Adaptado ao seu contexto
              </h2>
            </div>
            <div className="space-y-4">
              {props.formats.map((f, i) => (
                <Card
                  key={i}
                  className="border-2 border-primary/30 bg-card hover:shadow-[6px_6px_0_hsl(var(--primary))] transition-shadow"
                >
                  <CardContent className="p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center">
                    <div>
                      <h3 className="text-xl font-black uppercase text-foreground mb-1">
                        {f.name}
                      </h3>
                      <p className="text-sm text-muted-foreground">{f.description}</p>
                    </div>
                    <div className="text-xs uppercase font-bold text-secondary border border-secondary/40 bg-secondary/10 px-3 py-1 w-fit">
                      {f.duration}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <TrustBarSection />
        <StagePhotosSection />

        {/* FAQ */}
        <section className="bg-background py-20 border-t border-primary/10">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="text-center mb-12">
              <div className="section-kicker">Perguntas frequentes</div>
              <h2 className="display-title text-3xl md:text-5xl mt-3">
                Dúvidas comuns
              </h2>
            </div>
            <Accordion type="single" collapsible className="w-full">
              {props.faq.map((f, i) => (
                <AccordionItem key={i} value={`item-${i}`}>
                  <AccordionTrigger className="text-left font-bold uppercase">
                    {f.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">
                    {f.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* CTA FINAL */}
        <section className="bg-background py-24 border-t border-primary/10">
          <div className="container mx-auto px-4 max-w-3xl text-center space-y-6">
            <h2 className="display-title text-3xl md:text-5xl text-foreground">
              Pronto para o próximo passo?
            </h2>
            <p className="text-lg text-muted-foreground">
              Conte o contexto da sua empresa e eu volto com formatos, datas e investimento em até 24h.
            </p>
            <Button asChild size="lg">
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
