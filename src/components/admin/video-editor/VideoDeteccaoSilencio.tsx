import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Wand2 } from 'lucide-react';
import {
  type PalavraTranscrita, type CorteInterno, type SugestaoSilencio,
  detectarSilencios, criarCorteInterno, formatarTempoTimeline,
} from '@/types/videoEditor';

interface Props {
  palavras: PalavraTranscrita[];
  cortarInicioSegundos: number;
  cortarFimSegundos: number;
  onAplicar: (cortes: CorteInterno[]) => void;
}

const chaveSugestao = (s: SugestaoSilencio) => `${s.inicioSegundos.toFixed(2)}-${s.fimSegundos.toFixed(2)}`;

/**
 * "Modo automático" nº 1: em vez do usuário caçar pausa por pausa na régua,
 * a transcrição (que já tem timestamp por palavra) aponta os silêncios —
 * o usuário só revisa a lista e aprova o que quiser apagar de uma vez.
 * Continua sendo o mesmo mecanismo de "trechos apagados" (cortesInternos)
 * que o corte manual usa, só que a sugestão vem pronta.
 */
export const VideoDeteccaoSilencio = ({ palavras, cortarInicioSegundos, cortarFimSegundos, onAplicar }: Props) => {
  const sugestoes = useMemo(
    () => detectarSilencios(palavras, cortarInicioSegundos, cortarFimSegundos),
    [palavras, cortarInicioSegundos, cortarFimSegundos],
  );
  const [desmarcados, setDesmarcados] = useState<Set<string>>(new Set());

  if (sugestoes.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground">Nenhuma pausa longa encontrada na transcrição — a fala está sem respiros grandes pra sugerir corte.</p>
    );
  }

  const marcadas = sugestoes.filter((s) => !desmarcados.has(chaveSugestao(s)));
  const duracaoTotal = marcadas.reduce((soma, s) => soma + (s.fimSegundos - s.inicioSegundos), 0);

  const alternar = (chave: string) => setDesmarcados((prev) => {
    const novo = new Set(prev);
    if (novo.has(chave)) novo.delete(chave); else novo.add(chave);
    return novo;
  });

  return (
    <div className="space-y-2 rounded-md border p-3">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium">{sugestoes.length} pausa(s) encontrada(s) — {formatarTempoTimeline(duracaoTotal)} selecionado(s)</p>
      </div>
      <div className="max-h-32 space-y-1 overflow-y-auto">
        {sugestoes.map((s) => {
          const chave = chaveSugestao(s);
          const marcado = !desmarcados.has(chave);
          return (
            <label key={chave} className="flex items-center gap-2 text-xs">
              <input type="checkbox" checked={marcado} onChange={() => alternar(chave)} />
              {formatarTempoTimeline(s.inicioSegundos)} – {formatarTempoTimeline(s.fimSegundos)}
              <span className="text-muted-foreground">({formatarTempoTimeline(s.fimSegundos - s.inicioSegundos)})</span>
            </label>
          );
        })}
      </div>
      <Button
        size="sm"
        variant="outline"
        disabled={marcadas.length === 0}
        onClick={() => onAplicar(marcadas.map((s) => criarCorteInterno(s.inicioSegundos, s.fimSegundos)))}
      >
        <Wand2 className="mr-1 h-4 w-4" /> Apagar {marcadas.length} pausa(s) selecionada(s)
      </Button>
    </div>
  );
};
