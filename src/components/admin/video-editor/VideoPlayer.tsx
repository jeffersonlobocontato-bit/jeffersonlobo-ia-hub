import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { formatarTempoTimeline } from '@/types/videoEditor';

interface Props {
  mediaUrl: string;
  /** Tempo atual, controlado por fora (a régua/timeline também move o playhead). */
  tempoAtual: number;
  onTempoAtualChange: (segundos: number) => void;
  /** Chamado uma vez, assim que o navegador sabe a duração real do arquivo. */
  onDuracaoDetectada: (segundos: number) => void;
}

/**
 * Player de verdade — não é mais um quadro estático. Etapa 2 da timeline:
 * play/pause e um relógio. A régua de tempo (etapa 3) e o corte (etapa 4)
 * se conectam a ele por `tempoAtual`/`onTempoAtualChange`, controlados pelo
 * componente pai, pra ficar tudo sincronizado com um único dono do estado.
 */
export const VideoPlayer = ({ mediaUrl, tempoAtual, onTempoAtualChange, onDuracaoDetectada }: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const [duracao, setDuracao] = useState(0);

  // Se o vídeo mudou (outro arquivo enviado), reseta o player.
  useEffect(() => {
    setTocando(false);
    setDuracao(0);
  }, [mediaUrl]);

  // O tempo pode mudar por fora (clique na régua) — sincroniza o elemento
  // <video> só quando a diferença é real, pra não brigar com o próprio
  // avanço do vídeo durante a reprodução (timeupdate dispara o mesmo patch).
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    if (Math.abs(el.currentTime - tempoAtual) > 0.25) el.currentTime = tempoAtual;
  }, [tempoAtual]);

  const alternarPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) el.play(); else el.pause();
  };

  return (
    <div className="flex flex-col gap-2">
      <video
        ref={videoRef}
        src={mediaUrl}
        className="w-full max-w-[280px] rounded-lg border bg-black"
        style={{ aspectRatio: '9 / 16' }}
        playsInline
        onPlay={() => setTocando(true)}
        onPause={() => setTocando(false)}
        onTimeUpdate={(e) => onTempoAtualChange(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => {
          const d = e.currentTarget.duration;
          setDuracao(d);
          onDuracaoDetectada(d);
        }}
      />
      <div className="flex items-center gap-3">
        <Button size="sm" variant="outline" onClick={alternarPlay} className="w-16">
          {tocando ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        <span className="font-mono text-xs text-muted-foreground">
          {formatarTempoTimeline(tempoAtual)} / {duracao ? formatarTempoTimeline(duracao) : '--:--'}
        </span>
      </div>
    </div>
  );
};
