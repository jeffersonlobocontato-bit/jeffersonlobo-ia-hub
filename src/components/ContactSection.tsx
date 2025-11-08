import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const ContactSection = () => {
  const { trackCTA } = useTrackCTA();

  return (
    <section id="contato" className="py-24 bg-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-block mb-4">
            <div className="px-6 sm:px-8 py-3 sm:py-4 rounded-full bg-gradient-to-r from-primary to-secondary">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white">
                Vamos conversar
              </h2>
            </div>
          </div>
          <div className="max-w-3xl mx-auto space-y-6">
            <h3 className="text-xl sm:text-2xl md:text-3xl font-semibold text-foreground">
              Convide Jefferson Lobo para sua próxima palestra, curso ou consultoria
            </h3>
            <p className="text-lg text-muted-foreground">
              Transforme sua organização com insights sobre inteligência artificial, inovação e o futuro da tecnologia
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive mb-4">
              <span className="text-sm font-semibold">⏰ Apenas 3 vagas disponíveis este mês</span>
            </div>
            <div className="flex justify-center pt-4">
              <Button
                size="lg"
                className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
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
