import { useRef, useState } from 'react';

type Props = { src: string; poster?: string; titulo: string };

// Vídeo principal da vitrine (o podcast da Academia), no palco do hero.
// Começa sem som e em loop, com as legendas gravadas no vídeo; o botão
// "Assistir com som" volta ao início, liga o som e mostra os controles.
// Com "reduzir movimento" ligado, não toca sozinho: fica a capa e o botão.
const PodcastTopo = ({ src, poster, titulo }: Props) => {
  const video = useRef<HTMLVideoElement>(null);
  const [comSom, setComSom] = useState(false);
  const reduzir = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const assistir = () => {
    const v = video.current;
    if (!v) return;
    v.loop = false;
    v.muted = false;
    v.currentTime = 0;
    v.controls = true;
    setComSom(true);
    v.play().catch(() => undefined);
  };

  return (
    <figure className="e-hero__palco e-podcast">
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={!reduzir}
        preload={reduzir ? 'none' : 'metadata'}
        aria-label={titulo}
      />
      {!comSom && (
        <button type="button" className="e-podcast__som" onClick={assistir}>
          <span className="e-podcast__icone" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          Assistir com som
        </button>
      )}
      <figcaption className="e-podcast__legenda">{titulo}</figcaption>
    </figure>
  );
};

export default PodcastTopo;
