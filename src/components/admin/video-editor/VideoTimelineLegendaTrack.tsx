import { Plus } from 'lucide-react';
import { type PalavraTranscrita, indicePalavraNoTempo } from '@/types/videoEditor';

interface Props {
  palavras: PalavraTranscrita[];
  duracaoTotalSegundos: number;
  tempoAtual: number;
  onSeek: (segundos: number) => void;
  /** Chamado quando a faixa vazia é clicada — o pai leva pra aba Legenda pra transcrever. */
  onAdicionar?: () => void;
}

/**
 * Etapa 6 da timeline, parte 1: terceira faixa, mostrando cada palavra da
 * transcrição (já feita na aba Legenda) na posição real em que foi falada.
 * Só leitura — editar o texto continua na aba Legenda; aqui é a arrumação
 * no tempo. A palavra "ativa" nesse instante fica destacada, a mesma lógica
 * que a legenda ao vivo (abaixo do player) usa pra saber o que mostrar.
 *
 * A faixa fica sempre visível (mesmo sem transcrição ainda) — antes ela
 * sumia até ter palavras, o que dava a impressão de que não existia faixa
 * de legenda na timeline.
 */
export const VideoTimelineLegendaTrack = ({ palavras, duracaoTotalSegundos, tempoAtual, onSeek, onAdicionar }: Props) => {
  if (duracaoTotalSegundos <= 0) return null;

  if (palavras.length === 0) {
    return (
      <div className="w-full max-w-[280px] select-none">
        <p className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Legenda</p>
        <button
          type="button"
          onClick={onAdicionar}
          className="flex h-6 w-full items-center justify-center gap-1 rounded-md border border-dashed text-[10px] text-muted-foreground hover:border-primary hover:text-primary"
        >
          <Plus className="h-3 w-3" /> Transcrever
        </button>
      </div>
    );
  }

  const indiceAtiva = indicePalavraNoTempo(palavras, tempoAtual);

  return (
    <div className="w-full max-w-[280px] select-none">
      <p className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Legenda</p>
      <div className="relative flex h-6 overflow-hidden rounded-md border bg-muted">
        {palavras.map((p, i) => {
          const widthPct = Math.max(0.4, ((p.fim - p.inicio) / duracaoTotalSegundos) * 100);
          const leftPct = (p.inicio / duracaoTotalSegundos) * 100;
          return (
            <button
              key={i}
              type="button"
              onClick={() => onSeek(p.inicio)}
              className={`absolute inset-y-0 border-r border-background/60 ${indiceAtiva === i ? 'bg-amber-500' : 'bg-primary/20 hover:bg-primary/35'}`}
              style={{ left: `${leftPct}%`, width: `${widthPct}%` }}
              title={p.texto}
            />
          );
        })}
      </div>
    </div>
  );
};
