import { type ClipeFundo, type TransicaoTipo, posicionarClipes } from '@/types/videoEditor';

interface Props {
  clipes: ClipeFundo[];
  duracaoTotalSegundos: number;
  onAlterarTransicao: (id: string, transicao: TransicaoTipo) => void;
}

// 'iris' fica de fora do ciclo — ver o comentário em TransicaoTipo (tipo
// existe, ainda não tem render/seletor implementado em lugar nenhum).
const PROXIMA: Record<TransicaoTipo, TransicaoTipo> = {
  corte: 'fusao', fusao: 'arrasto', arrasto: 'corte', iris: 'corte',
};
const RESUMO: Record<TransicaoTipo, { sigla: string; cor: string }> = {
  corte: { sigla: 'C', cor: 'bg-muted-foreground/30 text-foreground' },
  fusao: { sigla: 'F', cor: 'bg-sky-500 text-white' },
  arrasto: { sigla: 'A', cor: 'bg-violet-500 text-white' },
  iris: { sigla: 'I', cor: 'bg-muted-foreground/30 text-foreground' },
};

/**
 * Etapa 8 da timeline: um marcador por corte entre clipes de B-roll (o
 * `transicao` de cada clipe já existia desde a etapa 1 — só não tinha onde
 * ser visto/trocado além do formulário na aba Fundo, que foi removido em
 * favor disso). Clicar troca pro próximo tipo do ciclo — não tem seletor
 * separado pra caber no espaço de uma faixa.
 *
 * O primeiro clipe não tem marcador: não existe "clipe anterior" pra
 * transicionar dele.
 */
export const VideoTimelineTransicaoMarcadores = ({ clipes, duracaoTotalSegundos, onAlterarTransicao }: Props) => {
  if (clipes.length < 2 || duracaoTotalSegundos <= 0) return null;

  const posicoes = posicionarClipes(clipes).slice(1); // pula o primeiro clipe

  return (
    <div className="relative h-4 w-full max-w-[280px]">
      {posicoes.map(({ clipe, inicioSegundos }) => {
        const leftPct = (inicioSegundos / duracaoTotalSegundos) * 100;
        const info = RESUMO[clipe.transicao];
        return (
          <button
            key={clipe.id}
            type="button"
            onClick={() => onAlterarTransicao(clipe.id, PROXIMA[clipe.transicao])}
            className={`absolute top-0 flex h-4 w-4 -translate-x-1/2 items-center justify-center rounded-full text-[9px] font-bold ${info.cor}`}
            style={{ left: `${leftPct}%` }}
            title={`Transição: ${clipe.transicao} — clique pra trocar`}
          >
            {info.sigla}
          </button>
        );
      })}
    </div>
  );
};
