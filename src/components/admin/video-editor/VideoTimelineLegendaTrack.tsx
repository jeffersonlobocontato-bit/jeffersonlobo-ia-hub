import { type PalavraTranscrita, indicePalavraNoTempo } from '@/types/videoEditor';

interface Props {
  palavras: PalavraTranscrita[];
  duracaoTotalSegundos: number;
  tempoAtual: number;
  onSeek: (segundos: number) => void;
}

/**
 * Etapa 6 da timeline, parte 1: terceira faixa, mostrando cada palavra da
 * transcrição (já feita na aba Legenda) na posição real em que foi falada.
 * Só leitura — editar o texto continua na aba Legenda; aqui é a arrumação
 * no tempo. A palavra "ativa" nesse instante fica destacada, a mesma lógica
 * que a legenda ao vivo (abaixo do player) usa pra saber o que mostrar.
 */
export const VideoTimelineLegendaTrack = ({ palavras, duracaoTotalSegundos, tempoAtual, onSeek }: Props) => {
  if (palavras.length === 0 || duracaoTotalSegundos <= 0) return null;

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
