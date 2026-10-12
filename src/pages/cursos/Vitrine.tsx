import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { SEO, SITE_URL } from '@/components/SEO';
import { Button } from '@/components/ui/button';
import { useTrackCTA } from '@/hooks/useTrackCTA';
import { CURSO_ILHA, LIVRO_DEL, loteAtual } from '@/content/cursos/ilha';
import { Check } from 'lucide-react';

const mono = { fontFamily: "'IBM Plex Mono', monospace" };
const reais = (n: number) => `R$ ${n}`;
const fimLote1Curto = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(CURSO_ILHA.precos.fimLote1));

const Vitrine = () => {
  const { trackCTA } = useTrackCTA();
  const lote = loteAtual(CURSO_ILHA);
  const diferenca = lote.preco - LIVRO_DEL.impresso.preco;

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
      {
        '@type': 'ListItem',
        position: 2,
        item: { '@type': 'Book', name: LIVRO_DEL.nome, url: `${SITE_URL}${LIVRO_DEL.pagina}` },
      },
    ],
  };

  return (
    <div className="dark min-h-screen flex flex-col bg-background text-foreground">
      <SEO
        title="Cursos e livro | Jefferson Lobo"
        description="Ilha de Edição completa: 5 aulas para fazer seu conteúdo sozinho no Claude, com Tutor IA e o e-book O código invisível de bônus. E o livro do Método DEL, avulso."
        path="/cursos"
        ogImage={`${SITE_URL}/cursos-ilha/produto-vitrine.jpg`}
      />
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      </Helmet>
      <Header />

      <main className="flex-1">
        <section className="pt-32 pb-10 bg-brand-grid">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center space-y-5">
              <span className="section-kicker">Cursos e livro</span>
              <h1 className="display-title text-4xl sm:text-5xl md:text-6xl">
                Faça a IA trabalhar <span className="text-primary">com a sua voz.</span>
              </h1>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                O que eu uso no meu dia a dia, em formato de aula e de livro. Comece pelo curso: o livro já vem junto.
              </p>
            </div>
          </div>
        </section>

        <section className="pb-12">
          <div className="container mx-auto px-4">
            <div className="grid gap-6 md:grid-cols-[1.25fr_1fr] max-w-5xl mx-auto">
              {/* Curso */}
              <article className="rounded-2xl border border-primary/40 bg-card/60 overflow-hidden flex flex-col min-w-0">
                <Link to="/cursos/ilha" onClick={() => trackCTA('vitrine_curso_imagem', 'vitrine')}>
                  <img src="/cursos-ilha/produto-vitrine.jpg" alt="Ilha de Edição completa" width={1600} height={1000} className="w-full aspect-[16/10] object-cover" />
                </Link>
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em]" style={mono}>
                    <span className="rounded-full border border-primary/50 px-3 py-1 text-primary">Curso</span>
                    <span className="rounded-full border border-foreground/20 px-3 py-1 text-muted-foreground">Lote {lote.lote}</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">
                    {CURSO_ILHA.nome}: {CURSO_ILHA.chamada.charAt(0).toLowerCase() + CURSO_ILHA.chamada.slice(1)}
                  </h2>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {[
                      '5 aulas com as telas reais: reels, carrossel, stories, direct automático e formatos',
                      'Instalador da Ilha para o seu Claude e 5 manuais em PDF',
                      'Tutor IA que tira suas dúvidas dentro de cada aula',
                      `Bônus: o e-book ${LIVRO_DEL.curto} (${reais(LIVRO_DEL.ebook.preco)})`,
                    ].map((t) => (
                      <li key={t} className="flex gap-2">
                        <Check className="h-4 w-4 mt-0.5 shrink-0 text-primary" aria-hidden />
                        <span>{t}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex flex-wrap items-end justify-between gap-4 pt-2">
                    <div>
                      <div className="text-xs text-muted-foreground" style={mono}>
                        {lote.lote === 1 ? `LOTE 1 ATÉ ${fimLote1Curto}` : 'PAGAMENTO ÚNICO'}
                      </div>
                      <div className="text-4xl font-bold tabular-nums">{reais(lote.preco)}</div>
                      <div className="text-xs text-muted-foreground">curso + e-book · até 12x</div>
                    </div>
                    <Button size="lg" asChild onClick={() => trackCTA('vitrine_curso', 'vitrine')}>
                      <Link to="/cursos/ilha">Conhecer o curso</Link>
                    </Button>
                  </div>
                </div>
              </article>

              {/* Livro */}
              <article className="rounded-2xl border border-foreground/15 bg-card/40 overflow-hidden flex flex-col min-w-0">
                <div className="flex items-center justify-center bg-gradient-to-b from-primary/10 to-transparent py-8">
                  <img src={LIVRO_DEL.capa} alt={`Capa do livro ${LIVRO_DEL.curto}`} className="h-64 w-auto drop-shadow-2xl" loading="lazy" />
                </div>
                <div className="p-6 flex flex-col gap-4 flex-1">
                  <div className="flex flex-wrap gap-2 text-[11px] uppercase tracking-[0.18em]" style={mono}>
                    <span className="rounded-full border border-foreground/30 px-3 py-1">Livro avulso</span>
                  </div>
                  <h2 className="text-2xl font-bold leading-tight">{LIVRO_DEL.nome}</h2>
                  <p className="text-sm text-muted-foreground">O Método DEL inteiro: como fazer agentes de IA escreverem com a identidade de uma marca ou de um autor.</p>
                  <div className="mt-auto grid gap-3 pt-2">
                    <div className="flex items-baseline justify-between gap-3 border-t border-foreground/10 pt-3">
                      <span className="text-sm">Impresso</span>
                      <span className="text-2xl font-bold tabular-nums">
                        {reais(LIVRO_DEL.impresso.preco)} <span className="text-xs font-normal text-muted-foreground">+ frete</span>
                      </span>
                    </div>
                    <div className="flex items-baseline justify-between gap-3">
                      <span className="text-sm">E-book</span>
                      <span className="text-lg font-semibold tabular-nums">{reais(LIVRO_DEL.ebook.preco)}</span>
                    </div>
                    <div className="flex flex-wrap gap-2 pt-1">
                      <Button variant="outline" asChild className="border-foreground/25" onClick={() => trackCTA('vitrine_livro_impresso', 'vitrine')}>
                        <a href={LIVRO_DEL.impresso.url}>Comprar o impresso</a>
                      </Button>
                      <Button variant="ghost" asChild onClick={() => trackCTA('vitrine_livro_pagina', 'vitrine')}>
                        <Link to={LIVRO_DEL.pagina}>Ver o livro</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* Comparação */}
        <section className="pb-20">
          <div className="container mx-auto px-4">
            <div className="max-w-5xl mx-auto rounded-2xl border border-primary/30 bg-primary/5 p-6 sm:p-8 grid gap-6 md:grid-cols-[1fr_auto_1fr] items-center">
              <div className="text-center md:text-left">
                <div className="text-xs uppercase tracking-[0.2em] text-muted-foreground" style={mono}>
                  Só o livro impresso
                </div>
                <div className="text-3xl font-bold tabular-nums mt-1">
                  {reais(LIVRO_DEL.impresso.preco)} <span className="text-base font-normal text-muted-foreground">+ frete</span>
                </div>
              </div>
              <div className="text-center text-muted-foreground text-sm" style={mono}>
                ou
              </div>
              <div className="text-center md:text-right">
                <div className="text-xs uppercase tracking-[0.2em] text-primary" style={mono}>
                  Curso completo + e-book
                </div>
                <div className="text-3xl font-bold tabular-nums mt-1">{reais(lote.preco)}</div>
              </div>
              <p className="md:col-span-3 text-center text-base">
                {diferenca > 0 ? (
                  <>
                    Por <b>{reais(diferenca)} a mais</b> que o livro impresso, você leva as 5 aulas, o instalador, os manuais, o Tutor IA e o
                    livro em e-book, sem frete.
                  </>
                ) : (
                  <>O curso completo com o e-book sai mais barato que o livro impresso sozinho.</>
                )}{' '}
                <Link to="/cursos/ilha" className="text-primary underline underline-offset-4" onClick={() => trackCTA('vitrine_comparacao', 'vitrine')}>
                  Ver o curso
                </Link>
              </p>
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              Já é aluno?{' '}
              <Link to="/cursos/entrar" className="text-primary underline underline-offset-4">
                Entrar na área do aluno
              </Link>
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Vitrine;
