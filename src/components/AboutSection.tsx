import { Card } from '@/components/ui/card';
import * as LucideIcons from 'lucide-react';
import profileImg from '@/assets/profile.jpg';
import { useAboutContent, useServices } from '@/hooks/useAboutContent';

const AboutSection = () => {
  const { data: aboutData, isLoading: isLoadingAbout } = useAboutContent();
  const { data: services = [], isLoading: isLoadingServices } = useServices();

  // Fallback data
  const defaultData = {
    name: "Jefferson Lobo",
    title: "Head Executivo de Marketing e consultor em IA",
    read_line: "IA sem DNA autoral é commodity",
    description: "Head Executivo de Marketing do Sistema Fiep e defensor de uma tese proprietária: o marketing entrou na fase da orquestração de fluxos com IA — em vez de depender de prompts genéricos, marcas precisam construir agentes de IA com identidade própria. É nisso que ajudo lideranças, times de marketing e diretorias em todo o Brasil.",
    profile_image: profileImg
  };

  const displayData = aboutData || defaultData;

  const profileImage = displayData.profile_image;

  return (
    <section id="sobre" className="bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Profile Image */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-square max-w-md mx-auto overflow-hidden rounded-2xl border border-border shadow-lg">
              <img
                src={profileImage}
                alt="Jefferson Lobo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 via-15% to-transparent to-35%" />
            </div>
            <div className="absolute -bottom-4 -right-4 h-1 w-28 bg-primary" />
          </div>

          {/* About Text */}
          <div className="space-y-6 animate-slide-up">
            <div className="section-kicker">Perfil</div>
            {displayData.name && (
              <h2 className="display-title text-4xl sm:text-5xl md:text-6xl">
                <span className="text-primary">
                  {displayData.name}
                </span>
              </h2>
            )}
            <h3 className="text-2xl sm:text-3xl md:text-4xl">
              {displayData.title}
            </h3>
            {displayData.read_line && (
              <p className="border-l-2 border-primary pl-4 text-xl italic text-primary">
                {displayData.read_line}
              </p>
            )}
            <div className="space-y-4 text-lg text-muted-foreground whitespace-pre-line">
              {displayData.description}
            </div>
          </div>
        </div>

        {/* Services Grid */}
        <div className="space-y-8">
          <div className="text-center">
            <h3 className="display-title text-3xl md:text-4xl mb-4">
              <span className="text-primary">Como Jefferson Lobo</span>&nbsp;pode ajudar?
            </h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Experiência comprovada em ajudar empresas e profissionais a prosperarem na era da inteligência artificial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.CircleDot;
              return (
                <Card
                  key={service.id}
                  className="p-6 transition-all duration-300 hover:-translate-y-2 border-primary/20 bg-card animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h4 className="text-xl mb-2">{service.title}</h4>
                  <p className="text-muted-foreground">{service.description}</p>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
