import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Scissors, Trash2 } from 'lucide-react';
import { type CorteInterno, criarCorteInterno, formatarTempoTimeline } from '@/types/videoEditor';

interface Props {
  cortes: CorteInterno[];
  tempoAtual: number;
  cortarInicioSegundos: number;
  cortarFimSegundos: number;
  onAdicionar: (corte: CorteInterno) => void;
  onAlterar: (id: string, patch: Partial<CorteInterno>) => void;
  onRemover: (id: string) => void;
}

const DURACAO_PADRAO_SEGUNDOS = 1;
const TRECHO_MINIMO_SEGUNDOS = 0.2;

/**
 * Etapa "dividir/apagar trecho": em vez de recortar o arquivo em pedaços
 * separados, marca um trecho de dentro do corte principal como apagado — a
 * reprodução pula direto por cima dele (VideoPlayer + duracaoEfetivaTimeline
 * já tratam isso). "Apagar 1s aqui" cria o trecho a partir do playhead;
 * depois dá pra ajustar o início/fim exatos em cada linha.
 */
export const VideoTimelineCortesInternos = ({
  cortes, tempoAtual, cortarInicioSegundos, cortarFimSegundos, onAdicionar, onAlterar, onRemover,
}: Props) => {
  const apagarNoPlayhead = () => {
    const inicio = Math.max(cortarInicioSegundos, Math.min(tempoAtual, cortarFimSegundos - TRECHO_MINIMO_SEGUNDOS));
    const fim = Math.min(cortarFimSegundos, inicio + DURACAO_PADRAO_SEGUNDOS);
    if (fim - inicio < TRECHO_MINIMO_SEGUNDOS) return;
    onAdicionar(criarCorteInterno(inicio, fim));
  };

  return (
    <div className="w-full max-w-[280px] select-none space-y-2">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase text-muted-foreground">Trechos apagados</p>
        <Button size="sm" variant="outline" className="h-6 px-2 text-[10px]" onClick={apagarNoPlayhead}>
          <Scissors className="mr-1 h-3 w-3" /> Apagar aqui
        </Button>
      </div>
      {cortes.length === 0 ? (
        <p className="text-[11px] text-muted-foreground">Nenhum trecho apagado ainda. Posicione o playhead e clique em "Apagar aqui" pra remover um pedaço do meio do vídeo.</p>
      ) : (
        <div className="space-y-1.5">
          {cortes.map((c, i) => (
            <div key={c.id} className="flex items-center gap-1.5 rounded border p-1.5">
              <span className="w-4 shrink-0 font-mono text-[10px] text-muted-foreground">{i + 1}</span>
              <Input
                type="number" step={0.1} min={cortarInicioSegundos} max={c.fimSegundos - TRECHO_MINIMO_SEGUNDOS}
                value={c.inicioSegundos}
                onChange={(e) => onAlterar(c.id, { inicioSegundos: Math.max(cortarInicioSegundos, Math.min(Number(e.target.value), c.fimSegundos - TRECHO_MINIMO_SEGUNDOS)) })}
                className="h-6 w-16 text-[10px]"
              />
              <span className="text-[10px] text-muted-foreground">até</span>
              <Input
                type="number" step={0.1} min={c.inicioSegundos + TRECHO_MINIMO_SEGUNDOS} max={cortarFimSegundos}
                value={c.fimSegundos}
                onChange={(e) => onAlterar(c.id, { fimSegundos: Math.min(cortarFimSegundos, Math.max(Number(e.target.value), c.inicioSegundos + TRECHO_MINIMO_SEGUNDOS)) })}
                className="h-6 w-16 text-[10px]"
              />
              <span className="flex-1 text-right font-mono text-[10px] text-muted-foreground">
                {formatarTempoTimeline(c.fimSegundos - c.inicioSegundos)}
              </span>
              <Button size="sm" variant="ghost" className="h-6 w-6 shrink-0 p-0" onClick={() => onRemover(c.id)}>
                <Trash2 className="h-3 w-3 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
