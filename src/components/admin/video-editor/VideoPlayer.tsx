import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Play, Pause } from 'lucide-react';
import { formatarTempoTimeline, pularCortesInternos, type CorteInterno } from '@/types/videoEditor';

interface Props {
  mediaUrl: string;
  /** Tempo atual, controlado por fora (a régua/timeline também move o playhead). */
  tempoAtual: number;
  onTempoAtualChange: (segundos: number) => void;
  /** Chamado uma vez, assim que o navegador sabe a duração real do arquivo. */
  onDuracaoDetectada: (segundos: number) => void;
  /** Corte (etapa 4): fora dele não toca — dar play começa do início do corte, e o vídeo pausa sozinho no fim dele. */
  cortarInicioSegundos?: number;
  cortarFimSegundos?: number | null;
  /** Trechos apagados de dentro do corte acima — a reprodução pula por cima deles, sem parar. */
  cortesInternos?: CorteInterno[];
  /** Etapa 7: a trilha sonora precisa saber quando tocar/pausar junto com o vídeo. */
  onTocandoChange?: (tocando: boolean) => void;
}

/**
 * Player de verdade — não é mais um quadro estático. A régua de tempo
 * (etapa 3) e o corte (etapa 4) se conectam a ele por
 * `tempoAtual`/`onTempoAtualChange`, controlados pelo componente pai, pra
 * ficar tudo sincronizado com um único dono do estado.
 */
export const VideoPlayer = ({
  mediaUrl, tempoAtual, onTempoAtualChange, onDuracaoDetectada,
  cortarInicioSegundos = 0, cortarFimSegundos = null, cortesInternos = [], onTocandoChange,
}: Props) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [tocando, setTocando] = useState(false);
  const [duracao, setDuracao] = useState(0);

  // Se o vídeo mudou (outro arquivo enviado), reseta o player — e avisa quem
  // estiver ouvindo `tocando` (a trilha sonora), senão ela fica "tocando"
  // pro estado do pai mesmo com o vídeo parado depois da troca.
  useEffect(() => {
    setTocando(false);
    setDuracao(0);
    onTocandoChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mediaUrl]);

  // O tempo pode mudar por fora (clique na régua) — sincroniza o elemento
  // <video> só quando a diferença é real, pra não brigar com o próprio
  // avanço do vídeo durante a reprodução (timeupdate dispara o mesmo patch).
  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;
    const alvo = pularCortesInternos(tempoAtual, cortesInternos);
    if (Math.abs(el.currentTime - alvo) > 0.25) el.currentTime = alvo;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tempoAtual]);

  const alternarPlay = () => {
    const el = videoRef.current;
    if (!el) return;
    if (el.paused) {
      // Fora do trecho cortado (ex.: playhead deixado depois do corte) — volta pro início dele antes de tocar.
      if (el.currentTime < cortarInicioSegundos || (cortarFimSegundos !== null && el.currentTime >= cortarFimSegundos)) {
        el.currentTime = cortarInicioSegundos;
      }
      el.currentTime = pularCortesInternos(el.currentTime, cortesInternos);
      el.play();
    } else {
      el.pause();
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <video
        ref={videoRef}
        src={mediaUrl}
        className="w-full max-w-[280px] rounded-lg border bg-black"
        style={{ aspectRatio: '9 / 16' }}
        playsInline
        onPlay={() => { setTocando(true); onTocandoChange?.(true); }}
        onPause={() => { setTocando(false); onTocandoChange?.(false); }}
        onTimeUpdate={(e) => {
          const el = e.currentTarget;
          if (cortarFimSegundos !== null && el.currentTime >= cortarFimSegundos) {
            el.pause();
            el.currentTime = cortarFimSegundos;
          } else if (el.currentTime < cortarInicioSegundos) {
            // O início do corte pode ter avançado pra depois do ponto onde o
            // vídeo está tocando agora (arrastaram a alça durante a
            // reprodução) — sem isso ele continuava passando por um trecho
            // que a régua já mostra como "fora do corte".
            el.currentTime = cortarInicioSegundos;
          } else {
            const semCorte = pularCortesInternos(el.currentTime, cortesInternos);
            if (semCorte !== el.currentTime) el.currentTime = semCorte;
          }
          onTempoAtualChange(el.currentTime);
        }}
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
