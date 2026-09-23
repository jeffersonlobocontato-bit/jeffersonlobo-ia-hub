import { useEffect, useRef } from 'react';
import { type TrilhaSonoraConfig, type TimelineConfig, volumeComFade, duracaoEfetivaTimeline } from '@/types/videoEditor';

interface Props {
  trilha: TrilhaSonoraConfig;
  timeline: TimelineConfig; // o fade é relativo ao trecho cortado (o vídeo final), não à gravação bruta inteira
  tempoAtual: number;
  tocando: boolean; // segue o play/pause do vídeo principal, não tem controle próprio
}

/**
 * Etapa 7 da timeline: elemento de áudio escondido, sem controles próprios
 * — toca e pausa junto com o vídeo principal (`tocando`, vindo do
 * VideoPlayer) e o volume já sai calculado com o fade de entrada/saída
 * (volumeComFade). Não é um preview visual, é a trilha tocando de verdade
 * por cima do vídeo enquanto você revisa.
 */
export const VideoTrilhaSonoraPlayer = ({ trilha, timeline, tempoAtual, tocando }: Props) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const duracaoAudioRef = useRef(0);

  // Toca/pausa acompanhando o vídeo.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !trilha.ativa || !trilha.mediaUrl) return;
    if (tocando) el.play().catch(() => {}); else el.pause();
  }, [tocando, trilha.ativa, trilha.mediaUrl]);

  // Sincroniza o tempo — como a música pode ser mais curta que o vídeo, o
  // ponto real dentro do arquivo é o resto da divisão (module), pra ela dar
  // a volta sozinha em vez de parar no meio de um vídeo mais longo.
  useEffect(() => {
    const el = audioRef.current;
    if (!el || !trilha.ativa) return;
    const duracaoAudio = duracaoAudioRef.current;
    const alvo = duracaoAudio > 0 ? tempoAtual % duracaoAudio : tempoAtual;
    if (Math.abs(el.currentTime - alvo) > 0.35) el.currentTime = alvo;
    // O fade é do vídeo FINAL (depois do corte), não da gravação bruta —
    // tempo relativo ao início do corte, duração relativa ao trecho usado.
    // Sem isso, cortar o início do vídeo pra depois de onde o fade-in
    // deveria acontecer simplesmente cancelava o fade (o tempo já nascia
    // maior que o fadeInSegundos configurado).
    const tempoRelativo = Math.max(0, tempoAtual - timeline.cortarInicioSegundos);
    const duracaoEfetiva = duracaoEfetivaTimeline(timeline);
    el.volume = Math.max(0, Math.min(1, volumeComFade(trilha, tempoRelativo, duracaoEfetiva)));
  }, [tempoAtual, trilha, timeline]);

  if (!trilha.ativa || !trilha.mediaUrl) return null;

  return (
    <audio
      ref={audioRef}
      src={trilha.mediaUrl}
      loop
      onLoadedMetadata={(e) => { duracaoAudioRef.current = e.currentTarget.duration; }}
      className="hidden"
    />
  );
};
