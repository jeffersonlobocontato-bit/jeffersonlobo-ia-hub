import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const ContactSection = () => {
  const { trackCTA } = useTrackCTA();

  return (
    <section id="contato" className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 z-0 bg-brand-grid opacity-35" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="panel-dark mx-auto mb-12 max-w-5xl p-8 md:p-12">
          <div className="max-w-3xl mx-auto space-y-6 text-center">
            <div className="section-kicker">Convites · consultoria · treinamentos</div>
            <h2 className="display-title text-4xl sm:text-5xl md:text-6xl text-foreground">
              Vamos conversar
            </h2>
            <h3 className="text-xl sm:text-2xl md:text-3xl font-black uppercase text-foreground">
              Convide Jefferson Lobo para sua próxima palestra, curso ou consultoria
            </h3>
            <p className="text-lg text-muted-foreground">
              Transforme sua organização com insights sobre inteligência artificial, inovação e o futuro da tecnologia
            </p>
            <div className="inline-flex items-center gap-2 border border-secondary/30 bg-secondary/10 px-4 py-2 text-foreground mb-4 font-bold uppercase">
              <span className="text-sm font-semibold">⏰ Apenas 3 vagas disponíveis este mês</span>
            </div>
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                asChild
              >
                <a
                  href="https://wa.me/5545999864213"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                  onClick={() => trackCTA('contact_whatsapp', 'contact_section')}
                >
                  <MessageCircle className="w-5 h-5" />
                  Entrar em contato agora
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ContactSection;
