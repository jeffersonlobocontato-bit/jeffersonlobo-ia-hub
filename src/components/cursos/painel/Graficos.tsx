import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { diaCurto } from '@/lib/painelAcademia';

// Gráficos do painel: uma série por gráfico (nunca dois eixos), traço fino,
// grade discreta e tooltip com o valor exato. Cor única da Academia, porque
// cada gráfico mede uma coisa só; quem diz o que é a série é o título.

const COR = '#2dd4bf';
const EIXO = '#8a8e95';
const GRADE = 'rgba(255,255,255,0.06)';

type Ponto = { dia: string; valor: number };

function Dica({ active, payload, label, formato }: { active?: boolean; payload?: { value: number }[]; label?: string; formato: (v: number) => string }) {
  if (!active || !payload?.length || !label) return null;
  return (
    <div className="pn-dica">
      <span>{diaCurto(label)}</span>
      <b>{formato(payload[0].value)}</b>
    </div>
  );
}

export function SerieDiaria({ dados, formato, eixo = formato, tipo = 'area', rotulo }: { dados: Ponto[]; formato: (v: number) => string; eixo?: (v: number) => string; tipo?: 'area' | 'barra'; rotulo: string }) {
  const intervaloX = dados.length > 45 ? Math.ceil(dados.length / 9) : dados.length > 16 ? Math.ceil(dados.length / 8) : 0;
  const vazio = dados.every((d) => !d.valor);
  return (
    <div className="pn-grafico" role="img" aria-label={`${rotulo} por dia`}>
      {vazio ? <p className="pn-vazio">Nenhum registro no período.</p> : null}
      <ResponsiveContainer width="100%" height={220}>
        {tipo === 'area' ? (
          <AreaChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="pn-area" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COR} stopOpacity={0.28} />
                <stop offset="100%" stopColor={COR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={GRADE} vertical={false} />
            <XAxis dataKey="dia" tickFormatter={diaCurto} interval={intervaloX} tick={{ fill: EIXO, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis allowDecimals={false} width={44} tick={{ fill: EIXO, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => eixo(v)} />
            <Tooltip content={<Dica formato={formato} />} cursor={{ stroke: 'rgba(255,255,255,0.25)', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="valor" stroke={COR} strokeWidth={2} fill="url(#pn-area)" dot={false} activeDot={{ r: 4, stroke: '#050505', strokeWidth: 2 }} />
          </AreaChart>
        ) : (
          <BarChart data={dados} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={GRADE} vertical={false} />
            <XAxis dataKey="dia" tickFormatter={diaCurto} interval={intervaloX} tick={{ fill: EIXO, fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis width={64} allowDecimals={false} tick={{ fill: EIXO, fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => eixo(v)} />
            <Tooltip content={<Dica formato={formato} />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
            <Bar dataKey="valor" fill={COR} radius={[4, 4, 0, 0]} maxBarSize={28} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

/** Barras horizontais em HTML: rótulo, barra e valor escrito (a cor não carrega o dado sozinha). */
export function Barras({ itens, formato }: { itens: { rotulo: string; valor: number; extra?: string; ajuda?: string }[]; formato: (v: number) => string }) {
  const max = Math.max(1, ...itens.map((i) => i.valor));
  return (
    <ul className="pn-barras">
      {itens.map((i) => (
        <li key={i.rotulo} title={i.ajuda}>
          <span className="pn-barras__rotulo">{i.rotulo}</span>
          <span className="pn-barras__trilho" aria-hidden>
            <span className="pn-barras__barra" style={{ width: `${Math.max(i.valor > 0 ? 2 : 0, (i.valor / max) * 100)}%` }} />
          </span>
          <span className="pn-barras__valor">
            {formato(i.valor)}
            {i.extra ? <small>{i.extra}</small> : null}
          </span>
        </li>
      ))}
    </ul>
  );
}
