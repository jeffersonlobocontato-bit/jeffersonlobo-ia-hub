import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, BrainCircuit } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';
import { useHeroContent } from '@/hooks/useHeroContent';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const HeroSection = () => {
  const { data: heroData, isLoading } = useHeroContent();
  const { trackCTA } = useTrackCTA();

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const openChatBot = () => {
    trackCTA('chat_uivo_open', 'hero_section');
    const chatButton = document.querySelector('[class*="fixed bottom-6 right-6"]') as HTMLButtonElement;
    if (chatButton) {
      chatButton.click();
    }
  };

  // Fallback data quando banco está vazio
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

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background pt-24"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Jefferson Lobo - AI Expert"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />
      </div>

      <div className="absolute inset-0 z-0 bg-brand-grid opacity-70" />
      <div className="absolute inset-x-0 top-24 z-0 h-px bg-primary/50" />
      <div className="absolute inset-x-0 bottom-24 z-0 h-px bg-secondary/50" />

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-[8%] h-32 w-32 border border-primary/30 bg-primary/10" />
        <div className="absolute bottom-[18%] right-[10%] h-28 w-48 border border-secondary/40 bg-secondary/10" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="mx-auto grid max-w-6xl items-end gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-8 animate-fade-in text-left">
            <div className="section-kicker">
              <Sparkles className="w-4 h-4" />
              <span>Estratégia prática em IA</span>
            </div>

            <h1 className="display-title max-w-4xl text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem]">
              {displayData.headline}
            </h1>

            <div className="max-w-2xl border-l-4 border-secondary pl-5">
              <p className="text-lg sm:text-xl md:text-2xl text-foreground/90">
                {displayData.subtitle}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 items-start pt-2">
              <Button
                size="lg"
                asChild
                className="text-lg px-8 py-6"
              >
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
                className="text-lg px-8 py-6"
              >
                {displayData.cta_secondary}
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </div>
          </div>

          <div className="panel-dark p-6 sm:p-8 lg:p-10">
            <div className="mb-6 border-b border-primary/20 pb-4">
              <p className="text-xs font-bold uppercase text-muted-foreground">Assinatura visual</p>
              <div className="mt-4 flex items-end gap-4">
                <span className="display-title text-7xl sm:text-8xl text-primary">JL</span>
                <span className="mb-3 h-2 w-24 bg-secondary" />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { value: displayData.stat1_number, label: displayData.stat1_label },
                { value: displayData.stat2_number, label: displayData.stat2_label },
                { value: displayData.stat3_number, label: displayData.stat3_label },
              ].map((stat, index) => (
                <div 
                  key={index} 
                  className="border border-border bg-background p-4 animate-fade-in"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="text-3xl sm:text-4xl font-black text-primary">
                    {stat.value}
                  </div>
                  <div className="mt-2 text-xs sm:text-sm font-bold uppercase text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-6 text-sm uppercase text-muted-foreground">
              Diagnóstico, conteúdo e posicionamento com presença visual forte e mensagem direta.
            </p>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-primary/50 rounded-full p-1">
          <div className="w-1 h-3 bg-primary rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
