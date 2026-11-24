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
import ScrollFX from "@/components/ScrollFX";

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
// celular recebe a versão 720p, telas maiores a 1080p. Arquivos na raiz de public/.
const VIDEO = {
  capa: "/metodo-prova-de-ganho-capa.jpg",
  hd: "/metodo-prova-de-ganho-1080.mp4",
  leve: "/metodo-prova-de-ganho-720.mp4",
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
      <div className="pg-video relative overflow-hidden rounded-[24px] border border-primary/40 bg-black aspect-video">
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


/* ------------------------------------------------------------------------------------------------
 * Efeitos da página (nov/2026): fundo vivo em camadas (partículas em rede e
 * orbes com parallax), cards flutuantes que inclinam com o mouse e ganham brilho neon, profundidade
 * entre conteúdo e fundo, e a linha das fases que acende conforme a rolagem.
 * Parallax e reveal usam o motor do site (ScrollFX: [data-speed] e [data-reveal]).
 * Tudo respeita prefers-reduced-motion e desliga a inclinação em telas de toque.
 * ---------------------------------------------------------------------------------------------- */
const FX_CSS = `
.pg-fx { position: relative; isolation: isolate; }
.pg-fx main { position: relative; z-index: 1; }
.pg-fx section { background: transparent !important; }
.pg-bg { position: fixed; inset: 0; z-index: 0; pointer-events: none; overflow: hidden; }
.pg-bg canvas { position: absolute; inset: 0; width: 100%; height: 100%; }
.pg-orbe { position: absolute; border-radius: 50%; filter: blur(90px); opacity: .5; will-change: transform; }
.pg-orbe--a { width: 520px; height: 520px; left: -140px; top: 8vh; background: hsl(var(--primary) / .32); }
.pg-orbe--b { width: 420px; height: 420px; right: -120px; top: 55vh; background: hsl(172 80% 40% / .26); }
.pg-orbe--c { width: 300px; height: 300px; left: 40%; top: 120vh; background: hsl(var(--primary) / .18); }
.pg-fantasma { position: absolute; right: -2vw; top: 7rem; font: 800 clamp(5rem, 16vw, 15rem)/.85 var(--font-display);
  letter-spacing: -.05em; color: transparent; -webkit-text-stroke: 1px hsl(var(--primary) / .22); white-space: nowrap;
  pointer-events: none; user-select: none; }

.pg-card { position: relative; transform-style: preserve-3d; border-radius: 1rem;
  border: 1px solid hsl(var(--primary) / .22); background: linear-gradient(160deg, hsl(0 0% 100% / .055), hsl(0 0% 100% / .015));
  backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
  box-shadow: 0 30px 60px -30px hsl(0 0% 0% / .8), 0 0 0 1px hsl(0 0% 100% / .02) inset, 0 0 40px -24px hsl(var(--primary) / .6);
  transform: perspective(1000px) rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg)) translateY(var(--lift, 0px));
  transition: transform .5s cubic-bezier(.2,.7,.2,1), box-shadow .4s ease, border-color .4s ease; }
.pg-card::before { content: ""; position: absolute; inset: 0; border-radius: inherit; pointer-events: none; opacity: 0;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary) / .20), transparent 45%);
  transition: opacity .3s ease; }
.pg-card::after { content: ""; position: absolute; inset: -1px; border-radius: inherit; pointer-events: none; padding: 1px; opacity: 0;
  background: radial-gradient(260px circle at var(--mx, 50%) var(--my, 50%), hsl(var(--primary)), transparent 60%);
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude;
  transition: opacity .3s ease; }
.pg-card:hover { --lift: -6px; border-color: hsl(var(--primary) / .55);
  box-shadow: 0 40px 80px -30px hsl(0 0% 0% / .9), 0 0 60px -12px hsl(var(--primary) / .55); transition: transform .12s linear, box-shadow .4s ease, border-color .4s ease; }
.pg-card:hover::before, .pg-card:hover::after { opacity: 1; }
.pg-z1 { transform: translateZ(28px); }
.pg-z2 { transform: translateZ(48px); }

.pg-flutua { animation: pg-flutua 7s ease-in-out infinite; animation-delay: var(--d, 0s); }
@keyframes pg-flutua { 0%,100% { translate: 0 0; } 50% { translate: 0 -10px; } }

.pg-neon { text-shadow: 0 0 18px hsl(var(--primary) / .55), 0 0 42px hsl(var(--primary) / .25); animation: pg-pulso 4.5s ease-in-out infinite; }
@keyframes pg-pulso { 0%,100% { text-shadow: 0 0 14px hsl(var(--primary) / .45), 0 0 36px hsl(var(--primary) / .2); }
  50% { text-shadow: 0 0 24px hsl(var(--primary) / .75), 0 0 60px hsl(var(--primary) / .35); } }
.pg-num { text-shadow: 0 0 22px hsl(var(--primary) / .6); }

.pg-hud { position: relative; z-index: 2; padding: .8rem 1.1rem; white-space: nowrap; min-width: 220px; font: 500 12px/1.35 var(--font-data); color: hsl(var(--foreground) / .9); }
.pg-hud b { display: block; font: 600 18px/1.2 var(--font-data); color: hsl(var(--primary)); margin-top: 2px; }
.pg-hud i { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: hsl(var(--primary)); margin-right: 6px;
  box-shadow: 0 0 10px hsl(var(--primary)); animation: pg-pisca 1.6s ease-in-out infinite; }
@keyframes pg-pisca { 50% { opacity: .35; } }

.pg-trilho { position: absolute; left: 27px; top: 1rem; bottom: 1rem; width: 2px; background: hsl(var(--primary) / .15); border-radius: 2px; }
.pg-trilho::after { content: ""; position: absolute; left: 0; top: 0; width: 100%; height: calc(var(--prog, 0) * 100%);
  background: hsl(var(--primary)); box-shadow: 0 0 14px hsl(var(--primary)), 0 0 30px hsl(var(--primary) / .6); border-radius: 2px; }
.pg-no { box-shadow: 0 0 0 6px hsl(var(--background)), 0 0 24px -4px hsl(var(--primary)); transition: box-shadow .4s, background .4s, color .4s; }
.pg-no.ativo { background: hsl(var(--primary)); color: hsl(var(--primary-foreground)); box-shadow: 0 0 0 6px hsl(var(--background)), 0 0 34px hsl(var(--primary)); }

.pg-video { animation: pg-respira 6s ease-in-out infinite; }
@keyframes pg-respira { 0%,100% { box-shadow: 0 0 80px -30px hsl(var(--primary) / .9); } 50% { box-shadow: 0 0 110px -24px hsl(var(--primary)); } }

@media (prefers-reduced-motion: reduce) {
  .pg-flutua, .pg-neon, .pg-hud i, .pg-video { animation: none !important; }
  .pg-card { transform: none !important; }
}
`;

function FundoVivo() {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current; if (!cv) return;
    const g = cv.getContext("2d"); if (!g) return;
    const reduz = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let W = 0, H = 0, raf = 0, rato = { x: -999, y: -999 };
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    type P = { x: number; y: number; vx: number; vy: number; r: number; z: number };
    let ps: P[] = [];
    const montar = () => {
      W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = Math.round(Math.min(110, (W * H) / 14000));
      ps = Array.from({ length: n }, () => ({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .25,
        vy: (Math.random() - .5) * .25, r: .6 + Math.random() * 1.8, z: .3 + Math.random() * .7 }));
    };
    const quadro = () => {
      g.clearRect(0, 0, W, H);
      const sy = window.scrollY;
      for (const p of ps) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
      }
      // profundidade: partículas mais próximas (z alto) andam mais com a rolagem
      const pos = ps.map((p) => ({ x: p.x, y: ((p.y - sy * p.z * .15) % H + H) % H, r: p.r * p.z, z: p.z }));
      for (let i = 0; i < pos.length; i++) {
        for (let j = i + 1; j < pos.length; j++) {
          const dx = pos[i].x - pos[j].x, dy = pos[i].y - pos[j].y, d = dx * dx + dy * dy;
          if (d < 140 * 140) { g.strokeStyle = `hsla(171,77%,64%,${(1 - Math.sqrt(d) / 140) * .14})`; g.lineWidth = 1;
            g.beginPath(); g.moveTo(pos[i].x, pos[i].y); g.lineTo(pos[j].x, pos[j].y); g.stroke(); }
        }
        const mx = pos[i].x - rato.x, my = pos[i].y - rato.y, dm = Math.sqrt(mx * mx + my * my);
        if (dm < 180) { g.strokeStyle = `hsla(171,77%,64%,${(1 - dm / 180) * .45})`; g.beginPath(); g.moveTo(pos[i].x, pos[i].y); g.lineTo(rato.x, rato.y); g.stroke(); }
      }
      for (const p of pos) { g.fillStyle = `hsla(171,77%,${60 + p.z * 15}%,${.35 + p.z * .5})`; g.shadowColor = "hsl(171,77%,64%)"; g.shadowBlur = 8 * p.z;
        g.beginPath(); g.arc(p.x, p.y, p.r, 0, 7); g.fill(); }
      g.shadowBlur = 0;
      if (!reduz) raf = requestAnimationFrame(quadro);
    };
    const mover = (e: PointerEvent) => { rato = { x: e.clientX, y: e.clientY }; };
    montar(); quadro();
    window.addEventListener("resize", montar); window.addEventListener("pointermove", mover, { passive: true });
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", montar); window.removeEventListener("pointermove", mover); };
  }, []);
  return (
    <div className="pg-bg" aria-hidden="true">
      <div data-speed="0.25" className="pg-orbe pg-orbe--a" />
      <div data-speed="-0.15" className="pg-orbe pg-orbe--b" />
      <div data-speed="0.4" className="pg-orbe pg-orbe--c" />
      <canvas ref={ref} />
    </div>
  );
}

/** Card que inclina na direção do mouse, com brilho que segue o cursor e borda neon. */
function Tilt({ children, className = "", style, max = 8 }: { children: React.ReactNode; className?: string; style?: React.CSSProperties; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const mover = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType !== "mouse") return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect(), px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--rx", `${((0.5 - py) * max).toFixed(2)}deg`);
    el.style.setProperty("--ry", `${((px - 0.5) * max).toFixed(2)}deg`);
    el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
  };
  const sair = () => { const el = ref.current; if (!el) return; el.style.setProperty("--rx", "0deg"); el.style.setProperty("--ry", "0deg"); };
  return (
    <div ref={ref} onPointerMove={mover} onPointerLeave={sair} className={`pg-card ${className}`} style={style}>
      {children}
    </div>
  );
}

/** Progresso 0→1 da rolagem dentro de um elemento (acende a linha das fases). */
function useProgresso<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [ativo, setAtivo] = useState(-1);
  useEffect(() => {
    let tick = false;
    const atualizar = () => {
      tick = false; const el = ref.current; if (!el) return;
      const r = el.getBoundingClientRect(), vh = window.innerHeight;
      const p = Math.min(1, Math.max(0, (vh * 0.6 - r.top) / r.height));
      el.style.setProperty("--prog", p.toFixed(3));
      setAtivo(Math.floor(p * 5 - 0.05));
    };
    const pedir = () => { if (!tick) { tick = true; requestAnimationFrame(atualizar); } };
    atualizar(); window.addEventListener("scroll", pedir, { passive: true }); window.addEventListener("resize", pedir);
    return () => { window.removeEventListener("scroll", pedir); window.removeEventListener("resize", pedir); };
  }, []);
  return { ref, ativo };
}

function Kicker({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-block rounded-full border border-primary/40 bg-primary/10 text-primary font-semibold uppercase text-xs tracking-widest px-3 py-1.5 shadow-[0_0_24px_-6px_hsl(var(--primary))]"
      style={mono}
    >
      {children}
    </span>
  );
}

function Cabeca({ kicker, titulo, texto }: { kicker: string; titulo: React.ReactNode; texto?: string }) {
  return (
    <div data-reveal className="text-center mb-14 flex flex-col items-center gap-4 max-w-3xl mx-auto">
      <Kicker>{kicker}</Kicker>
      <h2 className="display-title text-3xl md:text-5xl tracking-tight text-foreground">{titulo}</h2>
      {texto && <p className="text-lg text-muted-foreground">{texto}</p>}
      <div className="h-px w-24 bg-primary/70 shadow-[0_0_14px_hsl(var(--primary))]" />
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

  const fasesFx = useProgresso<HTMLOListElement>();

  return (
    <div className="pg-fx min-h-screen flex flex-col bg-background">
      <style>{FX_CSS}</style>
      <ScrollFX />
      <FundoVivo />
      <SEO
        title="Método Prova de Ganho · ROI medido em projetos de IA | Jefferson Lobo"
        description="Método de gestão de projetos de IA em 5 fases e 4 portões: só escala o que provou ganho. Previsto, realizado, capacidade liberada e custo evitado, medidos todo mês."
        path="/provadeganho"
        ogImage={`${SITE_URL}/metodo-prova-de-ganho-og.jpg`}
        jsonLd={jsonLd}
      />
      <Header />

      <main className="flex-1 pt-24">
        {/* Hero */}
        <section className="relative overflow-hidden py-20 md:py-28 border-b border-border">
          <div data-speed="0.5" className="pg-fantasma" aria-hidden="true">GANHO</div>

          {/* Painéis flutuantes do Kerdia ROI (camadas de profundidade, só em telas grandes) */}
          <div className="hidden xl:block" aria-hidden="true">
            <div data-speed="-0.35" className="absolute right-[9%] top-[8%] z-[2]">
              <Tilt className="pg-hud pg-flutua" style={{ ["--d" as string]: "0s" }}><i />Portão C · veredito<b>escalar</b></Tilt>
            </div>
            <div data-speed="-0.2" className="absolute right-[19%] top-[18%] z-[2]">
              <Tilt className="pg-hud pg-flutua" style={{ ["--d" as string]: "-2.4s" }}><i />Ganho realizado / previsto<b>59%</b></Tilt>
            </div>
            <div data-speed="-0.5" className="absolute right-[6%] top-[28%] z-[2] hidden min-[1600px]:block">
              <Tilt className="pg-hud pg-flutua" style={{ ["--d" as string]: "-4.1s" }}><i />Acerto por amostra<b>95,3% ± margem</b></Tilt>
            </div>
          </div>

          <div className="container mx-auto px-4 relative z-10 max-w-5xl space-y-8">
            <div data-reveal><Kicker>Método Prova de Ganho</Kicker></div>
            <h1 data-reveal className="display-title text-4xl sm:text-5xl md:text-7xl tracking-tight text-foreground max-w-[18ch]">
              Ensaio tem valor. Mas só escala o que <span className="highlight-yellow pg-neon"><i>provou ganho</i></span>.
            </h1>
            <p data-reveal className="max-w-2xl text-lg md:text-xl text-foreground/85 leading-relaxed">
              Um método de gestão de projetos de IA para empresas que já pagam por inteligência artificial e precisam
              responder a pergunta do conselho: quanto isso devolveu?
            </p>
            <div data-reveal className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base px-8 py-6 shadow-[0_0_40px_-8px_hsl(var(--primary))]">
                <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" onClick={() => agendar("hero")}>
                  Agendar o diagnóstico <ArrowRight className="ml-2 w-5 h-5" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base px-8 py-6">
                <a href="#fases">Ver as cinco fases</a>
              </Button>
            </div>
            <div data-reveal className="pt-6">
              <VideoMetodo onPlay={() => trackCTA("provadeganho_video_play", "provadeganho")} />
            </div>
          </div>
        </section>

        {/* Resposta direta (GEO) */}
        <section className="py-16 border-b border-border">
          <div className="container mx-auto px-4 max-w-3xl">
            <Tilt className="p-8 md:p-10" max={4}>
              <h2 className="pg-z1 text-2xl md:text-3xl text-foreground mb-4 tracking-tight">O que é o Método Prova de Ganho?</h2>
              <p className="pg-z1 text-base md:text-lg text-foreground/85 leading-relaxed">{faq[0].a}</p>
            </Tilt>
          </div>
        </section>

        {/* A tese */}
        <section className="py-20 md:py-24 border-b border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <Cabeca
              kicker="A tese"
              titulo={<>IA sem prova de ganho é <span className="highlight-yellow pg-neon">hora paga sem retorno</span> e aumento de custo.</>}
              texto="Sua empresa já paga por IA. A maioria não sabe quanto isso devolve."
            />
            <div className="grid md:grid-cols-3 gap-6" style={{ perspective: "1200px" }}>
              {custos.map((c, i) => (
                <div key={c.n} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                  <div className="pg-flutua h-full" style={{ ["--d" as string]: `${-i * 1.8}s` }}>
                    <Tilt className="p-7 h-full">
                      <div className="pg-z2 text-primary text-sm uppercase tracking-widest mb-3 pg-num" style={mono}>{c.n}</div>
                      <p className="pg-z1 text-foreground/85 leading-relaxed">{c.d}</p>
                    </Tilt>
                  </div>
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
            <ol ref={fasesFx.ref} className="relative space-y-5">
              <span className="pg-trilho" aria-hidden="true" />
              {fases.map((f, i) => (
                <li key={f.n} data-reveal className="relative grid grid-cols-[56px_1fr] gap-5" style={{ transitionDelay: `${i * 70}ms` }}>
                  <span
                    className={`pg-no relative z-10 flex h-14 w-14 items-center justify-center rounded-full border border-primary/70 bg-background text-primary font-semibold ${i <= fasesFx.ativo ? "ativo" : ""}`}
                    style={mono}
                  >
                    {f.n}
                  </span>
                  <Tilt className="p-6 md:p-7" max={5}>
                    <h3 className="pg-z2 text-2xl text-foreground tracking-tight mb-2">{f.nome}</h3>
                    <p className="pg-z1 text-foreground/80 leading-relaxed">{f.faz}</p>
                    <div className="pg-z1 mt-4 flex flex-wrap items-center gap-3 text-sm">
                      {f.portao ? (
                        <span className="rounded-full border border-primary/50 bg-primary/10 px-3 py-1 text-primary shadow-[0_0_18px_-6px_hsl(var(--primary))]" style={mono}>
                          Portão {f.portao}
                        </span>
                      ) : (
                        <span className="rounded-full border border-border px-3 py-1 text-muted-foreground" style={mono}>
                          Todo mês
                        </span>
                      )}
                      <span className="text-muted-foreground">{f.decide}</span>
                    </div>
                  </Tilt>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Os quatro ganhos */}
        <section className="py-20 md:py-24 border-b border-border">
          <div className="container mx-auto px-4 max-w-5xl">
            <Cabeca
              kicker="O que o conselho lê"
              titulo="Quatro ganhos, em todo projeto"
              texto="Os mesmos quatro números em cada oportunidade, em cada projeto e no total do cliente."
            />
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ perspective: "1200px" }}>
              {ganhos.map((g, i) => (
                <div key={g.n} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                  <div className="pg-flutua h-full" style={{ ["--d" as string]: `${-i * 1.5}s` }}>
                    <Tilt className="p-6 h-full" max={10}>
                      <div className="pg-z2 mb-4 h-1 w-10 rounded-full bg-primary shadow-[0_0_14px_hsl(var(--primary))]" />
                      <h3 className="pg-z2 text-lg text-foreground tracking-tight mb-2">{g.n}</h3>
                      <p className="pg-z1 text-sm text-muted-foreground leading-relaxed">{g.d}</p>
                    </Tilt>
                  </div>
                </div>
              ))}
            </div>
            <p data-reveal className="mt-8 text-center text-sm text-muted-foreground max-w-2xl mx-auto">
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
            <div className="grid sm:grid-cols-3 gap-5" style={{ perspective: "1200px" }}>
              {[
                ["1.862", "matérias publicadas em 30 dias"],
                ["R$ 234 mil", "por mês custaria uma redação tradicional para esse volume"],
                ["< R$ 1 mil", "por mês é o custo do portal em ferramentas e IA"],
              ].map(([n, l], i) => (
                <div key={n} data-reveal style={{ transitionDelay: `${i * 90}ms` }}>
                  <div className="pg-flutua h-full" style={{ ["--d" as string]: `${-i * 2}s` }}>
                    <Tilt className="p-6 h-full" max={10}>
                      <div className="pg-z2 display-title text-4xl text-primary pg-num">{n}</div>
                      <p className="pg-z1 mt-2 text-sm text-muted-foreground leading-relaxed">{l}</p>
                    </Tilt>
                  </div>
                </div>
              ))}
            </div>
            <div data-reveal className="mt-6">
              <Tilt className="p-6 md:p-7 !border-amber-400/40 shadow-[0_0_50px_-24px_rgba(251,191,36,.8)]" max={3}>
                <div className="pg-z1 text-amber-300 text-sm uppercase tracking-widest mb-2" style={mono}>O que a medição mostrou</div>
                <p className="pg-z1 text-foreground/85 leading-relaxed">
                  A plataforma não deixou comemorar. Em outubro, o portal entregou 57% do ganho previsto. A revisão por
                  amostra mostrou textos 100% corretos, mas só 55% das fotos escolhidas pela IA eram coerentes com a
                  matéria, e o custo de IA subindo sem aumento de publicação. Achamos, medimos e estamos corrigindo. É
                  isso que o método faz.
                </p>
              </Tilt>
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
              {formatos.map((f, i) => (
                <div key={f.nome} data-reveal style={{ transitionDelay: `${i * 80}ms` }}>
                  <Tilt className="p-6 grid md:grid-cols-[1fr_auto] gap-4 items-center" max={3}>
                    <div className="pg-z1">
                      <h3 className="text-xl text-foreground mb-1 tracking-tight">{f.nome}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{f.d}</p>
                    </div>
                    <span className="pg-z2 rounded-full border border-primary/40 bg-primary/10 px-4 py-1.5 text-sm text-primary whitespace-nowrap shadow-[0_0_18px_-6px_hsl(var(--primary))]" style={mono}>
                      {f.prazo}
                    </span>
                  </Tilt>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Kerdia ROI */}
        <section className="py-20 md:py-24 border-b border-border">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-5" data-reveal>
            <Kicker>Kerdia ROI</Kicker>
            <h2 className="display-title text-3xl md:text-5xl tracking-tight text-foreground">
              Você acompanha tudo pelo portal. <span className="highlight-yellow pg-neon">Sem relatório maquiado.</span>
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
                <AccordionItem key={f.q} value={`q${i}`} className="pg-card px-5" data-reveal>
                  <AccordionTrigger className="text-left text-foreground">{f.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{f.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        {/* Fechamento */}
        <section className="py-24">
          <div className="container mx-auto px-4 max-w-4xl text-center space-y-8" data-reveal>
            <p className="display-title text-3xl md:text-5xl tracking-tight text-foreground">
              Defendemos que, todo ensaio tem valor. <span className="highlight-yellow pg-neon"><i>Mas só escala o que provou ganho.</i></span>
            </p>
            <p className="text-muted-foreground">
              Agência de Inteligência Vozes · projetos liderados por Jefferson Lobo
            </p>
            <Button size="lg" asChild className="text-base px-8 py-6 shadow-[0_0_40px_-8px_hsl(var(--primary))]">
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
