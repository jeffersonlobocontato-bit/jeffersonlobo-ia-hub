import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Check, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

type Catalogo = typeof import('@/content/cursos/ilha');

const selo = 'font-mono text-xs uppercase tracking-[0.6px] text-primary';
const linkCard = 'flex h-full min-h-12 flex-col gap-3 rounded-card p-6 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background';

const AcademiaSection = () => {
  const section = useRef<HTMLElement>(null);
  const [catalogo, setCatalogo] = useState<Catalogo | null>(null);
  const [agora, setAgora] = useState(() => Date.now());

  // O catálogo inclui os manuais das aulas: só baixá-lo perto desta dobra.
  useEffect(() => {
    const element = section.current;
    if (!element) return;
    let cancelado = false;
    const carregar = () => {
      import('@/content/cursos/ilha').then((dados) => {
        if (!cancelado) {
          setAgora(Date.now());
          setCatalogo(dados);
        }
      }).catch(() => undefined);
    };
    if (!('IntersectionObserver' in window)) {
      carregar();
      return () => { cancelado = true; };
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry?.isIntersecting) {
        observer.disconnect();
        carregar();
      }
    }, { rootMargin: '600px' });
    observer.observe(element);
    return () => { cancelado = true; observer.disconnect(); };
  }, []);

  useEffect(() => {
    if (!catalogo) return;
    const fim = new Date(catalogo.CURSO_ILHA.precos.fimLote1).getTime();
    const atualizar = () => setAgora(Date.now());
    // Renovar ao voltar à aba e na virada exata, sem contador contínuo.
    document.addEventListener('visibilitychange', atualizar);
    const restante = fim - Date.now() + 1;
    const timer = restante > 0
      ? window.setTimeout(atualizar, Math.min(restante, 2_147_483_647))
      : undefined;
    return () => {
      document.removeEventListener('visibilitychange', atualizar);
      if (timer !== undefined) window.clearTimeout(timer);
    };
  }, [catalogo, agora]);

  const curso = catalogo?.CURSO_ILHA;
  const lote = curso ? catalogo?.loteAtual(curso, agora) : undefined;
  const fimCurto = curso
    ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'America/Sao_Paulo' }).format(new Date(curso.precos.fimLote1))
    : '';
  const preco = lote
    ? new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(lote.preco)
    : '…';

  return (
    <section ref={section} id="academia" aria-labelledby="academia-titulo" className="relative isolate overflow-hidden bg-background">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/0.08),transparent_55%)]" />
      <div className="mx-auto max-w-[1200px] px-5 py-16 md:px-10 md:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-12">
          <div className="min-w-0">
            <p className={`${selo} !text-primary`}>Academia jeffersonlobo.tech</p>
            <h2 id="academia-titulo" className="mt-5 font-sans !text-4xl !font-medium !tracking-[-0.03em] leading-[1.15] md:!text-5xl">
              Faça a IA trabalhar com a <span className="text-primary">sua voz.</span>
            </h2>
            <p className="mt-6 text-[17px] leading-relaxed text-muted-foreground">
              Cursos práticos e o livro do Método DEL para quem cria conteúdo e quer usar a IA no dia a dia, com método e sem promessa fácil.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:items-start">
              <Button asChild className="min-h-12 w-full px-6 sm:w-auto">
                <Link to="/cursos">Ver os cursos <ArrowRight aria-hidden="true" /></Link>
              </Button>
              <Button asChild variant="outline" className="min-h-12 w-full whitespace-normal px-5 text-center sm:w-auto">
                <Link to="/cursos#ebook-gratis">Começar por um material grátis</Link>
              </Button>
            </div>
            <ul className="mt-7 flex flex-wrap gap-x-5 gap-y-3 font-mono text-xs uppercase tracking-[0.6px] text-muted-foreground">
              {['Aulas curtas', 'Tutor IA', 'Garantia de 7 dias'].map((texto) => <li key={texto}>{texto}</li>)}
            </ul>
          </div>

          <Card className="min-w-0 p-6 md:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className={selo}>Curso em destaque</span>
              <span className="rounded-button border border-border px-3 py-2 font-mono text-xs text-muted-foreground">
                {lote ? (lote.lote === 1 ? `Lote 1 até ${fimCurto}` : 'Lote 2') : '…'}
              </span>
            </div>
            <h3 className="mt-6 font-sans !text-[28px] !font-medium leading-tight">Ilha de Edição completa</h3>
            <p className="mt-3 text-base leading-relaxed text-muted-foreground">Agora você faz seu conteúdo sozinho no Claude.</p>
            <ul className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
              {[
                '5 aulas com as telas reais',
                'Instalador da Ilha e 5 manuais em PDF',
                'Tutor IA dentro de cada aula',
                'De bônus: o e-book O código invisível e os 3 pockets',
              ].map((texto) => (
                <li key={texto} className="flex items-start gap-3">
                  <Check aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{texto}</span>
                </li>
              ))}
            </ul>
            <div className="my-6 border-t border-border" />
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-2" aria-live="polite">
              <span className="min-h-[48px] font-sans text-[40px] font-medium leading-tight text-foreground">{preco}</span>
              <span className="font-mono text-xs text-muted-foreground">pagamento único · até 12x</span>
            </div>
            <Button asChild className="mt-6 min-h-12 w-full px-6">
              <Link to="/cursos/ilha">Ver o curso <ArrowRight aria-hidden="true" /></Link>
            </Button>
          </Card>
        </div>

        <div className="mt-10 grid gap-5 md:mt-12 md:grid-cols-2 xl:grid-cols-[1fr_1fr_2fr]">
          <Card className="min-w-0 transition-colors hover:border-button-border">
            <Link to="/cursos#ebook-gratis" className={linkCard}>
              <span className={selo}>Grátis</span>
              <h3 className="!text-xl leading-snug">4 materiais para começar</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">E-book com 50 skills do Claude, foto de produto, 30 dias de conteúdo e atendimento no WhatsApp.</p>
              <ArrowRight aria-hidden="true" className="mt-auto h-5 w-5 text-primary" />
            </Link>
          </Card>
          <Card className="min-w-0 transition-colors hover:border-button-border">
            <Link to="/cursos#pockets" className={linkCard}>
              <span className={selo}>Pockets · R$ 9,90 cada</span>
              <h3 className="!text-xl leading-snug">Tutoriais de bolso</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">Um problema, um PDF, uma tarde, com as telas do Claude em português.</p>
              <ArrowRight aria-hidden="true" className="mt-auto h-5 w-5 text-primary" />
            </Link>
          </Card>
          <Card className="min-w-0 transition-colors hover:border-button-border md:col-span-2 xl:col-span-1">
            <Link to="/cursos" aria-label="Ouvir o podcast da Academia" className={`${linkCard} sm:flex-row sm:items-center sm:gap-5`}>
              <div className="relative aspect-video w-full shrink-0 overflow-hidden rounded-input sm:w-2/5">
                <img src="/academia/podcast-academia.jpg" alt="" loading="lazy" width="1280" height="720" className="h-full w-full object-cover" />
                <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
                  <span className="flex h-12 w-12 items-center justify-center rounded-button border border-button-border bg-button-background text-primary shadow-button">
                    <Play className="h-5 w-5" fill="currentColor" />
                  </span>
                </span>
                <span className="absolute bottom-2 right-2 rounded-button border border-border bg-button-background px-2 py-1 font-mono text-xs text-foreground">1:40</span>
              </div>
              <div className="flex min-w-0 flex-col gap-3">
                <span className={selo}>Vídeo de apresentação</span>
                <h3 className="!text-xl leading-snug">Conheça a Academia em menos de 2 minutos</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">Aperte o play e entenda como são os cursos antes de escolher.</p>
                <span className="flex min-h-12 items-center gap-2 text-sm text-primary">Ouvir o podcast <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></span>
              </div>
            </Link>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default AcademiaSection;