import { useCallback, useRef, useState } from 'react';
import { formatarTempoTimeline, type CorteInterno } from '@/types/videoEditor';

interface Props {
  /** Escala total da régua — pode ser maior que o vídeo (ex.: fundo dinâmico mais longo que a gravação). */
  duracaoSegundos: number;
  /** Até onde o corte pode ir — a duração real do vídeo, nunca a escala da régua. */
  duracaoVideoSegundos: number;
  tempoAtual: number;
  onSeek: (segundos: number) => void;
  cortarInicioSegundos: number;
  cortarFimSegundos: number;
  onCortarInicioChange: (segundos: number) => void;
  onCortarFimChange: (segundos: number) => void;
  /** Trechos apagados de dentro do corte (etapa "dividir/apagar trecho") — desenhados como faixas riscadas por cima do trecho usado. */
  cortesInternos?: CorteInterno[];
}

// Nenhum corte pode deixar menos que isso — evita um clipe de duração zero
// (ou negativa) que trava o player e não significa nada num vídeo final.
const TRECHO_MINIMO_SEGUNDOS = 0.5;

/**
 * Etapa 4 da timeline: as bordas do trecho usado (alças âmbar) ficam por
 * cima da régua da etapa 3, que continua servindo pra mover o playhead —
 * clicar no meio ainda pula pra ali; arrastar uma alça só ajusta o corte,
 * sem mexer no playhead. O trecho fora do corte fica visualmente apagado.
 */
export const VideoTimelineRuler = ({
  duracaoSegundos, duracaoVideoSegundos, tempoAtual, onSeek,
  cortarInicioSegundos, cortarFimSegundos, onCortarInicioChange, onCortarFimChange,
  cortesInternos = [],
}: Props) => {
  const trilhaRef = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState<'inicio' | 'fim' | null>(null);

  const segundosDoClique = useCallback((clientX: number) => {
    const box = trilhaRef.current?.getBoundingClientRect();
    if (!box) return 0;
    const pct = Math.max(0, Math.min(1, (clientX - box.left) / box.width));
    return pct * duracaoSegundos;
  }, [duracaoSegundos]);

  const moverAlca = useCallback((clientX: number) => {
    if (!arrastando) return;
    const t = segundosDoClique(clientX);
    if (arrastando === 'inicio') {
      onCortarInicioChange(Math.max(0, Math.min(t, cortarFimSegundos - TRECHO_MINIMO_SEGUNDOS)));
    } else {
      onCortarFimChange(Math.min(duracaoVideoSegundos, Math.max(t, cortarInicioSegundos + TRECHO_MINIMO_SEGUNDOS)));
    }
  }, [arrastando, segundosDoClique, cortarInicioSegundos, cortarFimSegundos, duracaoVideoSegundos, onCortarInicioChange, onCortarFimChange]);

  if (duracaoSegundos <= 0) {
    return <p className="text-xs text-muted-foreground">Carregando duração do vídeo…</p>;
  }

  const marcas = [0, 0.25, 0.5, 0.75, 1].map((f) => f * duracaoSegundos);
  const playheadPct = (tempoAtual / duracaoSegundos) * 100;
  const inicioPct = (cortarInicioSegundos / duracaoSegundos) * 100;
  const fimPct = (cortarFimSegundos / duracaoSegundos) * 100;

  const handlePointerDown = (alca: 'inicio' | 'fim') => (e: React.PointerEvent) => {
    e.stopPropagation();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setArrastando(alca);
  };

  return (
    <div className="w-full max-w-[280px] select-none">
      <div
        ref={trilhaRef}
        onClick={(e) => { if (!arrastando) onSeek(segundosDoClique(e.clientX)); }}
        onPointerMove={(e) => moverAlca(e.clientX)}
        onPointerUp={() => setArrastando(null)}
        onPointerLeave={() => setArrastando(null)}
        className="relative h-10 cursor-pointer rounded-md border bg-muted"
        style={{ touchAction: 'none' }}
      >
        {/* trechos fora do corte — apagados */}
        <div className="absolute inset-y-0 left-0 rounded-l-md bg-muted-foreground/10" style={{ width: `${inicioPct}%` }} />
        <div className="absolute inset-y-0 right-0 rounded-r-md bg-muted-foreground/10" style={{ width: `${100 - fimPct}%` }} />
        {/* trecho usado */}
        <div className="absolute inset-y-0 bg-primary/20" style={{ left: `${inicioPct}%`, width: `${fimPct - inicioPct}%` }} />

        {/* trechos apagados no meio (ripple delete) — riscados por cima do trecho usado */}
        {cortesInternos.map((c) => {
          const leftPct = (c.inicioSegundos / duracaoSegundos) * 100;
          const widthPct = ((c.fimSegundos - c.inicioSegundos) / duracaoSegundos) * 100;
          return (
            <div
              key={c.id}
              className="absolute inset-y-0 bg-destructive/40"
              style={{
                left: `${leftPct}%`,
                width: `${widthPct}%`,
                backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 3px, hsl(var(--destructive) / .5) 3px, hsl(var(--destructive) / .5) 6px)',
              }}
              title="Trecho apagado"
            />
          );
        })}

        <div className="absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${playheadPct}%` }} />
        <div
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-background bg-primary"
          style={{ left: `${playheadPct}%` }}
        />

        {/* alças de corte — o click no soltar (mousedown+mouseup na mesma alça
            sempre dispara um click sintético) precisa parar aqui também, ou
            ele borbulha até o onClick da trilha e joga o playhead pra onde
            o mouse acabou de soltar, mesmo já não estando mais "arrastando" */}
        <div
          onPointerDown={handlePointerDown('inicio')}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 bottom-0 w-2.5 -translate-x-1/2 cursor-ew-resize rounded bg-amber-500"
          style={{ left: `${inicioPct}%` }}
          title="Arraste pra ajustar o início do corte"
        />
        <div
          onPointerDown={handlePointerDown('fim')}
          onClick={(e) => e.stopPropagation()}
          className="absolute top-0 bottom-0 w-2.5 -translate-x-1/2 cursor-ew-resize rounded bg-amber-500"
          style={{ left: `${fimPct}%` }}
          title="Arraste pra ajustar o fim do corte"
        />
      </div>
      <div className="mt-1 flex justify-between font-mono text-[10px] text-muted-foreground">
        {marcas.map((m, i) => (
          <span key={i}>{formatarTempoTimeline(m)}</span>
        ))}
      </div>
      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
        Corte: {formatarTempoTimeline(cortarInicioSegundos)} – {formatarTempoTimeline(cortarFimSegundos)} ({formatarTempoTimeline(cortarFimSegundos - cortarInicioSegundos)})
      </p>
    </div>
  );
};
