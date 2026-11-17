import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTrackCTA } from '@/hooks/useTrackCTA';

/* Home: caminho para o Método Prova de Ganho (/provadeganho). Fica logo depois do hero,
 * porque o hero abre com a tese e esta seção mostra o método que a sustenta. */
const fases = ['Panorama', 'Rota', 'Ensaio', 'Escala', 'Rotina'];
const ganhos = ['Previsto', 'Realizado', 'Capacidade liberada', 'Custo evitado'];
const mono = { fontFamily: "'IBM Plex Mono', monospace" };

const MetodoSection = () => {
  const { trackCTA } = useTrackCTA();
  return (
    <section id="metodo" className="relative bg-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto rounded-[24px] border border-primary/25 bg-card p-8 md:p-12 shadow-[0_0_60px_-30px_hsl(var(--primary))]">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr] lg:items-center">
            <div className="space-y-5">
              <div className="section-kicker">Para empresas · Método Prova de Ganho</div>
              <h2 className="display-title text-3xl sm:text-4xl md:text-5xl">
                Ensaio tem valor. Mas só escala o que <span className="highlight-yellow">provou ganho</span>.
              </h2>
              <p className="text-lg text-muted-foreground max-w-xl">
                Um método de gestão de projetos de IA em cinco fases e quatro portões, conduzido pela Agência de
                Inteligência Vozes. Cada solução só avança quando prova ganho com número, e o conselho acompanha tudo
                num portal.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-2">
                <Button size="lg" asChild className="px-8 py-6">
                  <Link to="/provadeganho" onClick={() => trackCTA('home_metodo_cta', 'metodo_section')}>
                    Conhecer o método <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
              </div>
            </div>

            <div className="space-y-6">
              <ol className="flex flex-wrap items-center gap-2">
                {fases.map((f, i) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-2 rounded-full border border-primary/40 bg-primary/10 px-3 py-1.5 text-sm text-foreground">
                      <span className="text-primary" style={mono}>{String(i + 1).padStart(2, '0')}</span>
                      {f}
                    </span>
                    {i < fases.length - 1 && (
                      <span className="text-[11px] text-primary/70" style={mono} title={`Portão ${'ABCD'[i]}`}>◆</span>
                    )}
                  </li>
                ))}
              </ol>
              <div>
                <div className="text-xs uppercase tracking-widest text-muted-foreground mb-3" style={mono}>
                  Os quatro ganhos que o conselho lê
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {ganhos.map((g) => (
                    <div key={g} className="rounded-xl border border-border bg-background/60 px-4 py-3 text-sm text-foreground">
                      {g}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default MetodoSection;
