import { useEffect, useState, type FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { db } from '@/lib/cursos';
import {
  CANAIS_INVESTIMENTO,
  carregarInvestimentos,
  diaBR,
  hojeSP,
  inteiro,
  reais,
  type Falha,
  type Investimento,
  type Resumo,
} from '@/lib/painelAcademia';

// Investimento em anúncios, lançado à mão: por dia (ou pelo primeiro dia do
// período pago), canal e campanha. A campanha tem de ser igual ao
// utm_campaign dos links do anúncio para o painel calcular o retorno.

const nomeCanal = (id: string) => CANAIS_INVESTIMENTO.find((c) => c.id === id)?.nome ?? id;

export default function AbaInvestimento({ r, de, ate, aoMudar }: { r: Resumo; de: string; ate: string; aoMudar: () => void }) {
  const [itens, setItens] = useState<Investimento[] | null>(null);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [data, setData] = useState(hojeSP().toISOString().slice(0, 10));
  const [canal, setCanal] = useState('meta');
  const [campanha, setCampanha] = useState('');
  const [valor, setValor] = useState('');
  const [obs, setObs] = useState('');
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState('');

  const carregar = () =>
    carregarInvestimentos(de, ate).then(({ itens: i, falha: f }) => {
      setItens(i ?? []);
      setFalha(f ?? null);
    });

  useEffect(() => {
    setItens(null);
    void carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [de, ate]);

  const salvar = async (ev: FormEvent) => {
    ev.preventDefault();
    setErro('');
    const v = Number(valor.replace(/\./g, '').replace(',', '.'));
    if (!Number.isFinite(v) || v < 0) return setErro('Confira o valor.');
    setSalvando(true);
    const { error } = await db.from('academia_investimentos').insert({
      data,
      canal,
      campanha: campanha.trim().toLowerCase() || null,
      valor: Math.round(v * 100) / 100,
      observacao: obs.trim() || null,
    });
    setSalvando(false);
    if (error) return setErro(error.message);
    setValor('');
    setObs('');
    await carregar();
    aoMudar();
  };

  const apagar = async (i: Investimento) => {
    const { error } = await db.from('academia_investimentos').delete().eq('id', i.id);
    if (error) return setErro(error.message);
    await carregar();
    aoMudar();
  };

  const campanhasConhecidas = Array.from(new Set(r.campanhas.map((c) => c.campanha))).slice(0, 20);
  const vendasPagas = r.canais.find((c) => c.canal === 'pago');

  return (
    <div className="pn-aba">
      <section className="pn-duas">
        <form className="pn-cartao pn-form" onSubmit={salvar}>
          <h3>Lançar investimento</h3>
          <div className="pn-campos">
            <label><span>Data</span><input type="date" value={data} onChange={(e) => setData(e.target.value)} required /></label>
            <label>
              <span>Canal</span>
              <select value={canal} onChange={(e) => setCanal(e.target.value)}>
                {CANAIS_INVESTIMENTO.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
            </label>
            <label>
              <span>Campanha (igual ao utm_campaign)</span>
              <input list="pn-campanhas" value={campanha} onChange={(e) => setCampanha(e.target.value)} placeholder="ex.: lote2-ilha" maxLength={120} />
              <datalist id="pn-campanhas">{campanhasConhecidas.map((c) => <option key={c} value={c} />)}</datalist>
            </label>
            <label><span>Valor (R$)</span><input inputMode="decimal" value={valor} onChange={(e) => setValor(e.target.value)} placeholder="150,00" required /></label>
            <label className="pn-campo-largo"><span>Observação (opcional)</span><input value={obs} onChange={(e) => setObs(e.target.value)} maxLength={300} placeholder="ex.: semana de 13 a 19/10" /></label>
          </div>
          {erro ? <p className="pn-aviso">{erro}</p> : null}
          <button className="e-btn e-btn--cheio" type="submit" disabled={salvando}><Plus size={16} aria-hidden /> {salvando ? 'Salvando…' : 'Lançar'}</button>
          <p className="pn-nota">Pode lançar por dia ou o total de uma semana na data de início. Os valores ficam só aqui no painel.</p>
        </form>

        <div className="pn-cartao">
          <h3>Resultado dos anúncios no período</h3>
          <dl className="pn-dl">
            <dt>Investido</dt><dd>{reais(r.totais.investimento)}</dd>
            <dt>Visitas de anúncio</dt><dd>{inteiro(vendasPagas?.sessoes ?? 0)}</dd>
            <dt>Leads de anúncio</dt><dd>{inteiro(vendasPagas?.leads ?? 0)}</dd>
            <dt>Vendas de anúncio</dt><dd>{inteiro(vendasPagas?.vendas ?? 0)}</dd>
            <dt>Receita de anúncio</dt><dd>{reais(Number(vendasPagas?.receita ?? 0))}</dd>
            <dt>Custo por venda</dt><dd>{vendasPagas?.vendas ? reais(r.totais.investimento / vendasPagas.vendas) : '—'}</dd>
            <dt>Retorno (ROAS)</dt><dd>{r.totais.investimento ? `${(Number(vendasPagas?.receita ?? 0) / r.totais.investimento).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x` : '—'}</dd>
          </dl>
          {r.investimento_canal.length ? (
            <ul className="pn-links">
              {r.investimento_canal.map((c) => (
                <li key={c.canal}><span>{nomeCanal(c.canal)}</span><small>{reais(Number(c.investimento))}</small></li>
              ))}
            </ul>
          ) : null}
        </div>
      </section>

      <section className="pn-cartao">
        <h3>Lançamentos do período</h3>
        {falha?.tipo === 'sem-migracao' ? (
          <p className="pn-aviso">A tabela de investimento ainda não existe. Aplique a migração do painel (aba Operação › Status do sistema).</p>
        ) : itens === null ? (
          <p className="pn-vazio">Carregando…</p>
        ) : itens.length ? (
          <div className="pn-tabela-rola">
            <table className="pn-tabela">
              <thead><tr><th>Data</th><th>Canal</th><th>Campanha</th><th>Valor</th><th>Observação</th><th /></tr></thead>
              <tbody>
                {itens.map((i) => (
                  <tr key={i.id}>
                    <td className="pn-num">{diaBR(i.data)}</td>
                    <td>{nomeCanal(i.canal)}</td>
                    <td>{i.campanha ?? '—'}</td>
                    <td className="pn-num">{reais(Number(i.valor))}</td>
                    <td>{i.observacao ?? ''}</td>
                    <td><button type="button" className="pn-icone" onClick={() => apagar(i)} title="Apagar lançamento" aria-label={`Apagar ${reais(Number(i.valor))} de ${diaBR(i.data)}`}><Trash2 size={15} /></button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pn-vazio">Nenhum investimento lançado no período.</p>
        )}
      </section>
    </div>
  );
}
