import { useCallback, useRef, useState } from 'react';
import { Trash2 } from 'lucide-react';
import {
  type ClipeFundo, formatarTempoTimeline, posicionarClipes, duracaoTotalClipes, indiceClipeNoTempo,
} from '@/types/videoEditor';

interface Props {
  clipes: ClipeFundo[];
  duracaoTotalSegundos: number; // eixo compartilhado com a faixa de vídeo principal
  tempoAtual: number;
  onSeek: (segundos: number) => void;
  onReordenar: (clipes: ClipeFundo[]) => void;
  onRedimensionar: (id: string, duracaoSegundos: number) => void;
  onRemover: (id: string) => void;
}

const DURACAO_MINIMA_SEGUNDOS = 1;
const CORES = ['bg-sky-500/25', 'bg-violet-500/25', 'bg-rose-500/25', 'bg-emerald-500/25', 'bg-amber-500/25'];

/**
 * Etapa 5 da timeline: segunda faixa, embaixo da de vídeo principal, com os
 * clipes de fundo dinâmico (a lista já existia na aba Fundo — aqui é só a
 * arrumação deles no tempo). Arrastar o corpo de um clipe pra cima de outro
 * troca a ordem; arrastar a borda direita muda a duração — como não há
 * espaço entre clipes (tocam um atrás do outro), redimensionar um empurra
 * os seguintes automaticamente, sem precisar mexer neles.
 */
export const VideoTimelineBRollTrack = ({
  clipes, duracaoTotalSegundos, tempoAtual, onSeek, onReordenar, onRedimensionar, onRemover,
}: Props) => {
  const trilhaRef = useRef<HTMLDivElement>(null);
  const [arrastando, setArrastando] = useState<{ tipo: 'mover' | 'redimensionar'; id: string } | null>(null);

  const segundosDoPonteiro = useCallback((clientX: number) => {
    const box = trilhaRef.current?.getBoundingClientRect();
    if (!box || duracaoTotalSegundos <= 0) return 0;
    const pct = Math.max(0, Math.min(1, (clientX - box.left) / box.width));
    return pct * duracaoTotalSegundos;
  }, [duracaoTotalSegundos]);

  const mover = useCallback((clientX: number) => {
    if (!arrastando) return;
    const t = segundosDoPonteiro(clientX);

    if (arrastando.tipo === 'redimensionar') {
      const posicoes = posicionarClipes(clipes);
      const alvo = posicoes.find((p) => p.clipe.id === arrastando.id);
      if (!alvo) return;
      const novaDuracao = Math.max(DURACAO_MINIMA_SEGUNDOS, t - alvo.inicioSegundos);
      onRedimensionar(arrastando.id, novaDuracao);
      return;
    }

    // mover: acha em que posição da lista o ponteiro está agora e realoca
    // o clipe arrastado pra lá, se for diferente de onde ele já está.
    const indiceAlvo = indiceClipeNoTempo(clipes, t);
    const indiceAtual = clipes.findIndex((c) => c.id === arrastando.id);
    if (indiceAtual === -1 || indiceAtual === indiceAlvo) return;
    const reordenados = [...clipes];
    const [movido] = reordenados.splice(indiceAtual, 1);
    reordenados.splice(indiceAlvo, 0, movido);
    onReordenar(reordenados);
  }, [arrastando, segundosDoPonteiro, clipes, onRedimensionar, onReordenar]);

  if (clipes.length === 0 || duracaoTotalSegundos <= 0) return null;

  const posicoes = posicionarClipes(clipes);
  const somaClipes = duracaoTotalClipes(clipes);
  // Último clipe cujo início é <= tempoAtual — reaproveita `posicoes` já
  // calculado acima em vez de posicionar tudo de novo (indiceClipeNoTempo
  // faz o mesmo cálculo por dentro).
  let indiceAtivo = 0;
  posicoes.forEach((p, i) => { if (tempoAtual >= p.inicioSegundos) indiceAtivo = i; });
  const playheadPct = (tempoAtual / duracaoTotalSegundos) * 100;

  return (
    <div className="w-full max-w-[280px] select-none">
      <p className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Fundo / B-roll</p>
      <div
        ref={trilhaRef}
        onPointerMove={(e) => mover(e.clientX)}
        onPointerUp={() => setArrastando(null)}
        onPointerLeave={() => setArrastando(null)}
        className="relative h-9 overflow-hidden rounded-md border bg-muted"
        style={{ touchAction: 'none' }}
      >
        {posicoes.map(({ clipe, inicioSegundos }, i) => {
          const widthPct = (clipe.duracaoSegundos / duracaoTotalSegundos) * 100;
          const leftPct = (inicioSegundos / duracaoTotalSegundos) * 100;
          return (
            <div
              key={clipe.id}
              className={`group absolute inset-y-0 flex items-center justify-between border-r border-background px-1.5 ${CORES[i % CORES.length]} ${indiceAtivo === i ? 'ring-1 ring-inset ring-primary' : ''}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              onPointerDown={(e) => {
                e.stopPropagation();
                (e.target as HTMLElement).setPointerCapture(e.pointerId);
                setArrastando({ tipo: 'mover', id: clipe.id });
              }}
              onClick={(e) => { e.stopPropagation(); if (!arrastando) onSeek(inicioSegundos); }}
              title={`Clipe ${i + 1} — ${formatarTempoTimeline(clipe.duracaoSegundos)}`}
            >
              <span className="truncate font-mono text-[9px] text-foreground/80">{i + 1}</span>
              <button
                type="button"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => { e.stopPropagation(); onRemover(clipe.id); }}
                className="hidden shrink-0 rounded p-0.5 hover:bg-background/60 group-hover:block"
                title="Remover clipe"
              >
                <Trash2 className="h-2.5 w-2.5" />
              </button>
              <div
                onPointerDown={(e) => {
                  e.stopPropagation();
                  (e.target as HTMLElement).setPointerCapture(e.pointerId);
                  setArrastando({ tipo: 'redimensionar', id: clipe.id });
                }}
                onClick={(e) => e.stopPropagation()}
                className="absolute inset-y-0 right-0 w-1.5 cursor-ew-resize bg-foreground/20 hover:bg-foreground/40"
              />
            </div>
          );
        })}
        <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${playheadPct}%` }} />
      </div>
      {somaClipes < duracaoTotalSegundos && (
        <p className="mt-1 font-mono text-[10px] text-muted-foreground">
          Fundo acaba em {formatarTempoTimeline(somaClipes)} — depois disso a gravação fica sem fundo dinâmico por cima.
        </p>
      )}
    </div>
  );
};
