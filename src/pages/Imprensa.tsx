import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, Phone, Linkedin, Instagram, Download, Copy } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const SITE_URL = "https://jeffersonlobo.tech";

const BIO_CURTA =
  "Jefferson Lobo é palestrante, autor e consultor em Inteligência Artificial aplicada a marketing, negócios e lideranças. Atua como Gerente Executivo de Marketing do Sistema Fiep.";

const BIO_MEDIA =
  "Jefferson Lobo é palestrante, autor e consultor brasileiro em Inteligência Artificial aplicada a marketing, negócios e lideranças. Gerente Executivo de Marketing do Sistema Fiep, é referência nacional em IA generativa para o ambiente corporativo, com foco em agentes de IA com identidade autoral (DNA de marca) e na fase de orquestração de fluxos de marketing com IA.";

const BIO_LONGA = `Jefferson Lobo é palestrante, autor e consultor em Inteligência Artificial aplicada a marketing, negócios e lideranças. Atua como Gerente Executivo de Marketing do Sistema Fiep (Federação das Indústrias do Estado do Paraná), combinando visão executiva de marketing em uma grande instituição com prática técnica em IA generativa.

É reconhecido por defender teses proprietárias no debate brasileiro de IA, como o desafio de construir agentes de IA com DNA autoral e a tese de que o marketing com IA entrou na fase da orquestração de fluxos — superando a "indústria de prompts" e ferramentas isoladas.

Ministra keynotes, workshops corporativos e consultorias estratégicas para diretores, gerentes e times de marketing em todo o Brasil, presencialmente e online. Mantém produção autoral constante em blog próprio, podcast, LinkedIn e Instagram, além de oferecer um Teste de Maturidade em IA gratuito para empresas e times.`;

const copy = (text: string, label: string) => {
  navigator.clipboard.writeText(text);
  toast({ title: `${label} copiada`, description: "Texto na sua área de transferência." });
};

export default function Imprensa() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "Imprensa — Jefferson Lobo",
    url: `${SITE_URL}/imprensa`,
    mainEntity: { "@id": `${SITE_URL}/#person` },
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Helmet>
        <title>Imprensa & Press Kit — Jefferson Lobo</title>
        <meta
          name="description"
          content="Press kit oficial de Jefferson Lobo: bio, fotos em alta, temas de especialidade e contato para jornalistas. Palestrante e consultor em Inteligência Artificial."
        />
        <link rel="canonical" href={`${SITE_URL}/imprensa`} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Imprensa & Press Kit — Jefferson Lobo" />
        <meta property="og:description" content="Bio, fotos em alta, temas e contato para imprensa." />
        <meta property="og:url" content={`${SITE_URL}/imprensa`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <main className="flex-1 pt-24 pb-16">
        <div className="container max-w-4xl mx-auto px-4">
          <header className="mb-12 text-center">
            <div className="section-kicker mb-4">Para jornalistas</div>
            <h1 className="display-title text-4xl md:text-6xl mb-4">Imprensa & Press Kit</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Bio oficial, fotos em alta, temas de especialidade e contato direto para entrevistas e citações.
            </p>
          </header>

          {/* Quem é */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl">Quem é Jefferson Lobo</h2>
            </CardHeader>
            <CardContent className="space-y-3 text-muted-foreground">
              <p><strong className="text-foreground">Nome:</strong> Jefferson Lobo</p>
              <p><strong className="text-foreground">Cargo executivo:</strong> Gerente Executivo de Marketing do Sistema Fiep (Federação das Indústrias do Estado do Paraná)</p>
              <p><strong className="text-foreground">Atuação:</strong> Palestrante, autor e consultor em Inteligência Artificial aplicada a marketing, negócios e lideranças</p>
              <p><strong className="text-foreground">Base:</strong> Curitiba/PR — atende todo o Brasil presencialmente e online</p>
            </CardContent>
          </Card>

          {/* Bios */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl">Bios oficiais</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              {[
                { label: "Bio curta (1 linha)", text: BIO_CURTA },
                { label: "Bio média (3 linhas)", text: BIO_MEDIA },
                { label: "Bio longa", text: BIO_LONGA },
              ].map((b) => (
                <div key={b.label}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-sm uppercase tracking-wider text-primary" style={{ fontFamily: "'IBM Plex Mono', monospace" }}>{b.label}</h3>
                    <Button size="sm" variant="outline" onClick={() => copy(b.text, b.label)}>
                      <Copy className="w-3 h-3 mr-1" /> Copiar
                    </Button>
                  </div>
                  <p className="text-muted-foreground whitespace-pre-line leading-relaxed">{b.text}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Temas */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl">Temas para entrevistas</h2>
            </CardHeader>
            <CardContent>
              <ul className="grid md:grid-cols-2 gap-2 text-muted-foreground list-disc list-inside">
                <li>IA generativa aplicada a marketing</li>
                <li>Agentes de IA com DNA autoral</li>
                <li>Orquestração de fluxos com IA</li>
                <li>Maturidade em IA para empresas</li>
                <li>Estratégia de IA para lideranças</li>
                <li>Cultura, ética e governança de IA</li>
                <li>O futuro do marketing com IA</li>
                <li>IA generativa no ambiente corporativo brasileiro</li>
              </ul>
            </CardContent>
          </Card>

          {/* Fotos */}
          <Card className="mb-6">
            <CardHeader>
              <h2 className="text-2xl">Fotos em alta resolução</h2>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground">
                Fotos oficiais de palco e estúdio estão disponíveis sob solicitação por e-mail. Envie a pauta e o veículo para receber o pacote completo.
              </p>
              <Button asChild>
                <a href="mailto:contato@jeffersonlobo.tech?subject=Solicita%C3%A7%C3%A3o%20de%20fotos%20em%20alta%20-%20Imprensa">
                  <Download className="w-4 h-4 mr-2" /> Solicitar pacote de fotos
                </a>
              </Button>
            </CardContent>
          </Card>

          {/* Contato */}
          <Card className="mb-6 border-primary/40">
            <CardHeader>
              <h2 className="text-2xl">Contato de imprensa</h2>
            </CardHeader>
            <CardContent className="space-y-3">
              <a href="mailto:contato@jeffersonlobo.tech" className="flex items-center gap-3 text-foreground hover:text-primary">
                <Mail className="w-5 h-5" /> contato@jeffersonlobo.tech
              </a>
              <a href="tel:+5545999864213" className="flex items-center gap-3 text-foreground hover:text-primary">
                <Phone className="w-5 h-5" /> +55 (45) 99986-4213
              </a>
              <a href="https://www.linkedin.com/in/jeffersonlobo" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground hover:text-primary">
                <Linkedin className="w-5 h-5" /> linkedin.com/in/jeffersonlobo
              </a>
              <a href="https://www.instagram.com/jeffersonlobooficial" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-foreground hover:text-primary">
                <Instagram className="w-5 h-5" /> @jeffersonlobooficial
              </a>
            </CardContent>
          </Card>

          <p className="text-sm text-muted-foreground text-center mt-8">
            Ao citar, recomendamos o link <a href={SITE_URL} className="text-primary underline">jeffersonlobo.tech</a> como referência canônica.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
