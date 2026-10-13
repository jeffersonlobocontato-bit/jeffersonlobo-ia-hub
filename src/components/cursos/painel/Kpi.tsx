import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import { pct } from '@/lib/painelAcademia';

// Número em destaque com a variação contra o período anterior. A seta e o
// texto dizem a direção; a cor só reforça.
export default function Kpi({
  rotulo,
  valor,
  variacao,
  nota,
  inverso = false,
}: {
  rotulo: string;
  valor: string;
  variacao?: number | null;
  nota?: string;
  /** quando subir é ruim (ex.: reembolsos) */
  inverso?: boolean;
}) {
  const temVar = variacao !== undefined;
  const sobe = (variacao ?? 0) > 0.0005;
  const desce = (variacao ?? 0) < -0.0005;
  const bom = inverso ? desce : sobe;
  const ruim = inverso ? sobe : desce;
  return (
    <div className="pn-kpi">
      <span className="pn-kpi__rotulo">{rotulo}</span>
      <b className="pn-kpi__valor">{valor}</b>
      {temVar ? (
        <span className={`pn-kpi__var ${bom ? 'is-bom' : ruim ? 'is-ruim' : ''}`}>
          {variacao === null ? (
            <>novo no período</>
          ) : (
            <>
              {sobe ? <ArrowUpRight size={14} aria-hidden /> : desce ? <ArrowDownRight size={14} aria-hidden /> : <Minus size={14} aria-hidden />}
              {sobe ? '+' : ''}
              {pct(variacao ?? 0)} <small>vs. período anterior</small>
            </>
          )}
        </span>
      ) : null}
      {nota ? <span className="pn-kpi__nota">{nota}</span> : null}
    </div>
  );
}
