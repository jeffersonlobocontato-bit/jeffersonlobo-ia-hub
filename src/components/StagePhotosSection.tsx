import { useStagePhotos } from '@/hooks/useStagePhotos';

type Photo = {
  id: string;
  image_url: string;
  caption?: string | null;
  event_name?: string | null;
};

const StagePhotoCard = ({
  photo,
  className = '',
  imgClassName = 'h-full w-full object-cover',
}: {
  photo: Photo;
  className?: string;
  imgClassName?: string;
}) => (
  <figure
    className={`group relative overflow-hidden border border-foreground/10 bg-foreground transition-all duration-300 hover:border-foreground/30 ${className}`}
  >
    <img
      src={photo.image_url}
      alt={photo.caption || photo.event_name || 'Jefferson Lobo no palco'}
      className={`${imgClassName} transition-transform duration-700 group-hover:scale-[1.03]`}
      loading="lazy"
    />
    {/* Gradiente escuro para garantir legibilidade da legenda */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-foreground via-foreground/70 to-transparent" />
    {(photo.event_name || photo.caption) && (
      <figcaption className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <div className="border-l-2 border-primary pl-3">
          {photo.event_name && (
            <div className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.18em] text-background/70">
              {photo.event_name}
            </div>
          )}
          {photo.caption && (
            <div className="mt-1 text-sm sm:text-base font-bold text-background leading-snug">
              {photo.caption}
            </div>
          )}
        </div>
      </figcaption>
    )}
  </figure>
);


const StagePhotosSection = () => {
  const { data: photos = [] } = useStagePhotos();
  if (photos.length === 0) return null;

  const list = photos as Photo[];
  // Layout assimétrico de até 6 fotos
  const featured = list[0];
  const wide = list[1];
  const tall = list[2];
  const small1 = list[3];
  const small2 = list[4];
  const small3 = list[5];

  return (
    <section className="bg-background py-20 md:py-24">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 max-w-2xl mx-auto space-y-3">
          <p className="section-kicker">Prova de palco</p>
          <h2 className="display-title text-3xl md:text-5xl">
            Provocando <span className="highlight-yellow">lideranças</span> Brasil afora
          </h2>
          <p className="text-muted-foreground">
            Palestras, imersões executivas e sessões de governança em IA — para conselhos,
            diretorias e times de liderança.
          </p>
        </div>

        {/* Mobile: stack simples */}
        <div className="md:hidden grid grid-cols-1 gap-4">
          {list.slice(0, 6).map((p) => (
            <StagePhotoCard key={p.id} photo={p} imgClassName="w-full h-64 object-cover" />
          ))}
        </div>

        {/* Desktop: masonry assimétrico */}
        <div className="hidden md:grid grid-cols-12 gap-5 auto-rows-[140px]">
          {featured && (
            <StagePhotoCard
              photo={featured}
              className="col-span-5 row-span-3"
            />
          )}
          {wide && (
            <StagePhotoCard
              photo={wide}
              className="col-span-7 row-span-2"
            />
          )}
          {tall && (
            <StagePhotoCard
              photo={tall}
              className="col-span-4 row-span-2"
            />
          )}
          {small1 && (
            <StagePhotoCard
              photo={small1}
              className="col-span-3 row-span-2"
            />
          )}
          {small2 && (
            <StagePhotoCard
              photo={small2}
              className="col-span-5 row-span-2"
            />
          )}
          {small3 && (
            <StagePhotoCard
              photo={small3}
              className="col-span-7 row-span-2"
            />
          )}
        </div>
      </div>
    </section>
  );
};

export default StagePhotosSection;
