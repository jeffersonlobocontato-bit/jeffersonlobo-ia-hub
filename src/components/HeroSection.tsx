import { Button } from '@/components/ui/button';
import { ArrowRight, BrainCircuit } from 'lucide-react';
import heroBg from '@/assets/jefferson-portrait.png';
import { useHeroContent } from '@/hooks/useHeroContent';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const HeroSection = () => {
  const { data: heroData } = useHeroContent();
  const { trackCTA } = useTrackCTA();

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
  };

  const defaultData = {
    headline: "IA está redesenhando empresas, carreiras e profissões. Lidere essa transformação.",
    subtitle: "Diagnóstico, estratégia e implementação de Inteligência Artificial para empresas que querem resultado real — e profissionais que não aceitam ficar para trás.",
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
          width={1920}
          height={1080}
          fetchPriority="high"
          decoding="async"
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
          <h1 className="display-title text-[2.5rem] sm:text-5xl md:text-6xl lg:text-7xl xl:text-[6rem] tracking-tight break-words hyphens-auto">
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
                trackCTA('hero_contratar_palestra', 'hero_section');
                scrollToSection('palestras');
              }}
              className="text-base sm:text-lg px-8 py-6"
            >
              Contratar palestra
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
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
