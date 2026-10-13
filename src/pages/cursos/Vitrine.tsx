import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, BookOpen, Check, ChevronDown, GraduationCap, ShieldCheck } from 'lucide-react';
import { SEO, SITE_URL } from '@/components/SEO';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { CURSO_ILHA, LIVRO_DEL, loteAtual } from '@/content/cursos/ilha';
import EscolaTopo from '@/components/cursos/escola/EscolaTopo';
import EscolaRodape from '@/components/cursos/escola/EscolaRodape';
import BotaoBrilho from '@/components/cursos/escola/BotaoBrilho';
import { useEscola } from '@/components/cursos/escola/useEscola';
import '@/styles/escola.css';

const reais = (n: number) => `R$ ${n}`;
const fimLote1Curto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(
  new Date(CURSO_ILHA.precos.fimLote1),
);

// Atraso em cascata para os itens de uma lista que surgem juntos.
const atraso = (i: number, passo = 0.08) => ({ ['--d' as string]: `${(i * passo).toFixed(2)}s` }) as React.CSSProperties;

const TELAS = [
  { img: '/cursos-ilha/img/ilha.jpg', nome: 'Galeria de modelos de reels' },
  { img: '/cursos-ilha/img/carrossel.jpg', nome: 'Criador de carrossel' },
  { img: '/cursos-ilha/img/stories.jpg', nome: 'Stories animados' },
  { img: '/cursos-ilha/img/direct.jpg', nome: 'Direct automático e funil' },
  { img: '/cursos-ilha/img/arsenal.jpg', nome: 'Arsenal de formatos' },
  { img: '/cursos-ilha/img/editor.jpg', nome: 'Linha do tempo do editor' },
];

const CHAMADAS: Record<string, string> = {
  'aula-1': 'A Ilha instalada no seu Claude e o seu primeiro reel editado.',
  'aula-2': 'De uma notícia ou de um tema seu ao carrossel pronto para postar.',
  'aula-3': 'A sequência do dia, animada, com a figurinha certa em cada story.',
  'aula-4': 'Quem comenta a palavra no post recebe o material no direct, na hora.',
  'aula-5': 'Formatos que já deram certo, desmontados e reescritos com a sua voz.',
  ebook: 'O livro do Método DEL, em PDF, dentro da área do aluno.',
};

const PULSOS = [
  { left: '8.333%', dur: '3s', delay: '0s' },
  { left: '41.666%', dur: '5s', delay: '1.5s' },
  { left: '75%', dur: '4s', delay: '0.5s' },
  { left: '91.666%', dur: '6s', delay: '2.6s' },
];

const Vitrine = () => {
  const raiz = useRef<HTMLDivElement>(null);
  useEscola(raiz);
  const { trackCTA } = useTrackCTA();
  const lote = loteAtual(CURSO_ILHA);
  const diferenca = lote.preco - LIVRO_DEL.impresso.preco;
  const linhaLote = lote.lote === 1 ? `Lote 1 até ${fimLote1Curto}` : 'Pagamento único';

  const faq = [
    {
      p: 'Como recebo o acesso ao curso?',
      r: 'Assim que a Hotmart aprova o pagamento, você recebe um e-mail com o link da área do aluno, aqui no site. Você entra com o mesmo e-mail da compra, sem senha para decorar.',
    },
    { p: 'Preciso saber programar?', r: 'Não. Você anexa o instalador no seu Claude e escreve uma frase. Cada aula mostra o passo a passo na tela.' },
    {
      p: 'Preciso pagar mais alguma coisa?',
      r: 'Um plano pago do Claude (Pro ou superior). O direct automático usa a Zernio, grátis para até 2 contas. Avatar (HeyGen) e análise do Instagram (Windsor) são opcionais.',
    },
    { p: 'O e-book vem junto com o curso?', r: `Vem. ${LIVRO_DEL.curto} fica em PDF dentro da área do aluno, no módulo Bônus.` },
    {
      p: 'Posso comprar só o livro?',
      r: `Pode: o impresso sai por ${reais(LIVRO_DEL.impresso.preco)} + frete e o e-book por ${reais(LIVRO_DEL.ebook.preco)}. O curso já inclui o e-book.`,
    },
    { p: 'E se eu não gostar?', r: `Você tem ${CURSO_ILHA.garantiaDias} dias de garantia pela Hotmart, com reembolso integral.` },
    { p: 'Tem suporte?', r: 'Tem. O Tutor IA responde dentro de cada aula, e o suporte humano é pelo WhatsApp.' },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Cursos e livro de Jefferson Lobo',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        item: {
          '@type': 'Course',
          name: CURSO_ILHA.nome,
          description: CURSO_ILHA.descricao,
          url: `${SITE_URL}/cursos/ilha`,
          provider: { '@type': 'Person', name: 'Jefferson Lobo', url: SITE_URL },
          offers: { '@type': 'Offer', price: String(lote.preco), priceCurrency: 'BRL', category: 'Paid' },
        },
      },
      { '@type': 'ListItem', position: 2, item: { '@type': 'Book', name: LIVRO_DEL.nome, url: `${SITE_URL}${LIVRO_DEL.pagina}` } },
    ],
  };
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.p, acceptedAnswer: { '@type': 'Answer', text: f.r } })),
  };

  return (
    <div className="escola" ref={raiz}>
      <SEO
        title="Cursos e livro | Jefferson Lobo"
        description="Ilha de Edição completa: 5 aulas para fazer seu conteúdo sozinho no Claude, com Tutor IA e o e-book O código invisível de bônus. E o livro do Método DEL, avulso."
        path="/cursos"
        ogImage={`${SITE_URL}/cursos-ilha/produto-vitrine.jpg`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>

      <EscolaTopo onCta={() => trackCTA('vitrine_topo', 'vitrine')} />

      <main>
        {/* Hero */}
        <section className="e-hero">
          <div className="e-aura" aria-hidden>
            <div className="e-aura__grade" />
            {PULSOS.map((p) => (
              <span key={p.left} className="e-pulso-v" style={{ left: p.left, animationDuration: p.dur, animationDelay: p.delay }} />
            ))}
            <span className="e-pulso-h" style={{ top: '34%' }} />
            <div className="e-aura__arco" />
          </div>

          <span className="e-selo e-entra" style={atraso(0)}>
            <span className="e-selo__ponto" aria-hidden />
            Cursos e livro · Jefferson Lobo
          </span>
          <h1 className="e-h1 e-entra" style={{ ['--d' as string]: '0.2s' } as React.CSSProperties}>
            Faça a IA trabalhar <span className="e-grad">com a sua voz.</span>
          </h1>
          <p className="e-sub e-entra" style={{ ['--d' as string]: '0.35s' } as React.CSSProperties}>
            O que eu uso no meu dia a dia, em formato de aula e de livro. Comece pelo curso: o livro já vem junto.
          </p>
          <div className="e-hero__acoes e-entra" style={{ ['--d' as string]: '0.5s' } as React.CSSProperties}>
            <BotaoBrilho to="/cursos/ilha" onClick={() => trackCTA('vitrine_hero', 'vitrine')}>
              Conhecer o curso
            </BotaoBrilho>
            <div className="e-fichas" aria-label="O que vem no curso">
              <span>5 aulas</span>
              <span>Tutor IA</span>
              <span>E-book bônus</span>
            </div>
          </div>

          <Link
            to="/cursos/ilha"
            className="e-hero__palco e-entra"
            style={{ ['--d' as string]: '0.65s' } as React.CSSProperties}
            onClick={() => trackCTA('vitrine_curso_imagem', 'vitrine')}
            aria-label={`${CURSO_ILHA.nome}: ver o curso`}
          >
            <img src="/cursos-ilha/produto-vitrine.jpg" alt={`${CURSO_ILHA.nome}, curso de Jefferson Lobo`} width={1600} height={1000} />
            <span className="e-hero__chip">
              {lote.lote === 1 ? (
                <>
                  Lote 1 · <b>{reais(lote.preco)}</b> até {fimLote1Curto}
                </>
              ) : (
                <>
                  <b>{reais(lote.preco)}</b> · pagamento único
                </>
              )}
            </span>
          </Link>
          <div className="e-hero__base" />
        </section>

        {/* Catálogo */}
        <section className="e-secao" id="catalogo">
          <div className="e-cab e-revela">
            <span className="e-olho">Catálogo</span>
            <h2 className="e-h2">Comece pelo curso. O livro já vem junto.</h2>
            <p>Um curso prático para montar o seu estúdio de conteúdo no Claude e o livro do método por trás dele.</p>
          </div>

          <div className="e-cards">
            <article className="e-card e-revela" style={atraso(1)}>
              <span className="e-card__feixe" aria-hidden />
              <span className="e-card__brilho" aria-hidden />
              <span className="e-card__pontos" aria-hidden />
              <Link to="/cursos/ilha" className="e-card__thumb" tabIndex={-1} aria-hidden onClick={() => trackCTA('vitrine_curso_imagem', 'vitrine')}>
                <img src="/cursos-ilha/produto-vitrine.jpg" alt="" width={1600} height={1000} loading="lazy" />
              </Link>
              <span className="e-olho">Curso · {lote.lote === 1 ? 'Lote 1' : 'Lote 2'}</span>
              <h3 className="e-card__titulo">
                <Link to="/cursos/ilha">
                  {CURSO_ILHA.nome}: {CURSO_ILHA.chamada.charAt(0).toLowerCase() + CURSO_ILHA.chamada.slice(1)}
                </Link>
              </h3>
              <ul className="e-lista">
                {[
                  '5 aulas com as telas reais: reels, carrossel, stories, direct automático e formatos',
                  'Instalador da Ilha para o seu Claude e 5 manuais em PDF',
                  'Tutor IA que tira suas dúvidas dentro de cada aula',
                  `Bônus: o e-book ${LIVRO_DEL.curto} (${reais(LIVRO_DEL.ebook.preco)})`,
                ].map((t) => (
                  <li key={t}>
                    <span className="e-check" aria-hidden>
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <div className="e-card__rodape">
                <div className="e-preco">
                  <small>{linhaLote}</small>
                  <b>{reais(lote.preco)}</b>
                  <span>curso + e-book · até 12x</span>
                </div>
                <Link to="/cursos/ilha" className="e-btn e-btn--cheio" onClick={() => trackCTA('vitrine_curso', 'vitrine')}>
                  Conhecer o curso <ArrowRight size={16} aria-hidden />
                </Link>
              </div>
            </article>

            <article className="e-card e-card--laranja e-revela" style={atraso(2)}>
              <span className="e-card__feixe" aria-hidden />
              <span className="e-card__brilho" aria-hidden />
              <span className="e-card__pontos" aria-hidden />
              <Link to={LIVRO_DEL.pagina} className="e-card__thumb e-card__thumb--livro" tabIndex={-1} aria-hidden>
                <img src={LIVRO_DEL.capa} alt="" loading="lazy" />
              </Link>
              <span className="e-olho">Livro avulso</span>
              <h3 className="e-card__titulo">
                <Link to={LIVRO_DEL.pagina}>{LIVRO_DEL.nome}</Link>
              </h3>
              <p className="e-card__texto">O Método DEL inteiro: como fazer agentes de IA escreverem com a identidade de uma marca ou de um autor.</p>
              <div className="e-precos-livro">
                <div>
                  <span>Impresso</span>
                  <b>
                    {reais(LIVRO_DEL.impresso.preco)} <small>+ frete</small>
                  </b>
                </div>
                <div>
                  <span>E-book</span>
                  <b>{reais(LIVRO_DEL.ebook.preco)}</b>
                </div>
              </div>
              <div className="e-botoes">
                <a href={LIVRO_DEL.impresso.url} className="e-btn e-btn--fantasma" onClick={() => trackCTA('vitrine_livro_impresso', 'vitrine')}>
                  Comprar o impresso
                </a>
                <Link to={LIVRO_DEL.pagina} className="e-btn e-btn--link" onClick={() => trackCTA('vitrine_livro_pagina', 'vitrine')}>
                  Ver o livro <ArrowRight size={15} aria-hidden />
                </Link>
              </div>
            </article>
          </div>
        </section>

        {/* Telas reais */}
        <section className="e-secao" style={{ paddingBottom: 0 }}>
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Por dentro da Ilha</span>
            <h2 className="e-h2">As telas reais do estúdio que você instala.</h2>
            <p>Reels, carrossel, stories, direct e formatos, rodando no seu Claude, com a sua paleta e a sua voz.</p>
          </div>
        </section>
        <div className="e-faixa e-revela" style={{ paddingBottom: 'clamp(64px, 8vw, 96px)' }}>
          <div className="e-faixa__trilho">
            {[...TELAS, ...TELAS].map((t, i) => (
              <figure className="e-tela" key={`${t.img}-${i}`} aria-hidden={i >= TELAS.length || undefined}>
                <div className="e-tela__img">
                  <img src={t.img} alt={i < TELAS.length ? t.nome : ''} loading="lazy" />
                </div>
                <figcaption>{t.nome}</figcaption>
              </figure>
            ))}
          </div>
        </div>

        {/* Aulas */}
        <section className="e-secao">
          <div className="e-cab e-revela">
            <span className="e-olho">O curso</span>
            <h2 className="e-h2">Cinco aulas curtas e um livro de bônus.</h2>
            <p>Cada aula mostra a tela de verdade, passo a passo, com manual em PDF e o Tutor IA para tirar dúvidas na hora.</p>
          </div>
          <ul className="e-aulas">
            {CURSO_ILHA.aulas.map((a, i) => (
              <li key={a.slug} className="e-revela" style={atraso(i % 2)}>
                <Link to="/cursos/ilha" className="e-aula" onClick={() => trackCTA(`vitrine_aula_${a.slug}`, 'vitrine')}>
                  <span className="e-aula__thumb">{a.capa && <img src={a.capa} alt="" loading="lazy" />}</span>
                  <span className="e-aula__corpo">
                    <span className="e-aula__olho">
                      {a.numero ? `Aula ${a.numero}` : 'Bônus'}
                      {a.duracao ? ` · ${a.duracao}` : ' · PDF'}
                    </span>
                    <span className="e-aula__titulo">{a.titulo}</span>
                    <span className="e-aula__texto">{CHAMADAS[a.slug]}</span>
                  </span>
                  <ArrowRight size={18} className="e-aula__seta" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        </section>

        {/* Comparação */}
        <section className="e-secao">
          <div className="e-cab e-cab--centro e-revela">
            <span className="e-olho">Faça a conta</span>
            <h2 className="e-h2">Escolha como começar.</h2>
            <p>O livro sozinho, ou o curso completo com o livro em e-book.</p>
          </div>
          <div className="e-planos">
            <article className="e-plano e-plano--destaque e-revela" style={atraso(1)}>
              <span className="e-plano__selo">Mais vantajoso</span>
              <div className="e-plano__topo">
                <h3>Curso + e-book</h3>
                <span className="e-plano__icone" aria-hidden>
                  <GraduationCap size={18} />
                </span>
              </div>
              <div className="e-plano__valor">
                <b>{reais(lote.preco)}</b>
                <small>pagamento único</small>
              </div>
              <p className="e-plano__nota">{lote.lote === 1 ? `Lote 1 até ${fimLote1Curto} · ` : ''}até 12x no cartão</p>
              <ul className="e-lista">
                {[
                  <>
                    <b>5 aulas</b> com as telas reais
                  </>,
                  <>Instalador da Ilha e 5 manuais em PDF</>,
                  <>
                    <b>Tutor IA</b> dentro de cada aula
                  </>,
                  <>
                    E-book <b>{LIVRO_DEL.curto}</b> incluso
                  </>,
                  <>Área do aluno com o seu progresso</>,
                ].map((t, i) => (
                  <li key={i}>
                    <span className="e-check" aria-hidden>
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <Link to="/cursos/ilha" className="e-btn e-btn--principal" onClick={() => trackCTA('vitrine_comparacao', 'vitrine')}>
                Quero o curso
              </Link>
              <p className="e-plano__garantia">Garantia incondicional de {CURSO_ILHA.garantiaDias} dias</p>
            </article>

            <article className="e-plano e-revela" style={atraso(2)}>
              <div className="e-plano__topo">
                <h3>Só o livro impresso</h3>
                <span className="e-plano__icone" aria-hidden>
                  <BookOpen size={18} />
                </span>
              </div>
              <div className="e-plano__valor">
                <b>{reais(LIVRO_DEL.impresso.preco)}</b>
                <small>+ frete</small>
              </div>
              <p className="e-plano__nota">Também em e-book por {reais(LIVRO_DEL.ebook.preco)}</p>
              <ul className="e-lista">
                {['O Método DEL completo', 'Edição impressa, entregue em casa', 'Oficina DEL com modelos para montar os seus arquivos'].map((t) => (
                  <li key={t}>
                    <span className="e-check" aria-hidden>
                      <Check size={12} strokeWidth={3} />
                    </span>
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
              <a href={LIVRO_DEL.impresso.url} className="e-btn e-btn--secundario" onClick={() => trackCTA('vitrine_comparacao_livro', 'vitrine')}>
                Comprar o impresso <ArrowRight size={16} aria-hidden />
              </a>
              <p className="e-plano__garantia">Pagamento e entrega pela Hotmart</p>
            </article>
          </div>
          <p className="e-conta e-revela">
            {diferenca > 0 ? (
              <>
                Por <b>{reais(diferenca)} a mais</b> que o livro impresso, você leva as 5 aulas, o instalador, os manuais, o Tutor IA e o livro em
                e-book, sem frete.
              </>
            ) : (
              <>O curso completo com o e-book sai mais barato que o livro impresso sozinho.</>
            )}{' '}
            <Link to="/cursos/ilha">Ver o curso</Link>
          </p>
        </section>

        {/* Garantia */}
        <section className="e-secao">
          <div className="e-garantia e-revela">
            <div className="e-selo-giro" aria-hidden>
              <div className="e-selo-giro__anel" />
              <div className="e-selo-giro__texto">
                <svg viewBox="0 0 200 200">
                  <defs>
                    <path id="e-arco-garantia" d="M100,100 m-80,0 a80,80 0 1,1 160,0 a80,80 0 1,1 -160,0" />
                  </defs>
                  <text>
                    <textPath href="#e-arco-garantia">Garantia incondicional · Garantia incondicional ·</textPath>
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
              <h2>{CURSO_ILHA.garantiaDias} dias de garantia incondicional</h2>
              <p>
                Você tem <b>{CURSO_ILHA.garantiaDias} dias depois da compra</b> para assistir às aulas, instalar a Ilha e testar. Se não for para você,
                é só pedir o reembolso na Hotmart. Sem burocracia.
              </p>
              <div className="e-passos">
                <div>
                  <small>01</small>
                  <span>Compre e receba o acesso por e-mail assim que o pagamento for aprovado</span>
                </div>
                <div>
                  <small>02</small>
                  <span>Assista, instale e use por {CURSO_ILHA.garantiaDias} dias</span>
                </div>
                <div>
                  <small>03</small>
                  <span>Não gostou? Peça o reembolso pela Hotmart e receba 100% de volta</span>
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
                Ainda ficou alguma dúvida?{' '}
                <a href={CURSO_ILHA.suporteWhatsApp} target="_blank" rel="noopener" style={{ color: 'var(--e-acento-claro)', textUnderlineOffset: 4 }}>
                  Fale comigo no WhatsApp
                </a>
                .
              </p>
              <p style={{ marginTop: 10, fontSize: 15 }}>
                Já é aluno?{' '}
                <Link to="/cursos/entrar" style={{ color: 'var(--e-acento-claro)', textUnderlineOffset: 4 }}>
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
