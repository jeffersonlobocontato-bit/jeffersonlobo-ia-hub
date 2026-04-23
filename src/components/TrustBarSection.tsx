import { Star } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useTrustStats } from '@/hooks/useTrustStats';
import { useTestimonials } from '@/hooks/useTestimonials';
import * as Icons from 'lucide-react';

const TrustBarSection = () => {
  const { data: trustStats = [] } = useTrustStats();
  const { data: testimonials = [] } = useTestimonials();

  const getIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName] || Icons.Star;
    return IconComponent;
  };

  return (
    <section className="border-y border-primary/20 bg-muted/40 py-16">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <p className="text-sm uppercase tracking-wider text-muted-foreground mb-4 font-bold">
            Confiança e Resultados
          </p>
          <h2 className="display-title text-3xl md:text-4xl">
            Impacto comprovado em empresas e profissionais
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {trustStats.map((stat) => {
            const IconComponent = getIcon(stat.icon);
            return (
              <Card
                key={stat.id}
                className="p-6 text-center transition-all duration-300 hover:-translate-y-1 border-primary/20 bg-card"
              >
                <div className="w-12 h-12 mx-auto mb-4 border border-primary/30 bg-primary/10 flex items-center justify-center">
                  <IconComponent className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-black text-primary mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground uppercase font-bold">
                  {stat.label}
                </div>
              </Card>
            );
          })}
        </div>

        {/* Testimonial */}
        {testimonials.length > 0 && (
          <div className="mt-12 max-w-3xl mx-auto">
            <Card className="p-8 border-primary/20 bg-card">
              <div className="flex gap-1 mb-4 justify-center">
                {[...Array(Math.floor(testimonials[0].rating))].map((_, i) => (
                  <Star key={i} className="w-5 h-5 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-lg text-center italic text-muted-foreground mb-4">
                "{testimonials[0].quote}"
              </p>
              <p className="text-center font-semibold">
                — {testimonials[0].author_name}, {testimonials[0].author_title}
              </p>
            </Card>
          </div>
        )}
      </div>
    </section>
  );
};

export default TrustBarSection;
