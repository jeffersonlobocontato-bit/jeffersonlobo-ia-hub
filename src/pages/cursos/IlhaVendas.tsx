import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Check,
  ChevronDown,
  Clapperboard,
  Images,
  MessageCircleReply,
  MonitorPlay,
  Paperclip,
  Plus,
  Rocket,
  ShieldCheck,
  Sparkles,
  Wallet,
  X,
} from 'lucide-react';
import { SEO, SITE_URL } from '@/components/SEO';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { CURSO_ILHA, LIVRO_DEL, loteAtual } from '@/content/cursos/ilha';
import { POCKETS, VALOR_POCKETS, reais } from '@/content/cursos/pockets';
import { ESCOLA } from '@/content/cursos/escola';
import EscolaTopo from '@/components/cursos/escola/EscolaTopo';
import EscolaRodape from '@/components/cursos/escola/EscolaRodape';
import CompraJanela from '@/components/cursos/CompraJanela';
import { useEscola } from '@/components/cursos/escola/useEscola';
import '@/styles/escola.css';

// Página de vendas do curso (jeffersonlobo.tech/cursos/ilha), no mesmo tema da
// vitrine (/cursos). Preços, lote e bônus vêm de content/cursos/ilha.ts: na
// virada do lote, o preço, o contador e os textos mudam sozinhos. Com
// pagamento 'mercadopago', os botões abrem a janela de compra; com 'hotmart',
// levam ao link de checkout do lote.

const atraso = (d: string) => ({ ['--d' as string]: d }) as React.CSSProperties;
const diaMes = (ms: number) =>
  new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(ms));

const DORES = [
  { n: '01', olho: 'Ideia parada', titulo: 'O caderno cheio', texto: 'O reel que ia gravar, o carrossel que ia postar, o curso que ia lançar. Tudo esperando.' },
  {
    n: '02',
    olho: 'Dependência',
    titulo: 'A agenda dos outros',
    texto: 'O editor entrega semana que vem. O designer está cheio. A agência custa mais do que o conteúdo traz.',
  },
  { n: '03', olho: 'Direct sem resposta', titulo: 'Quem pediu, não recebeu', texto: 'A pessoa comentou pedindo o material e ficou sem resposta. A venda morreu ali.' },
];

const FRENTES = [
  {
    olho: 'Aula 1 · Reels',
    titulo: 'Ilha de Edição',
    img: '/cursos-ilha/img/ilha.jpg',
    alt: 'Galeria de modelos da Ilha de Edição',
    texto: 'Você grava no celular, escolhe um dos 10 modelos, a paleta e a trilha. O reel volta com cortes, legenda, lettering e capa.',
  },
  {
    olho: 'Aula 2 · Carrossel',
    titulo: 'Carrossel',
    img: '/cursos-ilha/img/carrossel.jpg',
    alt: 'Criador de carrossel',
    texto: 'De uma notícia, um tema ou uma técnica, sai o carrossel na sua paleta, com os slides prontos para postar.',
  },
  {
    olho: 'Aula 3 · Stories',
    titulo: 'Stories do dia',
    img: '/cursos-ilha/img/stories.jpg',
    alt: 'Sequência de stories animados',
    texto: 'Um tema vira uma sequência de stories animados, com enquete, quiz e caixinha nos pontos certos.',
  },
  {
    olho: 'Aula 4 · Direct',
    titulo: 'Direct automático',
    img: '/cursos-ilha/img/direct.jpg',
    alt: 'Painel de relacionamento com as automações do direct',
    texto: 'Quem comenta a palavra recebe o material no direct, e você acompanha cada automação com os números do funil.',
  },
  {
    olho: 'Aula 5 · Arsenal',
    titulo: 'Arsenal',
    img: '/cursos-ilha/img/arsenal.jpg',
    alt: 'Arsenal de formatos',
    texto: 'Formatos que já deram certo, desmontados pelo Método DEL e reescritos com a sua voz.',
  },
  {
    olho: 'Em todas as aulas',
    titulo: 'Ajuste fino na linha do tempo',
    img: '/cursos-ilha/img/editor.jpg',
    alt: 'Linha do tempo da Ilha de Edição',
    texto: 'Quer mudar um corte, uma legenda ou um lettering? Abre na Ilha, ajusta e renderiza de novo.',
  },
];

const PASSOS = [
  { icone: MonitorPlay, titulo: '1. Assiste à aula', texto: 'Cada aula mostra a frente funcionando, na tela de verdade.' },
  { icone: Paperclip, titulo: '2. Anexa o instalador', texto: 'Você anexa o arquivo no seu Claude e escreve uma frase. Ele instala.' },
  { icone: Rocket, titulo: '3. Usa no mesmo dia', texto: 'Com o manual do lado, você já publica o primeiro conteúdo.' },
];

const REELS = [
  { n: 'r1', legenda: 'Editor de vídeo' },
  { n: 'r2', legenda: 'Campeão no crachá' },
  { n: 'r3', legenda: 'Quem tem o microfone' },
  { n: 'r5', legenda: 'Estilo interface' },
];

const PARA_QUEM = [
  'é profissional liberal e vende pelo Instagram',
  'é infoprodutor e precisa de volume',
  'tem um pequeno negócio e cuida do próprio conteúdo',
  'é social media e quer entregar mais em menos tempo',
];
const NAO_E = ['não quer ter um plano pago do Claude', 'procura um botão mágico que posta sem você aparecer nem revisar'];

const CONTA = [
  { faz: 'Edita os reels', ref: 'Editor freelancer, pacote de 8 reels por mês, só edição (tabela 2026)', valor: 'R$ 1.500/mês' },
  { faz: 'Escreve os roteiros', ref: 'Roteirista, 5 roteiros de vídeo a R$ 400 (tabela 2026)', valor: 'R$ 2.000/mês' },
  { faz: 'Cria carrosséis e stories', ref: 'Designer, pacote de 16 peças por mês com templates (tabela 2026)', valor: 'R$ 1.200/mês' },
  { faz: 'Responde o direct sozinho', ref: 'Chatbot simples, projeto (tabela 2026)', valor: 'R$ 1.500, uma vez' },
  { faz: 'Mostra formatos que funcionam, com a sua voz', ref: 'Consultoria de social media (tabela 2025)', valor: 'R$ 700/mês' },
];

const REQUISITOS = [
  {
    icone: Check,
    tag: 'Obrigatório',
    titulo: 'Plano pago do Claude',
    texto: 'Pro, Max, Team ou Enterprise. Artefatos salvos, conectores e rotinas agendadas só existem nesses planos.',
  },
  { icone: Check, tag: 'Grátis', titulo: 'Zernio, para o direct', texto: 'Grátis para até 2 contas e 10 mil DMs por mês.' },
  { icone: Plus, tag: 'Opcional', titulo: 'HeyGen e Windsor', texto: 'Avatar e análise do Instagram. Pagos à parte, só se você quiser.' },
];

/** Hora atual, atualizada a cada segundo enquanto `ativo` (o contador do lote). */
function useAgora(ativo: boolean) {
  const [agora, setAgora] = useState(() => Date.now());
  useEffect(() => {
    if (!ativo) return;
    const t = window.setInterval(() => setAgora(Date.now()), 1000);
    return () => window.clearInterval(t);
  }, [ativo]);
  return agora;
}

function Contador({ restante }: { restante: number }) {
  const partes = [
    [Math.floor(restante / 864e5), 'dias'],
    [Math.floor(restante / 36e5) % 24, 'horas'],
    [Math.floor(restante / 6e4) % 60, 'min'],
    [Math.floor(restante / 1e3) % 60, 'seg'],
  ] as const;
  return (
    <div className="e-contador" role="timer" aria-label="Tempo até o fim do lote 1">
      {partes.map(([v, u]) => (
        <div key={u}>
          <b>{String(v).padStart(2, '0')}</b>
          <small>{u}</small>
        </div>
      ))}
    </div>
  );
}

// Vídeo de vendas (vertical): capa parada com o botão; no toque, toca com som e controles.
function VSL({ aoTocar }: { aoTocar: () => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const tocar = () => {
    const v = video.current;
    if (!v) return;
    setTocando(true);
    aoTocar();
    v.play().catch(() => setTocando(false));
  };
  return (
    <div className="e-vsl">
      <video
        ref={video}
        src="/cursos-ilha/vsl/vsl.mp4"
        poster="/cursos-ilha/vsl/capa.jpg"
        playsInline
        preload="metadata"
        controls={tocando}
        aria-label="Vídeo de apresentação do curso Ilha de Edição completa"
      />
      {!tocando && (
        <button type="button" className="e-podcast__som e-vsl__play" onClick={tocar}>
          <span className="e-podcast__icone" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          Assistir ao vídeo
        </button>
      )}
    </div>
  );
}

// Reel de prova: mudo, em loop, e só toca enquanto está na tela (e não toca
// para quem pediu menos movimento; aí fica a capa).
function Reel({ n, legenda, i }: { n: string; legenda: string; i: number }) {
  const video = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = video.current;
    if (!v) return;
    v.muted = true;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return;
    if (!('IntersectionObserver' in window)) {
      v.play().catch(() => undefined);
      return;
    }
    const obs = new IntersectionObserver(([e]) => (e.isIntersecting ? v.play().catch(() => undefined) : v.pause()), { threshold: 0.25 });
    obs.observe(v);
    return () => obs.disconnect();
  }, []);
  return (
    <figure className="e-reel e-revela" style={atraso(`${i * 0.08}s`)}>
      <video
        ref={video}
        src={`/cursos-ilha/reels/${n}.mp4`}
        poster={`/cursos-ilha/reels/${n}.jpg`}
        muted
        loop
        playsInline
        preload="metadata"
        aria-label={`Reel editado na Ilha: ${legenda}`}
      />
      <figcaption>{legenda}</figcaption>
    </figure>
  );
}

const Check12 = () => (
  <span className="e-check" aria-hidden>
    <Check size={12} strokeWidth={3} />
  </span>
);

const IlhaVendas = () => {
  const raiz = useRef<HTMLDivElement>(null);
  useEscola(raiz);
  const { trackCTA } = useTrackCTA();
  const [compraAberta, setCompraAberta] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);
  const compraTopo = useRef<HTMLDivElement>(null);
  const [barraVisivel, setBarraVisivel] = useState(false);

  const fim = new Date(CURSO_ILHA.precos.fimLote1).getTime();
  const agora = useAgora(Date.now() <= fim);
  const lote = loteAtual(CURSO_ILHA, agora);
  const lote1 = lote.lote === 1;
  const restante = Math.max(0, fim - agora);
  const direto = CURSO_ILHA.pagamento === 'mercadopago';

  const preco = reais(lote.preco);
  const valorBonus = Math.round((CURSO_ILHA.bonus.valor + CURSO_ILHA.bonusPockets.valor) * 100) / 100;
  const fimCurto = diaMes(fim);

  const comprar = useCallback(
    (onde: string) => {
      trackCTA(`ilha_comprar_${onde}`, 'ilha_vendas');
      if (direto) setCompraAberta(true);
    },
    [direto, trackCTA],
  );

  // Voltou de um pagamento recusado: reabre a janela com o recado.
  useEffect(() => {
    if (direto && new URLSearchParams(window.location.search).get('pagamento') === 'recusado') {
      setAviso('O pagamento não foi aprovado. Tente de novo, com outro cartão ou com Pix.');
      setCompraAberta(true);
    }
  }, [direto]);

  // Barra de compra no celular: só aparece depois que a compra do topo sai da
  // tela, para não cobrir o vídeo na primeira dobra.
  useEffect(() => {
    const el = compraTopo.current;
    if (!el || !('IntersectionObserver' in window)) return setBarraVisivel(true);
    const obs = new IntersectionObserver(([e]) => setBarraVisivel(!e.isIntersecting && e.boundingClientRect.top < 0));
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Botão de compra: abre a janela (Mercado Pago) ou vai ao checkout do lote
  // (Hotmart). Sem checkout configurado, leva até a oferta. É uma função, não
  // um componente, para não remontar a cada segundo do contador.
  const botaoComprar = (onde: string, texto: string, extra = '') => {
    const classe = `e-btn e-btn--principal ${extra}`;
    if (direto)
      return (
        <button type="button" className={classe} onClick={() => comprar(onde)}>
          {texto}
        </button>
      );
    return (
      <a
        href={lote.checkout || '#oferta'}
        {...(lote.checkout ? { target: '_blank', rel: 'noopener' } : {})}
        className={classe}
        onClick={() => comprar(onde)}
      >
        {texto}
      </a>
    );
  };

  const faq = [
    { p: 'Preciso saber programar?', r: 'Não. Você anexa o arquivo no Claude e escreve uma frase; ele instala.' },
    {
      p: 'Preciso pagar mais alguma coisa?',
      r: 'Um plano pago do Claude (Pro ou superior). A automação do direct usa a Zernio, grátis para até 2 contas. Avatar (HeyGen) e análise do Instagram (Windsor) são opcionais.',
    },
    { p: 'Funciona no meu nicho?', r: 'Funciona para quem cria conteúdo para Instagram: a Ilha usa o seu vídeo, a sua paleta e a sua voz.' },
    { p: 'Preciso aparecer?', r: 'Para os reels, sim, ou usar um avatar. Carrossel, stories e direct funcionam sem vídeo.' },
    { p: 'Quanto tempo leva para editar um reel?', r: 'De 10 a 30 minutos, conforme o tamanho do vídeo, na fila automática.' },
    { p: 'Gasta o meu plano do Claude?', r: 'Sim: cada edição é uma sessão de trabalho dentro dos limites do seu plano.' },
    {
      p: 'Como recebo o acesso e os bônus?',
      r: 'Assim que o pagamento é aprovado (no Pix, em segundos), chega no seu e-mail o link da área do aluno, aqui no jeffersonlobo.tech. As aulas, os instaladores, os manuais, o e-book e os 3 pockets ficam todos lá.',
    },
    {
      p: 'Quais são as formas de pagamento?',
      r: 'Pix, boleto ou cartão de crédito em até 12x, na página segura do Mercado Pago. Os dados do cartão não passam por este site.',
    },
    {
      p: 'Por quanto tempo tenho acesso?',
      r: `As aulas ficam disponíveis por ${ESCOLA.prazoAcesso} a partir da compra. Os instaladores e manuais que você baixar ficam com você.`,
    },
    { p: 'Tem suporte?', r: 'Tem. O Tutor IA responde dentro de cada aula, a qualquer hora, e o suporte humano é pelo WhatsApp.' },
    { p: 'E se eu não gostar?', r: `Você tem ${CURSO_ILHA.garantiaDias} dias para pedir o reembolso, com devolução integral. É só me chamar no WhatsApp.` },
  ];

  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Course',
    name: CURSO_ILHA.nome,
    description: CURSO_ILHA.descricao,
    url: `${SITE_URL}${CURSO_ILHA.vitrine.pagina}`,
    image: `${SITE_URL}/cursos-ilha/og.jpg`,
    provider: { '@type': 'Person', name: 'Jefferson Lobo', url: SITE_URL },
    offers: { '@type': 'Offer', price: String(lote.preco), priceCurrency: 'BRL', category: 'Paid', availability: 'https://schema.org/InStock' },
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
  };

  const recebe = [
    <><b>5 videoaulas</b>, uma por frente, com as telas reais</>,
    <><b>5 instaladores</b> para o seu Claude: os arquivos do código e o arquivo de instrução</>,
    <><b>5 manuais</b> de funcionamento, em PDF</>,
    <><b>Tutor IA</b> que tira as suas dúvidas dentro de cada aula, a qualquer hora</>,
    <><b>10 modelos de reels</b> já configurados</>,
    <><b>Trilhas e efeitos sonoros</b> originais, livres de direitos</>,
    <><b>Bônus: o e-book O código invisível</b>, o livro do Método DEL <span className="e-ilha-vale">vale {reais(CURSO_ILHA.bonus.valor)}</span></>,
    <><b>Bônus: 3 pockets em PDF</b> para tirar o Claude do genérico <span className="e-ilha-vale">vale {reais(VALOR_POCKETS)}</span></>,
  ];

  return (
    <div className="escola e-ilha-pagina" ref={raiz}>
      <SEO
        title="Ilha de Edição completa: agora você faz seu conteúdo sozinho no Claude | Jefferson Lobo"
        description={CURSO_ILHA.descricao}
        path={CURSO_ILHA.vitrine.pagina}
        ogImage={`${SITE_URL}/cursos-ilha/og.jpg`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <EscolaTopo onCta={() => trackCTA('ilha_topo', 'ilha_vendas')} />

      <main>
        {/* topo: promessa, vídeo e compra */}
        <section className="e-ilha-hero">
          <div className="e-aura" aria-hidden>
            <div className="e-aura__grade" />
          </div>
          <div className="e-ilha-hero__miolo">
            <div className="e-ilha-hero__texto">
              <span className="e-selo e-entra" style={atraso('0s')}>
                <span className="e-selo__ponto" aria-hidden />
                {lote1 ? `Lote 1 aberto até ${fimCurto}` : 'Inscrições abertas'}
              </span>
              <h1 className="e-pocket-hero__titulo e-entra" style={atraso('0.15s')}>
                Pela primeira vez, você faz seus <span className="e-ilha-destaque">reels, carrosséis, stories e direct</span> sozinho.
              </h1>
              <p className="e-pocket-hero__sub e-entra" style={atraso('0.3s')}>
                Um estúdio de conteúdo que roda no seu Claude, instalado por você em 5 aulas. Para quem cria conteúdo e não tem equipe.
              </p>
            </div>

            <div className="e-ilha-hero__video e-entra" style={atraso('0.35s')}>
              <VSL aoTocar={() => trackCTA('ilha_vsl_play', 'ilha_vendas')} />
            </div>

            <div className="e-ilha-hero__compra e-entra" style={atraso('0.45s')} ref={compraTopo}>
              <div className="e-pocket-compra">
                <div className="e-preco">
                  <small>{lote1 ? `Lote 1 · até ${fimCurto}, 23h59` : 'Lote 2'}</small>
                  <b>{preco}</b>
                  <span>pagamento único · Pix, boleto ou até 12x</span>
                </div>
                {botaoComprar('topo', 'Quero as aulas e o pack agora', 'e-pocket-compra__botao')}
              </div>
              <p className="e-ilha-bonus-linha">
                <span className="e-ilha-gratis">Grátis</span>
                <span>
                  + o e-book <b>O código invisível</b> e <b>3 pockets</b> <s>{reais(valorBonus)}</s>
                </span>
              </p>
              {lote1 && (
                <div className="e-ilha-prazo">
                  <span>O preço sobe para {reais(CURSO_ILHA.precos.lote2)} em</span>
                  <Contador restante={restante} />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* a dor */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Você conhece esse lugar</span>
            <h2 className="e-h2">Você grava, mas o vídeo fica na galeria. Tem ideia, mas depende de alguém para postar.</h2>
          </div>
          <ul className="e-recursos">
            {DORES.map((d, i) => (
              <li key={d.n} className="e-recurso e-revela" style={atraso(`${i * 0.08}s`)}>
                <span className="e-recurso__icone e-ilha-num" aria-hidden>
                  {d.n}
                </span>
                <span className="e-olho">{d.olho}</span>
                <h3>{d.titulo}</h3>
                <p>{d.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* a história */}
        <section className="e-secao">
          <div className="e-ilha-duo">
            <figure className="e-ilha-foto e-revela">
              <img src="/cursos-ilha/img/historia.jpg" alt="Jefferson Lobo no estúdio" width={864} height={1080} loading="lazy" />
            </figure>
            <div className="e-cab e-revela" style={atraso('0.1s')}>
              <span className="e-olho">A história</span>
              <h2 className="e-h2">
                Eu não acreditei em prompt milagroso. <span className="e-ilha-destaque">Fui testar.</span>
              </h2>
              <p>
                Quando a IA chegou, eu vi muita promessa fácil. A minha regra sempre foi uma: ensaio tem valor, mas só prova de ganho vale
                escalar.
              </p>
              <p>
                Então montei, dentro do Claude, um estúdio de conteúdo. Não é um site nem um aplicativo que você assina. É uma plataforma
                que roda na sua própria conta, com banco de dados e tarefas que trabalham sozinhas.
              </p>
              <blockquote className="e-ilha-citacao">Gravei no celular, escolhi o modelo, e uns vinte minutos depois o reel estava pronto.</blockquote>
            </div>
          </div>
        </section>

        {/* as cinco frentes */}
        <section className="e-secao" id="frentes">
          <div className="e-cab e-revela">
            <span className="e-olho">O que você vai montar</span>
            <h2 className="e-h2">Cinco frentes. Uma aula para cada.</h2>
            <p>As telas abaixo são da plataforma funcionando, com dados e criações reais.</p>
          </div>
          <div className="e-catalogo">
            {FRENTES.map((f, i) => (
              <article key={f.titulo} className="e-card e-revela" style={atraso(`${(i % 3) * 0.08}s`)}>
                <span className="e-card__feixe" aria-hidden />
                <span className="e-card__brilho" aria-hidden />
                <div className="e-card__thumb e-ilha-frente__thumb">
                  <img src={f.img} alt={f.alt} width={820} height={968} loading="lazy" />
                </div>
                <span className="e-olho">{f.olho}</span>
                <h3 className="e-card__titulo">{f.titulo}</h3>
                <p className="e-card__texto">{f.texto}</p>
              </article>
            ))}
          </div>
        </section>

        {/* como funciona */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Como funciona</span>
            <h2 className="e-h2">Você não programa nada.</h2>
          </div>
          <ul className="e-recursos">
            {PASSOS.map((s, i) => (
              <li key={s.titulo} className="e-recurso e-revela" style={atraso(`${i * 0.08}s`)}>
                <span className="e-recurso__icone" aria-hidden>
                  <s.icone size={22} />
                </span>
                <h3>{s.titulo}</h3>
                <p>{s.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* provas */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Provas</span>
            <h2 className="e-h2">Estes reels foram editados na Ilha.</h2>
            <p>Sem editor, sem designer, sem agência. Gravados no celular e editados na fila automática.</p>
          </div>
          <div className="e-reels">
            {REELS.map((r, i) => (
              <Reel key={r.n} n={r.n} legenda={r.legenda} i={i} />
            ))}
          </div>
        </section>

        {/* para quem é */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Para quem é</span>
            <h2 className="e-h2">Feito para quem precisa postar e não tem equipe.</h2>
          </div>
          <div className="e-planos">
            <div className="e-plano e-plano--destaque e-revela">
              <div className="e-plano__topo">
                <h3>É para você se</h3>
                <span className="e-plano__icone" aria-hidden>
                  <Check size={18} />
                </span>
              </div>
              <ul className="e-lista">
                {PARA_QUEM.map((t) => (
                  <li key={t}>
                    <Check12 />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="e-plano e-revela" style={atraso('0.1s')}>
              <div className="e-plano__topo">
                <h3>Não é para você se</h3>
                <span className="e-plano__icone" aria-hidden>
                  <X size={18} />
                </span>
              </div>
              <ul className="e-lista">
                {NAO_E.map((t) => (
                  <li key={t}>
                    <span className="e-check e-check--nao" aria-hidden>
                      <X size={12} strokeWidth={3} />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* a conta */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">A conta</span>
            <h2 className="e-h2">
              Se você fosse contratar, pagaria no mínimo <span className="e-ilha-destaque">R$ 6.900</span> no primeiro mês.
            </h2>
          </div>
          <div className="e-ilha-conta e-revela">
            <table>
              <thead>
                <tr>
                  <th scope="col">O que a Ilha faz</th>
                  <th scope="col">Mínimo de mercado</th>
                </tr>
              </thead>
              <tbody>
                {CONTA.map((c) => (
                  <tr key={c.faz}>
                    <td>
                      {c.faz}
                      <small>{c.ref}</small>
                    </td>
                    <td>{c.valor}</td>
                  </tr>
                ))}
                <tr className="e-ilha-conta__total">
                  <td>Total no primeiro mês</td>
                  <td>R$ 6.900</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="e-conta e-revela">
            Nos meses seguintes, sem o chatbot, seriam <b>R$ 5.400 por mês</b>. Na Ilha, você paga <b>{preco}</b> uma vez.
          </p>
        </section>

        {/* a oferta */}
        <section className="e-secao" id="oferta">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">A oferta</span>
            <h2 className="e-h2">
              Tudo isso por <span className="e-ilha-destaque">{preco}</span>. Uma vez.
            </h2>
          </div>
          <div className="e-ilha-oferta e-revela">
            <div className="e-ilha-oferta__itens">
              <h3>O que você recebe</h3>
              <ul className="e-lista">
                {recebe.map((item, i) => (
                  <li key={i}>
                    <Check12 />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="e-ilha-oferta__preco">
              <span className="e-plano__selo">{lote1 ? 'Lote 1' : 'Lote 2'}</span>
              <div className="e-preco">
                <small>{lote1 ? `até ${fimCurto}, 23h59` : 'preço atual'}</small>
                <b>{preco}</b>
                <span>pagamento único · Pix, boleto ou até 12x</span>
              </div>
              <p className="e-ilha-oferta__total">
                Você leva <b>{reais(Math.round((lote.preco + valorBonus) * 100) / 100)}</b> em conteúdo por <b>{preco}</b>
              </p>
              {lote1 && <Contador restante={restante} />}
              {botaoComprar('oferta', 'Quero as aulas e o pack agora')}
              {lote1 && (
                <p className="e-plano__garantia">
                  A partir de {diaMes(fim + 1000)}, {reais(CURSO_ILHA.precos.lote2)}. Lote vencido não reabre.
                </p>
              )}
              <p className="e-plano__garantia e-ilha-oferta__garantia">
                <ShieldCheck size={14} aria-hidden /> {CURSO_ILHA.garantiaDias} dias de garantia, com reembolso integral
              </p>
            </div>
          </div>
        </section>

        {/* bônus */}
        <section className="e-secao">
          <div className="e-cab e-revela">
            <span className="e-olho">Bônus</span>
            <h2 className="e-h2">Vem junto, sem pagar a mais</h2>
          </div>
          <div className="e-ilha-bonus">
            <div className="e-livro e-revela">
              <div className="e-livro__capa">
                <img src={LIVRO_DEL.capa} alt={`Capa do livro ${LIVRO_DEL.curto}, de Jefferson Lobo`} width={560} height={899} loading="lazy" />
              </div>
              <div className="e-livro__texto">
                <span className="e-olho e-olho--laranja">Bônus · e-book de {reais(CURSO_ILHA.bonus.valor)}</span>
                <h3 className="e-h2">O código invisível dos superagentes de inteligência artificial</h3>
                <p>
                  O livro do Método DEL: como transformar o jeito como você escreve, argumenta e escolhe palavras em orientações para
                  agentes de IA, como o Claude. Na Aula 5 você usa o DEL para adaptar formatos; no livro está o método inteiro.
                </p>
                <ul className="e-lista e-lista--laranja">
                  {[
                    'Os três eixos da sua identidade linguística: sintático, semântico e lexical',
                    'O glossário invertido: as palavras e os clichês que você recusa',
                    'A Oficina DEL, com modelos para montar os seus arquivos de referência',
                  ].map((t) => (
                    <li key={t}>
                      <Check12 />
                      <span>{t}</span>
                    </li>
                  ))}
                </ul>
                <div className="e-livro__precos">
                  <div>
                    <small>Vendido sozinho por</small>
                    <b>
                      <s>{reais(CURSO_ILHA.bonus.valor)}</s>
                    </b>
                  </div>
                  <div>
                    <small>Para quem leva as aulas</small>
                    <b className="e-ilha-gratis-grande">Grátis</b>
                  </div>
                </div>
              </div>
            </div>

            <div className="e-pacote e-revela">
              <div className="e-pacote__capas">
                {POCKETS.map((p) => (
                  <img key={p.slug} src={p.capa} alt={`Capa do pocket ${p.nome}`} width={840} height={1189} loading="lazy" />
                ))}
              </div>
              <div className="e-pacote__texto">
                <span className="e-olho">Bônus · 3 pockets de {reais(POCKETS[0].preco)}</span>
                <h3 className="e-h2">3 pockets para tirar o Claude do genérico</h3>
                <p>
                  Tutoriais curtos em PDF, com as telas do Claude em português e modelos para copiar. Cada um resolve uma coisa só, e cada
                  um tem o próprio Tutor IA.
                </p>
                <ul className="e-lista">
                  {POCKETS.map((p) => (
                    <li key={p.slug}>
                      <Check12 />
                      <span>
                        <b>{p.nome}</b>: {p.chamada}
                      </span>
                    </li>
                  ))}
                </ul>
                <div className="e-livro__precos">
                  <div>
                    <small>Vendidos sozinhos por</small>
                    <b>
                      <s>{reais(VALOR_POCKETS)}</s>
                    </b>
                  </div>
                  <div>
                    <small>Para quem leva as aulas</small>
                    <b className="e-ilha-gratis-grande">Grátis</b>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* por que tão barato */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Por que tão barato</span>
            <h2 className="e-h2">Menos do que um único reel editado por freelancer.</h2>
          </div>
          <ul className="e-recursos e-recursos--duplo e-ilha-estreito">
            <li className="e-recurso e-revela">
              <span className="e-recurso__icone" aria-hidden>
                <Wallet size={22} />
              </span>
              <h3>Roda no seu Claude</h3>
              <p>Eu não tenho servidor, banco de dados nem custo por aluno. O preço paga as aulas, não a infraestrutura.</p>
            </li>
            <li className="e-recurso e-revela" style={atraso('0.08s')}>
              <span className="e-recurso__icone" aria-hidden>
                <Sparkles size={22} />
              </span>
              <h3>{lote1 ? 'É o primeiro lote' : 'Preço de lançamento'}</h3>
              <p>Eu quero muita gente usando, mostrando resultado e ajudando a melhorar os instaladores.</p>
            </li>
          </ul>
        </section>

        {/* garantia e o que você precisa */}
        <section className="e-secao">
          <div className="e-garantia e-revela">
            <div className="e-selo-giro" aria-hidden>
              <div className="e-selo-giro__anel" />
              <div className="e-selo-giro__texto">
                <svg viewBox="0 0 200 200">
                  <defs>
                    <path id="e-arco-garantia-ilha" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
                  </defs>
                  <text>
                    <textPath href="#e-arco-garantia-ilha">Garantia · reembolso integral · garantia · reembolso integral ·</textPath>
                  </text>
                </svg>
              </div>
              <div className="e-selo-giro__miolo">
                <ShieldCheck size={34} />
                <b>{CURSO_ILHA.garantiaDias} dias</b>
              </div>
            </div>
            <div>
              <span className="e-olho">Risco zero</span>
              <h2>{CURSO_ILHA.garantiaDias} dias. Entrou, instalou, não gostou: devolvo cada centavo.</h2>
              <p>
                É só pedir o reembolso <b>dentro de {CURSO_ILHA.garantiaDias} dias</b>, pelo WhatsApp. Sem perguntas.
              </p>
            </div>
          </div>
          <div className="e-cab e-revela e-ilha-req-cab">
            <span className="e-olho">O que você precisa</span>
            <h2 className="e-h2">Antes de comprar</h2>
          </div>
          <ul className="e-recursos">
            {REQUISITOS.map((r, i) => (
              <li key={r.titulo} className="e-recurso e-revela" style={atraso(`${i * 0.08}s`)}>
                <span className="e-recurso__icone" aria-hidden>
                  <r.icone size={22} />
                </span>
                <span className="e-ilha-tag">{r.tag}</span>
                <h3>{r.titulo}</h3>
                <p>{r.texto}</p>
              </li>
            ))}
          </ul>
        </section>

        {/* quem ensina */}
        <section className="e-secao">
          <div className="e-ilha-duo">
            <figure className="e-ilha-foto e-revela">
              <img src="/cursos-ilha/img/autor3.jpg" alt="Jefferson Lobo" width={864} height={1080} loading="lazy" />
            </figure>
            <div className="e-cab e-revela" style={atraso('0.1s')}>
              <span className="e-olho">Quem ensina</span>
              <h2 className="e-h2">Jefferson Lobo</h2>
              <p>
                Head Executivo de Marketing e IA. São 34 anos de comunicação estratégica e tecnologia. Criador do Método DEL, que desmonta a
                estrutura de linguagem dos conteúdos que funcionam e reescreve com a sua voz.
              </p>
              <div className="e-fichas e-pocket-hero__fichas">
                <span>CNI</span>
                <span>Unisenai com MIT</span>
                <span>Laguna e Gazeta do Povo</span>
              </div>
            </div>
          </div>
        </section>

        {/* perguntas */}
        <section className="e-secao">
          <div className="e-faq">
            <div className="e-cab e-revela">
              <span className="e-olho">Dúvidas</span>
              <h2 className="e-h2">Antes de entrar</h2>
              <p>
                Ficou alguma dúvida?{' '}
                <a href={ESCOLA.whatsapp} target="_blank" rel="noopener" className="e-link">
                  Fale comigo no WhatsApp
                </a>
                .
              </p>
              <p className="e-cab__extra">
                Já é aluno?{' '}
                <Link to="/cursos/entrar" className="e-link">
                  Entrar na área do aluno
                </Link>
              </p>
            </div>
            <div className="e-faq__lista">
              {faq.map((f, i) => (
                <details key={f.p} className="e-revela" style={atraso(`${i * 0.05}s`)}>
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

        {/* chamada final */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Daqui a um mês</span>
            <h2 className="e-h2">
              As mesmas ideias no caderno, <span className="e-ilha-destaque">ou no ar?</span>
            </h2>
            <p>
              A diferença custa <b>{preco}</b>.
            </p>
          </div>
          <div className="e-ilha-final e-revela">
            {lote1 && <Contador restante={restante} />}
            {botaoComprar('final', 'Quero as aulas e o pack agora', 'e-pocket-compra__botao')}
            <div className="e-fichas">
              <span>
                <Clapperboard size={13} aria-hidden /> Reels
              </span>
              <span>
                <Images size={13} aria-hidden /> Carrossel e stories
              </span>
              <span>
                <MessageCircleReply size={13} aria-hidden /> Direct automático
              </span>
            </div>
          </div>
        </section>
      </main>

      <EscolaRodape />

      {/* barra de compra no celular */}
      <div className={`e-barra-compra${barraVisivel ? ' is-visivel' : ''}`} aria-hidden={compraAberta || !barraVisivel}>
        <div>
          <b>{preco}</b>
          <span>{lote1 ? `lote 1 até ${fimCurto}` : 'lote 2'} · com bônus</span>
        </div>
        {botaoComprar('barra', 'Quero agora')}
      </div>

      {direto && (
        <CompraJanela
          aberta={compraAberta}
          onFechar={() => {
            setCompraAberta(false);
            setAviso(null);
          }}
          curso={CURSO_ILHA.slug}
          nomeCurso={CURSO_ILHA.nome}
          preco={lote.preco}
          linhaLote={lote1 ? `Lote 1 até ${fimCurto}` : 'Lote 2'}
          suporte={CURSO_ILHA.suporteWhatsApp}
          tema="escola"
          aviso={aviso}
          onAbrirPagamento={() => trackCTA('ilha_pagamento_aberto', 'ilha_vendas')}
        />
      )}
    </div>
  );
};

export default IlhaVendas;
