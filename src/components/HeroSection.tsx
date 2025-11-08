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
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src={heroBg}
          alt="Jefferson Lobo - AI Expert"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-tech-dark/40 via-tech-dark/30 to-background" />
      </div>

      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/3 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/3 right-1/4 w-64 h-64 bg-secondary/10 rounded-full blur-3xl animate-pulse-glow" />
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 z-10 relative">
        <div className="max-w-4xl mx-auto text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/30 bg-white/10 backdrop-blur-sm">
            <Sparkles className="w-4 h-4 text-white" />
            <span className="text-sm font-medium text-white">
              Explorando o futuro da tecnologia
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white drop-shadow-[0_4px_20px_rgba(0,0,0,0.8)]">
            {displayData.headline}
          </h1>

          <p className="text-lg sm:text-xl md:text-2xl text-white max-w-2xl mx-auto drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {displayData.subtitle}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
            <Button
              size="lg"
              asChild
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-lg px-8 py-6 shadow-2xl shadow-primary/50 animate-pulse-glow"
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
              className="text-lg px-8 py-6 border-white/30 bg-white/10 text-white hover:bg-white/20"
            >
              {displayData.cta_secondary}
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-12 max-w-2xl mx-auto">
            {[
              { value: displayData.stat1_number, label: displayData.stat1_label },
              { value: displayData.stat2_number, label: displayData.stat2_label },
              { value: displayData.stat3_number, label: displayData.stat3_label },
            ].map((stat, index) => (
              <div 
                key={index} 
                className="text-center animate-fade-in"
                style={{ animationDelay: `${index * 150}ms` }}
              >
                <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-white drop-shadow-lg">
                  {stat.value}
                </div>
                <div className="text-xs sm:text-sm text-white/80 mt-1 drop-shadow-md">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full p-1">
          <div className="w-1 h-3 bg-white rounded-full mx-auto animate-pulse" />
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
