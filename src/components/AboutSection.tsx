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
    title: "Especialista em IA e Inovação",
    read_line: "Transformando ideias em realidade através da tecnologia",
    description: "Com vasta experiência em tecnologia e inovação, dedico-me a explorar o potencial da Inteligência Artificial e seu impacto na sociedade.",
    profile_image: profileImg
  };

  const displayData = aboutData || defaultData;

  const profileImage = displayData.profile_image;

  return (
    <section id="sobre" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Profile Image */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden">
              <img
                src={profileImage}
                alt="Jefferson Lobo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-muted/30 via-muted/80 via-30% to-transparent to-60%" />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10" />
          </div>

          {/* About Text */}
          <div className="space-y-6 animate-slide-up">
            {displayData.name && (
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight">
                <span className="gradient-primary bg-clip-text text-transparent">
                  {displayData.name}
                </span>
              </h1>
            )}
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">
              {displayData.title}
            </h2>
            {displayData.read_line && (
              <p className="text-xl text-primary font-semibold">
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
            <h3 className="text-3xl font-bold mb-4">Como posso ajudar você</h3>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Ofereço soluções completas para empresas e profissionais que
              desejam se destacar na era da inteligência artificial
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => {
              const IconComponent = (LucideIcons as any)[service.icon] || LucideIcons.CircleDot;
              return (
                <Card
                  key={service.id}
                  className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/20 bg-card/50 backdrop-blur-sm animate-scale-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                    <IconComponent className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <h4 className="text-xl font-bold mb-2">{service.title}</h4>
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
