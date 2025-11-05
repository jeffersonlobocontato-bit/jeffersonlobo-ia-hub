import { Card } from '@/components/ui/card';
import { Brain, Presentation, BookOpen, Users } from 'lucide-react';
import profileImg from '@/assets/profile.jpg';

const AboutSection = () => {
  const services = [
    {
      icon: Presentation,
      title: 'Palestras',
      description: 'Apresentações inspiradoras sobre IA, inovação e transformação digital para empresas e eventos.',
    },
    {
      icon: Users,
      title: 'Cursos',
      description: 'Treinamentos práticos e atualizados sobre inteligência artificial e tecnologias emergentes.',
    },
    {
      icon: Brain,
      title: 'Consultoria',
      description: 'Assessoria estratégica para implementação de soluções de IA e transformação tecnológica.',
    },
    {
      icon: BookOpen,
      title: 'Conteúdo',
      description: 'Produção de artigos, vídeos e materiais educativos sobre o universo da tecnologia.',
    },
  ];

  return (
    <section id="sobre" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center mb-16">
          {/* Profile Image */}
          <div className="relative animate-fade-in">
            <div className="relative aspect-square max-w-md mx-auto rounded-2xl overflow-hidden">
              <img
                src={profileImg}
                alt="Jefferson Lobo"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-tech-dark/50 to-transparent" />
            </div>
            {/* Decorative Elements */}
            <div className="absolute -top-4 -right-4 w-72 h-72 bg-primary/20 rounded-full blur-3xl -z-10" />
            <div className="absolute -bottom-4 -left-4 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10" />
          </div>

          {/* About Text */}
          <div className="space-y-6 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold">
              <span className="gradient-primary bg-clip-text text-transparent">
                Sobre mim
              </span>
            </h2>
            <div className="space-y-4 text-lg text-muted-foreground">
              <p>
                Com mais de 15 anos de experiência no universo da tecnologia,
                dedico minha carreira a desvendar o potencial da inteligência
                artificial e seu impacto na sociedade.
              </p>
              <p>
                Como palestrante, já impactei milhares de profissionais em
                eventos corporativos e acadêmicos, sempre com foco em tornar
                a tecnologia acessível e inspiradora.
              </p>
              <p>
                Meu trabalho combina expertise técnica com uma visão humanista,
                explorando como a IA pode amplificar a criatividade e resolver
                desafios reais do nosso tempo.
              </p>
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

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={index}
                className="p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-2 border-primary/20 bg-card/50 backdrop-blur-sm animate-scale-in"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                  <service.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <h4 className="text-xl font-bold mb-2">{service.title}</h4>
                <p className="text-muted-foreground">{service.description}</p>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default AboutSection;
