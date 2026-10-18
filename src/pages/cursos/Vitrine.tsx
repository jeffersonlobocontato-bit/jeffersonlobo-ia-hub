import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Bot,
  ChevronDown,
  Download,
  MailCheck,
  MonitorPlay,
  Plus,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { SEO, SITE_URL } from "@/components/SEO";
import { useTrackCTA } from "@/hooks/useTrackCTA";
import {
  CURSOS,
  LIVRO_DEL,
  loteAtual,
  type Curso,
} from "@/content/cursos/ilha";
import { ESCOLA } from "@/content/cursos/escola";
import { POCKETS, reais as reaisBR, type Pocket } from "@/content/cursos/pockets";
import EscolaTopo from "@/components/cursos/escola/EscolaTopo";
import EscolaRodape from "@/components/cursos/escola/EscolaRodape";
import BotaoBrilho from "@/components/cursos/escola/BotaoBrilho";
import { useEscola } from "@/components/cursos/escola/useEscola";
import PodcastTopo from "@/components/cursos/escola/PodcastTopo";
import IscaEbook from "@/components/cursos/escola/IscaEbook";
import { EVENTO_ISCA, ISCAS, type Isca } from "@/content/cursos/iscas";
import "@/styles/escola.css";

// Vitrine da escola (/cursos). É um catálogo: o topo, o "como funciona", a
// garantia e as perguntas valem para todos os cursos; cada curso entra como
// um card igual aos outros, a partir da lista CURSOS. O que é de um curso só
// (aulas, telas, comparações) fica na página de vendas daquele curso.

const reais = (n: number) => `R$ ${n}`;
const diaMes = (iso: string) =>
  new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    timeZone: "America/Sao_Paulo",
  }).format(new Date(iso));
const atraso = (i: number, passo = 0.08) =>
  ({ ["--d" as string]: `${(i * passo).toFixed(2)}s` }) as React.CSSProperties;
const comAtraso = (d: string) =>
  ({ ["--d" as string]: d }) as React.CSSProperties;

// Cena de bastidores no card "Novos cursos a caminho": vídeo mudo em loop que
// só toca enquanto o card está na tela (e não toca para quem pediu menos
// movimento; aí fica a imagem parada).
const CenaBastidores = ({ src, poster }: { src: string; poster: string }) => {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (!("IntersectionObserver" in window)) {
      v.play().catch(() => undefined);
      return;
    }
    const obs = new IntersectionObserver(
      ([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()),
      { threshold: 0.25 },
    );
    obs.observe(v);
    return () => obs.disconnect();
  }, []);
  return (
    <div className="e-card__thumb e-card__thumb--larga e-embreve__cena" aria-hidden>
      <video ref={video} src={src} poster={poster} muted loop playsInline preload="metadata" />
      <span className="e-embreve__gravando">
        <i /> gravando
      </span>
    </div>
  );
};

const ACENTOS: Record<string, string> = {
  turquesa: "",
  laranja: "e-card--laranja",
  azul: "e-card--azul",
  verde: "e-card--verde",
};

const PULSOS = [
  { left: "8.333%", dur: "3s", delay: "0s" },
  { left: "41.666%", dur: "5s", delay: "1.5s" },
  { left: "75%", dur: "4s", delay: "0.5s" },
  { left: "91.666%", dur: "6s", delay: "2.6s" },
];

const RECURSOS = [
  {
    icone: MonitorPlay,
    titulo: "Aulas curtas, na tela de verdade",
    texto:
      "Cada aula mostra o passo a passo na ferramenta real, sem enrolação. Pause e faça junto.",
  },
  {
    icone: Bot,
    titulo: "Tutor IA em cada aula",
    texto:
      "Travou? Pergunte ao Tutor, que responde com base no conteúdo do curso, a qualquer hora.",
  },
  {
    icone: Download,
    titulo: "Materiais para baixar",
    texto:
      "Manuais em PDF, instaladores e modelos ficam junto da aula em que você usa.",
  },
  {
    icone: TrendingUp,
    titulo: "Seu progresso salvo",
    texto:
      "A área do aluno marca as aulas concluídas e te leva direto de onde você parou.",
  },
  {
    icone: MailCheck,
    titulo: "Entrada só com o e-mail",
    texto:
      "Sem senha para decorar: você recebe um link de acesso no e-mail da compra.",
  },
  {
    icone: ShieldCheck,
    titulo: `${ESCOLA.garantiaDias} dias de garantia`,
    texto:
      "Assistiu, testou e não era para você? Peça o reembolso dentro do prazo.",
  },
];

function CardCurso({
  curso,
  i,
  onClick,
}: {
  curso: Curso;
  i: number;
  onClick: () => void;
}) {
  const lote = loteAtual(curso);
  const v = curso.vitrine;
  const etiqueta =
    lote.lote === 1
      ? `Lote 1 até ${diaMes(curso.precos.fimLote1)}`
      : "Inscrições abertas";
  return (
    <article
      className={`e-card ${ACENTOS[v.acento] ?? ""} e-revela`}
      style={atraso(i + 1)}
    >
      <span className="e-card__feixe" aria-hidden />
      <span className="e-card__brilho" aria-hidden />
      <span className="e-card__pontos" aria-hidden />
      <Link
        to={v.pagina}
        className="e-card__thumb e-card__thumb--larga"
        tabIndex={-1}
        aria-hidden
        onClick={onClick}
      >
        <img src={v.capa} alt="" width={1600} height={1000} loading="lazy" />
      </Link>
      <span className="e-olho">
        {v.categoria} · {etiqueta}
      </span>
      <h3 className="e-card__titulo">
        <Link to={v.pagina} onClick={onClick}>
          {curso.nome}
        </Link>
      </h3>
      <p className="e-card__texto">{curso.chamada}.</p>
      <ul className="e-lista e-lista--pontos">
        {v.destaques.map((t) => (
          <li key={t}>
            <span className="e-ponto" aria-hidden />
            <span>{t}</span>
          </li>
        ))}
      </ul>
      <div className="e-card__rodape">
        <div className="e-preco">
          <b>{reais(lote.preco)}</b>
          <span>pagamento único · até 12x</span>
        </div>
        <Link to={v.pagina} className="e-btn e-btn--cheio" onClick={onClick}>
          Ver o curso <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </article>
  );
}

function CardIsca({ isca, i, onClick }: { isca: Isca; i: number; onClick: () => void }) {
  // não navega: seleciona o material no formulário da seção #ebook-gratis
  const abrir = (ev: React.MouseEvent) => {
    ev.preventDefault();
    onClick();
    window.dispatchEvent(new CustomEvent(EVENTO_ISCA, { detail: isca.material }));
  };
  return (
    <article className="e-card e-card--pocket e-card--isca e-revela" style={atraso(i + 1)}>
      <span className="e-card__feixe" aria-hidden />
      <span className="e-card__brilho" aria-hidden />
      <a href="#ebook-gratis" className="e-card__thumb e-card__thumb--pocket" tabIndex={-1} aria-hidden onClick={abrir}>
        <img src={isca.capa} alt="" width={640} height={906} loading="lazy" />
      </a>
      <span className="e-olho">Grátis · {isca.tema}</span>
      <h3 className="e-card__titulo">
        <a href="#ebook-gratis" onClick={abrir}>
          {isca.titulo}
        </a>
      </h3>
      <p className="e-card__texto">{isca.resumo}</p>
      <div className="e-card__rodape">
        <div className="e-preco">
          <b>Grátis</b>
          <span>cadastro rápido · acesso na hora</span>
        </div>
        <a href="#ebook-gratis" className="e-btn e-btn--fantasma" onClick={abrir}>
          Quero grátis <ArrowRight size={16} aria-hidden />
        </a>
      </div>
    </article>
  );
}

function CardPocket({ p, i, onClick }: { p: Pocket; i: number; onClick: () => void }) {
  return (
    <article className="e-card e-card--pocket e-revela" style={atraso(i + 1)}>
      <span className="e-card__feixe" aria-hidden />
      <span className="e-card__brilho" aria-hidden />
      <Link to={p.pagina} className="e-card__thumb e-card__thumb--pocket" tabIndex={-1} aria-hidden onClick={onClick}>
        <img src={p.capa} alt="" width={840} height={1189} loading="lazy" />
      </Link>
      <span className="e-olho">
        Pocket {p.numero} · {p.categoria}
      </span>
      <h3 className="e-card__titulo">
        <Link to={p.pagina} onClick={onClick}>
          {p.nome}
        </Link>
      </h3>
      <p className="e-card__texto">{p.chamada}</p>
      <div className="e-card__rodape">
        <div className="e-preco">
          <b>{reaisBR(p.preco)}</b>
          <span>PDF · acesso na hora</span>
        </div>
        <Link to={p.pagina} className="e-btn e-btn--fantasma" onClick={onClick}>
          Ver o pocket <ArrowRight size={16} aria-hidden />
        </Link>
      </div>
    </article>
  );
}

const Vitrine = () => {
  const raiz = useRef<HTMLDivElement>(null);
  useEscola(raiz);
  const { trackCTA } = useTrackCTA();
  const abertos = CURSOS;
  const comLivro = abertos.filter((c) => c.vitrine.bonusLivro);

  const faq = [
    {
      p: "Como recebo o acesso a um curso?",
      r: "Assim que o pagamento é aprovado (no Pix, em segundos), você recebe um e-mail com o link da área do aluno, aqui no site. Você entra com o e-mail informado na compra, sem senha para decorar.",
    },
    {
      p: "Quais são as formas de pagamento?",
      r: "Pix, boleto ou cartão de crédito em até 12x, na página segura do Mercado Pago. Os dados do cartão não passam por este site.",
    },
    {
      p: "Preciso de conhecimento técnico?",
      r: "Cada curso diz, na página dele, o que você precisa antes de começar. Os cursos são feitos para quem quer aplicar, não para programadores.",
    },
    {
      p: "E se eu não gostar?",
      r: `Você tem ${ESCOLA.garantiaDias} dias para pedir o reembolso, com devolução integral. É só me chamar no WhatsApp.`,
    },
    {
      p: "O que são os pockets?",
      r: `Tutoriais curtos em PDF, por ${reaisBR(POCKETS[0].preco)} cada, que resolvem uma coisa só: configurar o Claude, fazer ele escrever com a sua voz e ir do roteiro à postagem. Têm as telas do Claude em português e modelos para copiar. Os três vêm de bônus no curso Ilha de Edição completa.`,
    },
    {
      p: "Posso comprar só o livro?",
      r: `Pode: o impresso sai por ${reais(LIVRO_DEL.impresso.preco)} + frete e o e-book por ${reais(LIVRO_DEL.ebook.preco)}.${comLivro.length ? ` O e-book também vem de bônus em ${comLivro.map((c) => c.nome).join(", ")}.` : ""}`,
    },
    {
      p: "Por quanto tempo tenho acesso?",
      r: `Por ${ESCOLA.prazoAcesso} a partir da compra, salvo se a página do curso disser outro prazo. Os arquivos que você baixar ficam com você, com uma marca d'água com o seu e-mail. Os detalhes estão nos termos de uso.`,
    },
    {
      p: "Tem suporte?",
      r: "Tem. O Tutor IA responde dentro de cada aula, e o suporte humano é pelo WhatsApp.",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Cursos e livro de Jefferson Lobo",
    itemListElement: [
      ...abertos.map((c, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "Course",
          name: c.nome,
          description: c.descricao,
          url: `${SITE_URL}${c.vitrine.pagina}`,
          provider: {
            "@type": "Person",
            name: "Jefferson Lobo",
            url: SITE_URL,
          },
          offers: {
            "@type": "Offer",
            price: String(loteAtual(c).preco),
            priceCurrency: "BRL",
            category: "Paid",
          },
        },
      })),
      ...POCKETS.map((p, i) => ({
        "@type": "ListItem",
        position: abertos.length + 1 + i,
        item: {
          "@type": "Product",
          name: `Pocket ${p.numero}: ${p.nome}`,
          description: p.chamada,
          url: `${SITE_URL}${p.pagina}`,
          image: `${SITE_URL}${p.quadrada}`,
          offers: { "@type": "Offer", price: p.preco.toFixed(2), priceCurrency: "BRL" },
        },
      })),
      {
        "@type": "ListItem",
        position: abertos.length + POCKETS.length + 1,
        item: {
          "@type": "Book",
          name: LIVRO_DEL.nome,
          url: `${SITE_URL}${LIVRO_DEL.pagina}`,
        },
      },
    ],
  };
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.p,
      acceptedAnswer: { "@type": "Answer", text: f.r },
    })),
  };

  // Capas do leque do topo: os cursos e o livro (até 4).
  const capas = [
    ...abertos.map((c) => ({
      src: c.vitrine.capa,
      alt: c.nome,
      tipo: "curso",
      to: c.vitrine.pagina,
    })),
    {
      src: LIVRO_DEL.capa,
      alt: LIVRO_DEL.curto,
      tipo: "livro",
      to: LIVRO_DEL.pagina,
    },
  ].slice(0, 4);

  return (
    <div className="escola" ref={raiz}>
      <SEO
        title="Academia jeffersonlobo.tech | Cursos e livro de Jefferson Lobo"
        description="Cursos práticos de IA aplicada e o livro do Método DEL, de Jefferson Lobo. Aulas curtas, Tutor IA em cada aula e acesso pelo seu e-mail."
        path="/cursos"
        ogImage={`${SITE_URL}/academia/og-cursos.jpg`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <EscolaTopo onCta={() => trackCTA("vitrine_topo", "vitrine")} />

      <main>
        {/* Hero da escola */}
        <section className="e-hero">
          <div className="e-aura" aria-hidden>
            <div className="e-aura__grade" />
            {PULSOS.map((p) => (
              <span
                key={p.left}
                className="e-pulso-v"
                style={{
                  left: p.left,
                  animationDuration: p.dur,
                  animationDelay: p.delay,
                }}
              />
            ))}
            <span className="e-pulso-h" style={{ top: "34%" }} />
            <div className="e-aura__arco" />
          </div>

          <span className="e-selo e-entra" style={atraso(0)}>
            <span className="e-selo__ponto" aria-hidden />
            Academia jeffersonlobo.tech
          </span>
          <h1 className="e-h1 e-entra" style={comAtraso("0.2s")}>
            Faça a IA trabalhar <span className="e-grad">com a sua voz.</span>
          </h1>
          <p className="e-sub e-entra" style={comAtraso("0.35s")}>
            Cursos práticos e o livro do Método DEL para quem cria conteúdo e
            quer usar a IA no dia a dia, com método e sem promessa fácil.
          </p>
          <div className="e-hero__acoes e-entra" style={comAtraso("0.5s")}>
            <BotaoBrilho
              to="#catalogo"
              onClick={() => trackCTA("vitrine_hero", "vitrine")}
            >
              Ver os cursos
            </BotaoBrilho>
            <div className="e-fichas" aria-label="Em todos os cursos">
              <span>Aulas curtas</span>
              <span>Tutor IA</span>
              <span>Garantia de {ESCOLA.garantiaDias} dias</span>
            </div>
          </div>
          <a
            href="#ebook-gratis"
            className="e-hero__isca e-entra"
            style={comAtraso("0.6s")}
            onClick={() => trackCTA("vitrine_hero_ebook", "vitrine")}
          >
            <span>Grátis</span> E-book e guias práticos de IA para quem vende sozinho
            <ArrowRight size={14} aria-hidden />
          </a>

          {/* o surgir fica no invólucro: o leque usa transform para crescer ao rolar.
              Com o podcast configurado, ele ocupa o lugar da primeira capa larga,
              atrás do livro; no play, vem para a frente. */}
          <div className="e-entra" style={comAtraso("0.65s")}>
            <div className={`e-leque e-leque--${capas.length}`}>
              {capas.map((c, i) =>
                i === 0 && c.tipo === "curso" && ESCOLA.podcast.src ? (
                  <PodcastTopo
                    key="podcast"
                    src={ESCOLA.podcast.src}
                    poster={ESCOLA.podcast.poster || c.src}
                    titulo={ESCOLA.podcast.titulo}
                    indice={i}
                  />
                ) : (
                  <Link
                    key={c.src}
                    to={c.to}
                    className={`e-leque__item e-leque__item--${c.tipo}`}
                    style={{ ["--i" as string]: i } as React.CSSProperties}
                    aria-label={c.alt}
                    onClick={() => trackCTA("vitrine_leque", "vitrine")}
                  >
                    <img src={c.src} alt={c.alt} loading={i ? "lazy" : "eager"} />
                  </Link>
                ),
              )}
            </div>
          </div>
          <div className="e-hero__base" />
        </section>

        {/* Catálogo */}
        <section className="e-secao" id="catalogo">
          <div className="e-cab e-revela">
            <span className="e-olho">Catálogo</span>
            <h2 className="e-h2">Cursos e materiais grátis</h2>
            <p>
              Escolha um curso e veja a página dele: o que você vai aprender, as
              aulas e o preço. Ou comece por um material grátis.
            </p>
          </div>
          <div className="e-catalogo">
            {abertos.map((c, i) => (
              <CardCurso
                key={c.slug}
                curso={c}
                i={i}
                onClick={() => trackCTA(`vitrine_curso_${c.slug}`, "vitrine")}
              />
            ))}
            {ISCAS.map((isca, i) => (
              <CardIsca
                key={isca.material}
                isca={isca}
                i={abertos.length + i}
                onClick={() => trackCTA(`vitrine_catalogo_${isca.material}`, "vitrine")}
              />
            ))}
            {ESCOLA.mostrarEmBreve && (
              <article
                className="e-card e-card--embreve e-revela"
                style={atraso(abertos.length + ISCAS.length + 1)}
              >
                {ESCOLA.bastidores.src ? (
                  <CenaBastidores src={ESCOLA.bastidores.src} poster={ESCOLA.bastidores.poster} />
                ) : (
                  <span className="e-embreve__icone" aria-hidden>
                    <Plus size={22} />
                  </span>
                )}
                <span className="e-olho">Em breve</span>
                <h3 className="e-card__titulo">Novos cursos a caminho</h3>
                <p className="e-card__texto">
                  Estou gravando os próximos cursos, no mesmo formato: aulas
                  curtas, Tutor IA e materiais para baixar.
                </p>
                <div className="e-card__rodape">
                  <a
                    href={ESCOLA.avisoNovos}
                    target="_blank"
                    rel="noopener"
                    className="e-btn e-btn--fantasma"
                    onClick={() => trackCTA("vitrine_avisar_novos", "vitrine")}
                  >
                    Quero ser avisado
                  </a>
                </div>
              </article>
            )}
          </div>
        </section>

        {/* Pockets */}
        <section className="e-secao" id="pockets">
          <div className="e-cab e-revela">
            <span className="e-olho">Pockets · {reaisBR(POCKETS[0].preco)} cada</span>
            <h2 className="e-h2">Tutoriais de bolso</h2>
            <p>
              Um problema, um PDF, uma tarde. Cada pocket resolve uma coisa só,
              com as telas do Claude em português e modelos para copiar.
            </p>
            <p className="e-cab__extra">
              Comprou a{" "}
              <Link to="/cursos/ilha" className="e-link">
                Ilha de Edição completa
              </Link>
              ? Os três já estão na sua área do aluno, de bônus.
            </p>
          </div>
          <div className="e-catalogo e-catalogo--pockets">
            {POCKETS.map((p, i) => (
              <CardPocket
                key={p.slug}
                p={p}
                i={i}
                onClick={() => trackCTA(`vitrine_pocket_${p.numero}`, "vitrine")}
              />
            ))}
          </div>
        </section>

        {/* Materiais grátis: e-book e guias (captura de leads) */}
        <IscaEbook />

        {/* Livro */}
        <section className="e-secao" id="livro">
          <div className="e-livro e-revela">
            <Link
              to={LIVRO_DEL.pagina}
              className="e-livro__capa"
              aria-label={`Ver o livro ${LIVRO_DEL.curto}`}
            >
              <img
                src={LIVRO_DEL.capa}
                alt={`Capa do livro ${LIVRO_DEL.curto}`}
                loading="lazy"
              />
            </Link>
            <div className="e-livro__texto">
              <span className="e-olho e-olho--laranja">Livro</span>
              <h2 className="e-h2">{LIVRO_DEL.nome}</h2>
              <p>
                O Método DEL inteiro: como fazer agentes de IA escreverem com a
                identidade de uma marca ou de um autor. É o método por trás dos
                cursos.
              </p>
              <div className="e-livro__precos">
                <div>
                  <small>Impresso</small>
                  <b>
                    {reais(LIVRO_DEL.impresso.preco)} <span>+ frete</span>
                  </b>
                </div>
                <div>
                  <small>E-book</small>
                  <b>{reais(LIVRO_DEL.ebook.preco)}</b>
                </div>
              </div>
              <div className="e-botoes">
                <a
                  href={LIVRO_DEL.impresso.url}
                  className="e-btn e-btn--laranja"
                  onClick={() => trackCTA("vitrine_livro_impresso", "vitrine")}
                >
                  Comprar o impresso
                </a>
                <a
                  href={LIVRO_DEL.ebook.url}
                  className="e-btn e-btn--fantasma e-btn--fantasma-laranja"
                  onClick={() => trackCTA("vitrine_livro_ebook", "vitrine")}
                >
                  Comprar o e-book
                </a>
                <Link
                  to={LIVRO_DEL.pagina}
                  className="e-btn e-btn--link"
                  onClick={() => trackCTA("vitrine_livro_pagina", "vitrine")}
                >
                  Ver o livro <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
              {comLivro.length > 0 && (
                <p className="e-livro__bonus">
                  O e-book também vem <b>de bônus</b> em:{" "}
                  {comLivro.map((c, i) => (
                    <span key={c.slug}>
                      {i > 0 && ", "}
                      <Link to={c.vitrine.pagina}>{c.nome}</Link>
                    </span>
                  ))}
                  .
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Como funcionam os cursos */}
        <section className="e-secao" id="como-funciona">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Em todos os cursos</span>
            <h2 className="e-h2">Como funcionam os cursos</h2>
            <p>
              O mesmo formato em todos: você aprende fazendo, com ajuda quando
              travar.
            </p>
          </div>
          <ul className="e-recursos">
            {RECURSOS.map((r, i) => (
              <li
                key={r.titulo}
                className="e-recurso e-revela"
                style={atraso(i % 3)}
              >
                <span className="e-recurso__icone" aria-hidden>
                  <r.icone size={22} />
                </span>
                <h3>{r.titulo}</h3>
                <p>{r.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* Garantia */}
        <section className="e-secao">
          <div className="e-garantia e-revela">
            <div className="e-selo-giro" aria-hidden>
              <div className="e-selo-giro__anel" />
              <div className="e-selo-giro__texto">
                <svg viewBox="0 0 200 200">
                  <defs>
                    <path
                      id="e-arco-garantia"
                      d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0"
                    />
                  </defs>
                  <text>
                    <textPath href="#e-arco-garantia">
                      Garantia em todos os cursos · Garantia em todos os cursos
                      ·
                    </textPath>
                  </text>
                </svg>
              </div>
              <div className="e-selo-giro__miolo">
                <ShieldCheck size={34} />
                <b>{ESCOLA.garantiaDias} dias</b>
              </div>
            </div>
            <div>
              <span className="e-olho">Risco zero</span>
              <h2>{ESCOLA.garantiaDias} dias de garantia em todos os cursos</h2>
              <p>
                Você tem <b>{ESCOLA.garantiaDias} dias depois da compra</b> para
                assistir, testar e decidir. Se não for para você, é só pedir o
                reembolso. Sem burocracia.
              </p>
              <div className="e-passos">
                <div>
                  <small>01</small>
                  <span>
                    Compre e receba o acesso por e-mail assim que o pagamento
                    for aprovado
                  </span>
                </div>
                <div>
                  <small>02</small>
                  <span>Assista e aplique por {ESCOLA.garantiaDias} dias</span>
                </div>
                <div>
                  <small>03</small>
                  <span>
                    Não gostou? Peça o reembolso e receba 100% de volta
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Perguntas */}
        <section className="e-secao">
          <div className="e-faq">
            <div className="e-cab e-revela">
              <span className="e-olho">Dúvidas</span>
              <h2 className="e-h2">Perguntas frequentes. Respostas diretas.</h2>
              <p>
                Ainda ficou alguma dúvida?{" "}
                <a
                  href={ESCOLA.whatsapp}
                  target="_blank"
                  rel="noopener"
                  className="e-link"
                >
                  Fale comigo no WhatsApp
                </a>
                .
              </p>
              <p className="e-cab__extra">
                Já é aluno?{" "}
                <Link to="/cursos/entrar" className="e-link">
                  Entrar na área do aluno
                </Link>
              </p>
            </div>
            <div className="e-faq__lista">
              {faq.map((f, i) => (
                <details key={f.p} className="e-revela" style={atraso(i, 0.05)}>
                  <summary>
                    {f.p}
                    <ChevronDown size={18} aria-hidden />
                  </summary>
                  <p>{f.r}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>

      <EscolaRodape />
    </div>
  );
};

export default Vitrine;
