import { useStagePhotos } from '@/hooks/useStagePhotos';

const StagePhotosSection = () => {
  const { data: photos = [] } = useStagePhotos();
  if (photos.length === 0) return null;

  return (
    <section className="bg-background py-20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground font-bold mb-2">
            No palco
          </p>
          <h2 className="display-title text-3xl md:text-4xl">
            Provocando lideranças e plateias Brasil afora
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {photos.map((p: any) => (
            <figure
              key={p.id}
              className="group relative overflow-hidden border-2 border-primary/30 shadow-[4px_4px_0_hsl(var(--primary))]"
            >
              <img
                src={p.image_url}
                alt={p.caption || p.event_name || 'Jefferson Lobo no palco'}
                className="w-full h-56 md:h-72 object-cover transition-transform duration-500 group-hover:scale-105"
                loading="lazy"
              />
              {(p.event_name || p.caption) && (
                <figcaption className="absolute inset-x-0 bottom-0 bg-background/85 backdrop-blur p-3">
                  {p.event_name && (
                    <div className="text-xs font-black uppercase text-primary">{p.event_name}</div>
                  )}
                  {p.caption && <div className="text-xs text-foreground/80">{p.caption}</div>}
                </figcaption>
              )}
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StagePhotosSection;
