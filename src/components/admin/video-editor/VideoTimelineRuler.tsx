import { useRef } from 'react';
import { formatarTempoTimeline } from '@/types/videoEditor';

interface Props {
  duracaoSegundos: number;
  tempoAtual: number;
  onSeek: (segundos: number) => void;
}

/**
 * Etapa 3 da timeline: a régua abaixo do player. Por enquanto é só leitura —
 * clicar pula o playhead pra ali. Arrastar as bordas do clipe pra cortar
 * (etapa 4) e várias faixas empilhadas (B-roll, trilha — etapas 5+) entram
 * depois, sem trocar essa base.
 */
export const VideoTimelineRuler = ({ duracaoSegundos, tempoAtual, onSeek }: Props) => {
  const trilhaRef = useRef<HTMLDivElement>(null);

  if (duracaoSegundos <= 0) {
    return <p className="text-xs text-muted-foreground">Carregando duração do vídeo…</p>;
  }

  const buscarPeloClique = (clientX: number) => {
    const box = trilhaRef.current?.getBoundingClientRect();
    if (!box) return;
    const pct = Math.max(0, Math.min(1, (clientX - box.left) / box.width));
    onSeek(pct * duracaoSegundos);
  };

  // Marcas a cada ~20% da duração, arredondadas ao segundo.
  const marcas = [0, 0.25, 0.5, 0.75, 1].map((f) => f * duracaoSegundos);
  const playheadPct = (tempoAtual / duracaoSegundos) * 100;

  return (
    <div className="w-full max-w-[280px] select-none">
      <div
        ref={trilhaRef}
        onClick={(e) => buscarPeloClique(e.clientX)}
        className="relative h-10 cursor-pointer rounded-md border bg-muted"
      >
        <div className="absolute inset-y-0 left-0 rounded-md bg-primary/15" style={{ width: '100%' }} />
        <div
          className="absolute inset-y-0 w-0.5 bg-primary"
          style={{ left: `${playheadPct}%` }}
        />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
          style={{ left: `${playheadPct}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        {marcas.map((m, i) => (
          <span key={i}>{formatarTempoTimeline(m)}</span>
        ))}
      </div>
    </div>
  );
};
