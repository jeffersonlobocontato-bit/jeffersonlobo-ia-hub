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
    headline: "O marketing entrou na era da orquestração de fluxos com IA. Eu ensino lideranças a liderar essa virada.",
    subtitle: "Palestras, imersões e consultoria para empresas que querem sair do prompt avulso e construir agentes de IA com identidade própria — DNA autoral, não commodity.",
    cta_primary: "Fazer Diagnóstico Grátis",
    cta_secondary: "Contratar palestra",
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
      className="relative min-h-screen flex items-center justify-center md:justify-start overflow-hidden bg-background pt-24"
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
          className="w-full h-full object-cover object-[50%_18%] md:object-[80%_22%] lg:object-[75%_20%] xl:object-[70%_20%]"
        />

        <div className="absolute inset-0 bg-gradient-to-b from-background/85 via-background/75 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/90 via-background/70 to-background/30 md:from-background/95 md:via-background/70 md:to-background/40 lg:via-background/75 lg:to-background/55" />
        <div className="absolute inset-0 bg-brand-grid opacity-40" />
      </div>

      {/* Conteúdo: centralizado no mobile, alinhado à esquerda no desktop */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="mx-auto md:mx-0 md:mr-auto max-w-5xl md:max-w-xl lg:max-w-2xl text-center md:text-left space-y-6 md:space-y-8 animate-fade-in">

          {/* Roles slash line (Matt Wolfe style) */}
          <div className="roles-slash justify-center md:justify-start">
            <span className="role">Palestrante</span>
            <span className="sep">/</span>
            <span className="role">Autor</span>
            <span className="sep">/</span>
            <span className="role">Estrategista de IA</span>
          </div>

          {/* Headline massivo com palavra em highlighter amarelo */}
          <h1 className="display-title text-[2.5rem] sm:text-5xl md:text-5xl lg:text-6xl xl:text-[4.5rem] tracking-tight break-words hyphens-auto">
            {renderHeadline(displayData.headline)}
          </h1>

          {/* Subtitle */}
          <p className="mx-auto md:mx-0 max-w-xl text-lg sm:text-xl md:text-2xl text-foreground/90 font-medium">
            {displayData.subtitle}
          </p>


          {/* CTAs — palestra é a prioridade de negócio, por isso vem primeiro e com estilo sólido */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start items-center pt-2">
            <Button
              size="lg"
              onClick={() => {
                trackCTA('hero_cta_palestra', 'hero_section');
                scrollToSection('palestras');
              }}
              className="text-base sm:text-lg px-8 py-6"
            >
              {displayData.cta_secondary}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            <Button size="lg" variant="outline" asChild className="text-base sm:text-lg px-8 py-6">
              <a href="/teste-ia" onClick={() => trackCTA('hero_cta_diagnostico', 'hero_section')}>
                <BrainCircuit className="mr-2 w-5 h-5" />
                {displayData.cta_primary}
              </a>
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
