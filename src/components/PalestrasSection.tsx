import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { ArrowRight, Check } from 'lucide-react';
import * as Icons from 'lucide-react';
import { usePalestraFormats } from '@/hooks/usePalestraFormats';
import { useTrackCTA } from '@/hooks/useTrackCTA';

const PalestrasSection = () => {
  const { data: formats = [] } = usePalestraFormats();
  const { trackCTA } = useTrackCTA();

  const getIcon = (name?: string | null) => {
    const I = (Icons as any)[name || 'Mic'] || Icons.Mic;
    return I;
  };

  const scrollToBriefing = (slug: string) => {
    trackCTA(`palestras_card_${slug}`, 'palestras_section');
    document.getElementById('briefing')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="palestras" className="relative overflow-hidden bg-background py-24">
      <div className="absolute inset-0 z-0 bg-brand-grid opacity-30" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-14 space-y-4">
          <div className="section-kicker">Palestras · Imersões · Consultoria</div>
          <h2 className="display-title text-4xl sm:text-5xl md:text-6xl">
            Leve a conversa de <span className="highlight-yellow">IA</span> para dentro da sua empresa
          </h2>
          <p className="text-lg text-muted-foreground">
            Três formatos para sensibilizar lideranças, nivelar a linguagem sobre IA e iniciar a
            jornada de governança — do palco à mesa executiva. A execução fica com seu time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {formats.map((f) => {
            const Icon = getIcon(f.icon);
            return (
              <Card
                key={f.id}
                className="relative flex flex-col p-8 border-2 border-primary/30 bg-card shadow-[6px_6px_0_hsl(var(--primary))] transition-transform hover:-translate-y-1"
              >
                <div className="mb-5 inline-flex h-12 w-12 items-center justify-center border-2 border-primary bg-primary/10">
                  <Icon className="w-6 h-6 text-primary" />
                </div>

                {f.kicker && (
                  <div className="text-xs uppercase tracking-wider text-secondary font-black mb-2">
                    {f.kicker}
                  </div>
                )}
                <h3 className="text-2xl font-black uppercase text-foreground mb-3">{f.title}</h3>
                <p className="text-muted-foreground mb-5 text-sm leading-relaxed">{f.description}</p>

                <div className="space-y-2 text-xs font-bold uppercase text-foreground/80 mb-5">
                  {f.audience && (
                    <div>
                      <span className="text-muted-foreground">Para: </span>
                      {f.audience}
                    </div>
                  )}
                  {f.duration && (
                    <div>
                      <span className="text-muted-foreground">Duração: </span>
                      {f.duration}
                    </div>
                  )}
                </div>

                {Array.isArray(f.deliverables) && f.deliverables.length > 0 && (
                  <ul className="space-y-2 mb-6 flex-1">
                    {f.deliverables.map((d, i) => (
                      <li key={i} className="flex gap-2 text-sm text-foreground">
                        <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <span>{d}</span>
                      </li>
                    ))}
                  </ul>
                )}

                <Button
                  className="w-full mt-auto"
                  onClick={() => scrollToBriefing(f.slug)}
                >
                  {f.cta_label || 'Solicitar proposta'}
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default PalestrasSection;
