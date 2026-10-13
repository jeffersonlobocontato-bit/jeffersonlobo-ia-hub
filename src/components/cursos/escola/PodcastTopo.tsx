import { useCallback, useEffect, useRef, useState } from 'react';

type Props = { src: string; poster: string; titulo: string; indice: number };

// O podcast da Academia no leque do topo da vitrine, no lugar da capa larga
// do curso. Fica atrás do livro, rodando sem som (as legendas estão gravadas
// no vídeo). No play, vem para a frente do livro, cresce e toca com som desde
// o início; ao fechar (ou quando acaba), volta para trás do livro.
// Com "reduzir movimento" ligado, não toca sozinho: fica a capa e o botão.
const PodcastTopo = ({ src, poster, titulo, indice }: Props) => {
  const video = useRef<HTMLVideoElement>(null);
  const [ativo, setAtivo] = useState(false);
  const reduzir = typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

  const abrir = () => {
    const v = video.current;
    if (!v) return;
    v.loop = false;
    v.muted = false;
    v.currentTime = 0;
    setAtivo(true);
    v.play().catch(() => undefined);
  };

  const fechar = useCallback(() => {
    const v = video.current;
    setAtivo(false);
    if (!v) return;
    v.muted = true;
    v.loop = true;
    if (reduzir) v.pause();
    else v.play().catch(() => undefined);
  }, [reduzir]);

  useEffect(() => {
    if (!ativo) return;
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && fechar();
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [ativo, fechar]);

  return (
    <div
      className={`e-leque__item e-leque__item--curso e-leque__item--podcast${ativo ? ' is-ativo' : ''}`}
      style={{ ['--i' as string]: indice } as React.CSSProperties}
    >
      <video
        ref={video}
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        autoPlay={!reduzir}
        preload={reduzir ? 'none' : 'metadata'}
        controls={ativo}
        onEnded={fechar}
        aria-label={titulo}
      />
      {ativo ? (
        <button type="button" className="e-podcast__fechar" onClick={fechar} aria-label="Fechar o podcast">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden>
            <path d="M6 6l12 12M18 6L6 18" />
          </svg>
        </button>
      ) : (
        <button type="button" className="e-podcast__som" onClick={abrir}>
          <span className="e-podcast__icone" aria-hidden>
            <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
              <path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.5-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5Z" />
            </svg>
          </span>
          Ouvir o podcast
        </button>
      )}
    </div>
  );
};

export default PodcastTopo;
