import { type TrilhaSonoraConfig, type TimelineConfig, duracaoEfetivaTimeline } from '@/types/videoEditor';

interface Props {
  trilha: TrilhaSonoraConfig;
  timeline: TimelineConfig;
  /** Escala da régua compartilhada com as outras faixas (pode ser maior que o trecho cortado, por causa do B-roll). */
  duracaoEixoSegundos: number;
  tempoAtual: number;
  onSeek: (segundos: number) => void;
}

/**
 * Etapa 7 da timeline, parte visual: quarta faixa, representando a trilha
 * sonora — mas só sobre o trecho que de fato sai no vídeo final (o corte da
 * faixa "Vídeo principal"), não a gravação bruta inteira. É a mesma janela
 * que VideoTrilhaSonoraPlayer usa pra calcular o fade — fora dela a música
 * nem toca, então não faz sentido desenhar a barra até lá.
 */
export const VideoTimelineTrilhaTrack = ({ trilha, timeline, duracaoEixoSegundos, tempoAtual, onSeek }: Props) => {
  if (!trilha.ativa || !trilha.mediaUrl || duracaoEixoSegundos <= 0) return null;

  const duracaoEfetiva = duracaoEfetivaTimeline(timeline);
  if (duracaoEfetiva <= 0) return null;

  const inicioPct = (timeline.cortarInicioSegundos / duracaoEixoSegundos) * 100;
  const larguraPct = (duracaoEfetiva / duracaoEixoSegundos) * 100;
  const fadeInPct = Math.min(100, (trilha.fadeInSegundos / duracaoEfetiva) * 100);
  const fadeOutPct = Math.min(100, (trilha.fadeOutSegundos / duracaoEfetiva) * 100);
  const playheadPct = (tempoAtual / duracaoEixoSegundos) * 100;

  return (
    <div className="w-full max-w-[280px] select-none">
      <p className="mb-1 font-mono text-[10px] uppercase text-muted-foreground">Trilha sonora</p>
      <div
        onClick={(e) => {
          const box = e.currentTarget.getBoundingClientRect();
          const pct = Math.max(0, Math.min(1, (e.clientX - box.left) / box.width));
          onSeek(pct * duracaoEixoSegundos);
        }}
        className="relative h-6 cursor-pointer rounded-md border bg-muted"
      >
        <div
          className="absolute inset-y-0 overflow-hidden rounded bg-emerald-500/25"
          style={{ left: `${inicioPct}%`, width: `${larguraPct}%` }}
        >
          <div
            className="absolute inset-y-0 left-0"
            style={{ width: `${fadeInPct}%`, background: 'linear-gradient(to right, transparent, rgba(16,185,129,.4))' }}
          />
          <div
            className="absolute inset-y-0 right-0"
            style={{ width: `${fadeOutPct}%`, background: 'linear-gradient(to left, transparent, rgba(16,185,129,.4))' }}
          />
        </div>
        <div className="absolute inset-y-0 w-0.5 bg-primary" style={{ left: `${playheadPct}%` }} />
      </div>
    </div>
  );
};
