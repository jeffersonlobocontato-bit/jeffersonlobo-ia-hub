import { type PalavraTranscrita, indicePalavraNoTempo } from '@/types/videoEditor';

interface Props {
  palavras: PalavraTranscrita[];
  tempoAtual: number;
}

// Quantas palavras de contexto aparecem de cada lado da palavra ativa —
// pouco o bastante pra caber numa linha, o suficiente pra dar contexto.
const CONTEXTO = 3;

/**
 * Etapa 6 da timeline, parte 2: a prova de que a transcrição está mesmo
 * sincronizada — enquanto o vídeo toca, a palavra certa acende no momento
 * certo. Isso não é o estilo final da legenda (karaokê/frase/manchete, que
 * já existe na aba Legenda pro card estático) — é a verificação de que o
 * tempo de cada palavra bate com o áudio de verdade.
 */
export const VideoLegendaAoVivo = ({ palavras, tempoAtual }: Props) => {
  if (palavras.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Sem transcrição ainda — transcreva a fala na aba Legenda pra ver a legenda sincronizada aqui.
      </p>
    );
  }

  const indiceAtiva = indicePalavraNoTempo(palavras, tempoAtual);
  const inicio = Math.max(0, indiceAtiva - CONTEXTO);
  const fim = Math.min(palavras.length, indiceAtiva + CONTEXTO + 1);
  const janela = palavras.slice(inicio, fim);

  return (
    <div className="w-full max-w-[280px] rounded-md border bg-muted/40 px-3 py-2 text-center">
      <p className="text-sm leading-snug">
        {janela.map((p, i) => {
          const indiceReal = inicio + i;
          return (
            <span
              key={indiceReal}
              className={indiceReal === indiceAtiva ? 'rounded bg-amber-500 px-1 font-semibold text-amber-950' : 'text-muted-foreground'}
            >
              {p.texto}{' '}
            </span>
          );
        })}
      </p>
    </div>
  );
};
