import Kpi from './Kpi';
import { Barras, SerieDiaria } from './Graficos';
import { CANAIS, inteiro, pct, razao, reais, reaisCurto, reaisEixo, variacao, type Canal, type Resumo } from '@/lib/painelAcademia';

export default function AbaVisao({ r }: { r: Resumo }) {
  const t = r.totais;
  const a = r.anterior;
  const conv = razao(t.vendas, t.sessoes);
  const convAnt = razao(a.vendas, a.sessoes);
  const roas = razao(r.canais.find((c) => c.canal === 'pago')?.receita ?? 0, t.investimento);
  const funil = [
    { rotulo: 'Visitaram a Academia', valor: t.sessoes },
    { rotulo: 'Viram uma página de venda', valor: t.sessoes_venda },
    { rotulo: 'Abriram o pagamento', valor: t.pedidos_criados },
    { rotulo: 'Compraram', valor: t.vendas },
  ];

  return (
    <div className="pn-aba">
      <section className="pn-kpis" aria-label="Números do período">
        <Kpi rotulo="Visitas" valor={inteiro(t.sessoes)} variacao={variacao(t.sessoes, a.sessoes)} nota={`${inteiro(t.visualizacoes)} páginas vistas`} />
        <Kpi rotulo="Leads" valor={inteiro(t.leads)} variacao={variacao(t.leads, a.leads)} nota={`${pct(razao(t.leads, t.sessoes))} das visitas`} />
        <Kpi rotulo="Vendas" valor={inteiro(t.vendas)} variacao={variacao(t.vendas, a.vendas)} nota={t.reembolsos ? `${inteiro(t.reembolsos)} reembolso(s)` : undefined} />
        <Kpi rotulo="Receita" valor={reaisCurto(t.receita)} variacao={variacao(t.receita, a.receita)} nota={t.vendas ? `ticket médio ${reais(t.receita / t.vendas)}` : undefined} />
        <Kpi rotulo="Conversão" valor={pct(conv)} variacao={conv != null && convAnt ? (conv - convAnt) / convAnt : undefined} nota="vendas ÷ visitas" />
        <Kpi rotulo="Investimento" valor={reaisCurto(t.investimento)} variacao={variacao(t.investimento, a.investimento)} nota={roas != null ? `em anúncios · retorno ${roas.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}x (ROAS)` : 'em anúncios · lance na aba Investimento'} />
      </section>

      <section className="pn-duas">
        <div className="pn-cartao">
          <h3>Visitas por dia</h3>
          <SerieDiaria rotulo="Visitas" dados={r.serie.map((d) => ({ dia: d.dia, valor: d.sessoes }))} formato={inteiro} />
        </div>
        <div className="pn-cartao">
          <h3>Receita por dia</h3>
          <SerieDiaria rotulo="Receita" tipo="barra" dados={r.serie.map((d) => ({ dia: d.dia, valor: Number(d.receita) }))} formato={reais} eixo={reaisEixo} />
        </div>
      </section>

      <section className="pn-duas">
        <div className="pn-cartao">
          <h3>De onde vêm as visitas</h3>
          <Barras
            formato={inteiro}
            itens={[...r.canais]
              .sort((x, y) => y.sessoes - x.sessoes)
              .map((c) => ({
                rotulo: CANAIS[c.canal as Canal]?.nome ?? c.canal,
                valor: c.sessoes,
                ajuda: CANAIS[c.canal as Canal]?.ajuda,
                extra: c.vendas ? `${inteiro(c.vendas)} venda(s)` : c.leads ? `${inteiro(c.leads)} lead(s)` : undefined,
              }))}
          />
        </div>
        <div className="pn-cartao">
          <h3>Funil de venda</h3>
          <ol className="pn-funil">
            {funil.map((f, i) => {
              const base = funil[0].valor || 1;
              const anterior = i ? funil[i - 1].valor : null;
              return (
                <li key={f.rotulo}>
                  <div className="pn-funil__linha">
                    <span>{f.rotulo}</span>
                    <b>{inteiro(f.valor)}</b>
                  </div>
                  <span className="pn-funil__trilho" aria-hidden>
                    <span style={{ width: `${Math.max(f.valor ? 2 : 0, (f.valor / base) * 100)}%` }} />
                  </span>
                  {anterior != null ? <small>{pct(razao(f.valor, anterior))} da etapa anterior</small> : null}
                </li>
              );
            })}
          </ol>
          <p className="pn-nota">"Abriram o pagamento" conta os pedidos criados ao clicar em comprar, pagos ou não.</p>
        </div>
      </section>
    </div>
  );
}
