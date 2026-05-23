import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const NewsletterSection = () => {
  const { trackCTA } = useTrackCTA();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    trackCTA('newsletter_inline_submit', 'newsletter_section');
    // Encaminha para a newsletter do LinkedIn (fluxo já existente do projeto)
    window.open(
      'https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7216140554995175424',
      '_blank',
      'noopener,noreferrer'
    );
  };

  return (
    <section className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 z-0 bg-brand-grid opacity-30" />
      <div className="absolute inset-x-0 top-0 h-px bg-primary/40" />
      <div className="absolute inset-x-0 bottom-0 h-px bg-secondary/40" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="mx-auto max-w-3xl text-center space-y-8">
          <div className="section-kicker mx-auto">Newsletter Semanal</div>

          <h2 className="display-title text-4xl sm:text-5xl md:text-6xl tracking-tight">
            IA aplicada em <span className="highlight-yellow">5 minutos</span> por semana.
          </h2>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
            Receba o que está mudando em IA, por que importa para o seu negócio
            e como aplicar — direto no seu inbox, sem hype.
          </p>

          <form
            onSubmit={handleSubmit}
            className="mx-auto flex flex-col sm:flex-row gap-3 max-w-xl"
          >
            <Input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
              className="h-14 text-base bg-card border-2 border-border focus-visible:ring-primary"
            />
            <Button type="submit" size="lg" className="h-14 px-8 whitespace-nowrap">
              <Send className="w-4 h-4 mr-2" />
              Inscrever
            </Button>
          </form>

          <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Junte-se a <span className="text-primary">12.000+</span> líderes que já leem
          </p>
        </div>
      </div>
    </section>
  );
};

export default NewsletterSection;
