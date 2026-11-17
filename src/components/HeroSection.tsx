import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrackCTA } from '@/hooks/useTrackCTA';

/*
 * Hero da home — Círculo Dourado (nov/2026).
 * WHY (manifesto) abre a página; HOW no subtítulo; WHAT nos dois caminhos;
 * a faixa de prova fecha a dobra. Camadas com data-speed fazem o parallax
 * (motor em ScrollFX.tsx). A headline é fixa no código de propósito.
 */
const provas = [
  { n: '34', l: 'anos de comunicação estratégica' },
  { n: '4 mil+', l: 'colaboradores na empresa onde lidero marketing e IA' },
  { n: 'DEL', l: 'método próprio e livro publicado' },
];

const HeroSection = () => {
  const { trackCTA } = useTrackCTA();

  return (
    <section id="home" className="hero-fx relative min-h-[100svh] flex flex-col overflow-hidden bg-background pt-28 md:pt-32">
      {/* Camadas de fundo (parallax) */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden="true">
        <div data-speed="0.35" className="hero-orb hero-orb--a" />
        <div data-speed="-0.2" className="hero-orb hero-orb--b" />
        <div data-speed="0.6" className="hero-ghost">PROVA</div>
      </div>

      {/* Conteúdo — recua e esmaece conforme a página sobe */}
      <div className="hero-content container mx-auto px-4 z-10 relative flex-1 flex items-center">
        <div className="w-full max-w-6xl mx-auto space-y-8 md:space-y-10">
          <div className="roles-slash !justify-start hero-in" style={{ animationDelay: '0ms' }}>
            <span className="sep">IA com prova de ganho</span>
            <span className="sep hidden sm:inline">—</span>
            <span className="role hidden sm:inline">Jefferson Lobo</span>
          </div>

          <h1
            className="hero-in hero-title display-title tracking-tight break-words hyphens-none max-w-[16ch]"
            style={{ animationDelay: '80ms' }}
          >
            IA sem prova de ganho é <span className="highlight-yellow"><i>hora paga sem retorno</i></span> e aumento de custo.
          </h1>

          <div className="hero-in grid gap-8 md:grid-cols-[1fr_auto] md:items-end" style={{ animationDelay: '180ms' }}>
            <p className="max-w-xl text-lg sm:text-xl md:text-2xl text-foreground/85 font-medium leading-snug">
              Eu começo pela prova e só depois escalo. IA aplicada a negócios, com governança, ROI medido e a voz da sua marca.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button size="lg" asChild className="text-base sm:text-lg px-8 py-6">
                <Link to="/provadeganho" onClick={() => trackCTA('hero_cta_empresas', 'hero_section')}>
                  <Briefcase className="mr-2 w-5 h-5" />
                  Para empresas
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-8 py-6">
                <Link to="/cursos" onClick={() => trackCTA('hero_cta_negocio', 'hero_section')}>
                  <Store className="mr-2 w-5 h-5" />
                  Para o seu negócio
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Faixa de prova — fecha a dobra */}
      <div className="relative z-10 border-t border-white/10 mt-12">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto flex flex-col lg:flex-row lg:flex-wrap gap-x-12 gap-y-5 py-7 lg:items-center">
            {provas.map((p, i) => (
              <div key={p.n} className="hero-in flex items-center gap-3 shrink-0" style={{ animationDelay: `${300 + i * 90}ms` }}>
                <span className="display-title text-3xl md:text-4xl text-primary whitespace-nowrap">{p.n}</span>
                <span className="text-sm text-muted-foreground leading-tight max-w-[26ch]">{p.l}</span>
              </div>
            ))}
            <a
              href="/teste-ia"
              onClick={() => trackCTA('hero_cta_diagnostico', 'hero_section')}
              className="hero-in lg:ml-auto inline-flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-primary transition-colors"
              style={{ animationDelay: '600ms' }}
            >
              Comece pela prova: Teste de Maturidade em IA
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
