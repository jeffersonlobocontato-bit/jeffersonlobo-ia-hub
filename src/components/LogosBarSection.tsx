import { useSpeakingLogos } from '@/hooks/useSpeakingLogos';

const LogosBarSection = () => {
  const { data: logos = [] } = useSpeakingLogos();
  if (logos.length === 0) return null;

  return (
    <section className="border-y border-primary/20 bg-muted/30 py-12">
      <div className="container mx-auto px-4">
        <p className="text-center text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-6">
          Já estive no palco e nas mesas de
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6">
          {logos.map((logo: any) => (
            <div key={logo.id} className="flex items-center">
              {logo.logo_url ? (
                <img
                  src={logo.logo_url}
                  alt={logo.name}
                  className="h-10 md:h-12 w-auto object-contain opacity-80 hover:opacity-100 transition-opacity"
                />
              ) : (
                <span className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground/70 hover:text-foreground transition-colors">
                  {logo.name}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default LogosBarSection;
