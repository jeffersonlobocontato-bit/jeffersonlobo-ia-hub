import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Store } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTrackCTA } from '@/hooks/useTrackCTA';

/*
 * Hero da home — Círculo Dourado (nov/2026).
 * WHY (manifesto) abre a página; HOW no subtítulo; WHAT nos dois caminhos.
 * A headline é fixa no código de propósito: é o posicionamento central da marca
 * e não deve ser sobrescrita pela tabela hero_content.
 */
const HeroSection = () => {
  const { trackCTA } = useTrackCTA();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center overflow-hidden bg-background pt-24 pb-16"
    >

      <div className="container mx-auto px-4 z-10 relative">
        <div className="mx-auto max-w-4xl animate-fade-in">

          {/* Texto */}
          <div className="text-center md:text-left space-y-7">
            <div className="roles-slash md:justify-start">
              <span className="sep">IA com prova de ganho</span>
            </div>

            <h1 className="display-title text-[2.25rem] sm:text-5xl md:text-[3.25rem] lg:text-6xl xl:text-[4.25rem] leading-[1.08] tracking-tight break-words hyphens-none">
              IA sem prova de ganho é <span className="highlight-yellow"><i>hora paga sem retorno</i></span> e aumento de custo.
            </h1>

            <p className="max-w-xl mx-auto md:mx-0 text-lg sm:text-xl text-foreground/90 font-medium">
              São 34 anos de comunicação estratégica e uma operação real de IA no dia a dia.
              Eu começo pela prova — e só depois escalo.
            </p>

            <div className="flex flex-col sm:flex-row flex-wrap gap-4 justify-center md:justify-start items-center pt-1">
              <Button
                size="lg"
                onClick={() => {
                  trackCTA('hero_cta_empresas', 'hero_section');
                  scrollToSection('palestras');
                }}
                className="text-base sm:text-lg px-8 py-6"
              >
                <Briefcase className="mr-2 w-5 h-5" />
                Para empresas
              </Button>
              <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-8 py-6">
                <Link to="/cursos" onClick={() => trackCTA('hero_cta_negocio', 'hero_section')}>
                  <Store className="mr-2 w-5 h-5" />
                  Para o seu negócio
                </Link>
              </Button>
            </div>

            <a
              href="/teste-ia"
              onClick={() => trackCTA('hero_cta_diagnostico', 'hero_section')}
              className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
            >
              Comece pela prova: faça o Teste de Maturidade em IA
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
