import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { useHeroContent } from '@/hooks/useHeroContent';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const HeroSection = () => {
  const { data: heroData } = useHeroContent();
  const { trackCTA } = useTrackCTA();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const defaultData = {
    headline: "Jefferson Lobo ajuda empresas a implementar IA sem perder dinheiro",
    subtitle: "Descubra onde sua empresa está na jornada de IA em 5 minutos",
    cta_primary: "Fazer Diagnóstico Grátis",
    cta_secondary: "Ver meu método",
    stat1_number: "127",
    stat1_label: "Palestras realizadas",
    stat2_number: "45+",
    stat2_label: "Empresas transformadas",
    stat3_number: "97%",
    stat3_label: "Taxa de satisfação"
  };

  const displayData = heroData || defaultData;

  // Quebra a headline e aplica destaque amarelo "highlighter" na palavra-chave
  // Estratégia: pega as 2 últimas palavras antes de "sem perder dinheiro" ou destaca "IA"
  const renderHeadline = (text: string) => {
    const keywords = ['IA', 'inteligência artificial', 'Inteligência Artificial'];
    let result: React.ReactNode = text;
    for (const kw of keywords) {
      const idx = text.indexOf(kw);
      if (idx !== -1) {
        result = (
          <>
            {text.slice(0, idx)}
            <span className="highlight-yellow">{kw}</span>
            {text.slice(idx + kw.length)}
          </>
        );
        return result;
      }
    }
    return text;
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-24"
    >
      {/* Background Image cinematográfico */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Jefferson Lobo - Especialista em IA"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
        <div className="absolute inset-0 bg-brand-grid opacity-40" />
      </div>

      {/* Conteúdo centralizado estilo Rundown */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="mx-auto max-w-5xl text-center space-y-8 animate-fade-in">

          {/* Roles slash line (Matt Wolfe style) */}
          <div className="roles-slash">
            <span className="role">Palestrante</span>
            <span className="sep">/</span>
            <span className="role">Autor</span>
            <span className="sep">/</span>
            <span className="role">Estrategista de IA</span>
          </div>

          {/* Headline massivo com palavra em highlighter amarelo */}
          <h1 className="display-title text-5xl sm:text-6xl md:text-7xl lg:text-[6rem] xl:text-[7rem] tracking-tight">
            {renderHeadline(displayData.headline)}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto max-w-2xl text-lg sm:text-xl md:text-2xl text-foreground/90 font-medium">
            {displayData.subtitle}
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
            <Button size="lg" asChild className="text-base sm:text-lg px-8 py-6">
              <a href="/teste-ia" onClick={() => trackCTA('hero_primary_cta', 'hero_section')}>
                <BrainCircuit className="mr-2 w-5 h-5" />
                {displayData.cta_primary}
              </a>
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => {
                trackCTA('hero_secondary_cta', 'hero_section');
                scrollToSection('sobre');
              }}
              className="text-base sm:text-lg px-8 py-6"
            >
              {displayData.cta_secondary}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Barra de prova social estilo Rundown */}
          <div className="pt-12 mt-8 border-t border-primary/20">
            <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground mb-6">
              Já levou IA para times de empresas como
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-6 sm:gap-x-10 gap-y-3 text-sm sm:text-base font-black uppercase text-foreground/70">
              <span>Itaú</span>
              <span className="text-primary">•</span>
              <span>Sebrae</span>
              <span className="text-primary">•</span>
              <span>Globo</span>
              <span className="text-primary">•</span>
              <span>Vivo</span>
              <span className="text-primary">•</span>
              <span>Magalu</span>
              <span className="text-primary">•</span>
              <span>Unimed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 animate-bounce hidden md:block">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full p-1">
          <div className="w-1 h-3 bg-primary rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
