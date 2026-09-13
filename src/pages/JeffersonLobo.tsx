import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Linkedin, Instagram, Mail, ArrowRight } from "lucide-react";
import profileImg from "@/assets/profile.jpg";

const SITE_URL = "https://jeffersonlobo.tech";
const PAGE_URL = `${SITE_URL}/jefferson-lobo`;

const CREDENCIAIS = [
  {
    title: "Head Executivo de Marketing",
    org: "Sistema Fiep",
    description:
      "Combina visão executiva de marketing em uma grande instituição com prática técnica em IA generativa, aplicada à comunicação de toda a federação.",
  },
  {
    title: "Criador do Método DEL",
    org: "Decomposição de Estrutura de Linguagem",
    description:
      "Metodologia proprietária para treinar agentes de IA com fidelidade autoral — sintática, semântica e lexical — em vez de prompts genéricos.",
  },
  {
    title: "Autor",
    org: '"O código invisível dos superagentes de inteligência artificial"',
    description:
      "Livro que detalha o Método DEL e como treinar agentes de IA com identidade de marca, sem exigir conhecimento de programação.",
  },
  {
    title: "Palestrante de Inteligência Artificial",
    org: "Atuação em todo o Brasil",
    description:
      "Keynotes, imersões e consultoria em IA generativa aplicada a negócios, liderança, produtividade e governança para empresas e eventos.",
  },
];

export default function JeffersonLobo() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: "Jefferson Lobo",
    url: PAGE_URL,
    mainEntity: { "@id": `${SITE_URL}/#person` },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Jefferson Lobo — Palestrante de Inteligência Artificial</title>
        <meta
          name="description"
          content="Quem é Jefferson Lobo: palestrante de Inteligência Artificial no Brasil, Head Executivo de Marketing do Sistema Fiep e criador do Método DEL. Biografia, credenciais e tese."
        />
        <link rel="canonical" href={PAGE_URL} />
        <meta property="og:type" content="profile" />
        <meta property="og:title" content="Jefferson Lobo — Palestrante de Inteligência Artificial" />
        <meta property="og:description" content="Palestrante de IA no Brasil, Head Executivo de Marketing do Sistema Fiep e criador do Método DEL." />
        <meta property="og:url" content={PAGE_URL} />
        <meta property="og:image" content={`${SITE_URL}/og-default.png`} />
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>

      <Header />

      <main className="pt-24 pb-20">
        {/* HERO */}
        <section className="container mx-auto px-4">
          <div className="mx-auto max-w-4xl grid sm:grid-cols-[200px_1fr] gap-8 sm:gap-12 items-center">
            <div className="mx-auto sm:mx-0 w-40 h-40 sm:w-full sm:h-auto sm:aspect-square rounded-2xl overflow-hidden border border-border shadow-sm">
              <img src={profileImg} alt="Jefferson Lobo" className="w-full h-full object-cover" />
            </div>
            <div>
              <div className="section-kicker mb-3">Quem é</div>
              <h1 className="display-title text-4xl sm:text-5xl md:text-6xl mb-4">
                Jefferson <span className="highlight-yellow">Lobo</span>
              </h1>
              <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
                Palestrante de Inteligência Artificial no Brasil, Head Executivo de Marketing do
                Sistema Fiep e criador do Método DEL — a metodologia para treinar agentes de IA
                com identidade autoral, em vez de prompts genéricos.
              </p>
              <div className="flex flex-wrap gap-3 mt-6">
                <a
                  href="https://www.linkedin.com/in/jeffersonlobo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  <Linkedin className="w-4 h-4" /> LinkedIn
                </a>
                <a
                  href="https://www.instagram.com/jeffersonlobooficial"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  <Instagram className="w-4 h-4" /> Instagram
                </a>
                <a
                  href="mailto:lobo@aivozes.com.br"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:border-primary hover:text-primary transition-colors"
                >
                  <Mail className="w-4 h-4" /> lobo@aivozes.com.br
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* BIOGRAFIA */}
        <section className="container mx-auto px-4 mt-16 sm:mt-24">
          <div className="mx-auto max-w-3xl space-y-5 text-lg text-foreground/90 leading-relaxed">
            <div className="section-kicker mb-2">Biografia</div>
            <p>
              Jefferson Lobo iniciou sua trajetória profissional em 1992, na imprensa escrita, e ao
              longo de mais de três décadas consolidou uma carreira que integra jornalismo,
              publicidade, marketing estratégico e inteligência aplicada à linguagem.
            </p>
            <p>
              Atualmente é Head Executivo de Marketing do Sistema Fiep, onde combina visão
              executiva de marketing em uma grande instituição com prática técnica em IA
              generativa. É reconhecido por defender teses proprietárias no debate brasileiro de
              IA — como o desafio de construir agentes de IA com DNA autoral e a tese de que o
              marketing com IA entrou na fase da orquestração de fluxos, superando a "indústria de
              prompts" e ferramentas isoladas.
            </p>
            <p>
              Criou o Método DEL (Decomposição de Estrutura de Linguagem), metodologia
              proprietária para treinar agentes de IA com fidelidade autoral — sintática,
              semântica e lexical — detalhada no livro{" "}
              <Link to="/livro-del" className="text-primary underline underline-offset-4 hover:text-primary/80">
                "O código invisível dos superagentes de inteligência artificial"
              </Link>
              .
            </p>
            <p>
              Ministra keynotes, workshops corporativos e consultorias estratégicas para
              diretores, gerentes e times de marketing em todo o Brasil, presencialmente e online.
              Mantém produção autoral constante em blog próprio, LinkedIn e Instagram.
            </p>
          </div>
        </section>

        {/* CREDENCIAIS */}
        <section className="container mx-auto px-4 mt-16 sm:mt-24">
          <div className="mx-auto max-w-3xl">
            <div className="section-kicker mb-6">Credenciais</div>
            <div className="space-y-0">
              {CREDENCIAIS.map((c, i) => (
                <div key={i} className="py-6 border-t border-border first:border-t-0">
                  <h3 className="text-xl text-foreground mb-1">{c.title}</h3>
                  <div
                    className="text-xs uppercase tracking-wider text-primary mb-2"
                    style={{ fontFamily: "'IBM Plex Mono', monospace" }}
                  >
                    {c.org}
                  </div>
                  <p className="text-muted-foreground leading-relaxed">{c.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ONDE ENCONTRAR MAIS */}
        <section className="container mx-auto px-4 mt-16 sm:mt-24">
          <div className="mx-auto max-w-3xl">
            <div className="section-kicker mb-6">Saiba mais</div>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: "Palestras de Inteligência Artificial", to: "/palestrante-inteligencia-artificial" },
                { label: "O Método DEL (livro)", to: "/livro-del" },
                { label: "Artigos no blog", to: "/blog" },
                { label: "Imprensa & press kit", to: "/imprensa" },
              ].map((l) => (
                <Link
                  key={l.to}
                  to={l.to}
                  className="flex items-center justify-between rounded-xl border border-border p-4 hover:border-primary hover:bg-primary/5 transition-colors group"
                >
                  <span className="font-medium text-foreground">{l.label}</span>
                  <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                </Link>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
