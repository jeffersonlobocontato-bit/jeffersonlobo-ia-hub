import { Barras } from './Graficos';
import { CANAIS, inteiro, nomePagina, pct, razao, reais, reaisCurto, type Canal, type Resumo } from '@/lib/painelAcademia';

const soma = (linhas: Resumo['canais'], filtro: (c: Canal) => boolean) =>
  linhas.filter((l) => filtro(l.canal as Canal)).reduce(
    (acc, l) => ({ sessoes: acc.sessoes + l.sessoes, leads: acc.leads + l.leads, vendas: acc.vendas + l.vendas, receita: acc.receita + Number(l.receita) }),
    { sessoes: 0, leads: 0, vendas: 0, receita: 0 },
  );

export default function AbaTrafego({ r }: { r: Resumo }) {
  const organico = soma(r.canais, (c) => CANAIS[c]?.grupo === 'organico');
  const pago = soma(r.canais, (c) => c === 'pago');
  const direto = soma(r.canais, (c) => c === 'direto' || c === 'email');
  const inv = r.totais.investimento;
  const celular = r.totais.sessoes_celular;

  return (
    <div className="pn-aba">
      <section className="pn-tres">
        <div className="pn-cartao pn-grupo">
          <span className="pn-olho">Tráfego orgânico</span>
          <b>{inteiro(organico.sessoes)} visitas</b>
          <dl>
            <dt>Leads</dt><dd>{inteiro(organico.leads)}</dd>
            <dt>Vendas</dt><dd>{inteiro(organico.vendas)}</dd>
            <dt>Receita</dt><dd>{reais(organico.receita)}</dd>
            <dt>Conversão</dt><dd>{pct(razao(organico.vendas, organico.sessoes))}</dd>
          </dl>
          <p className="pn-nota">Busca, busca por IA, redes sociais e outros sites, sem anúncio.</p>
        </div>
        <div className="pn-cartao pn-grupo">
          <span className="pn-olho">Tráfego pago</span>
          <b>{inteiro(pago.sessoes)} visitas</b>
          <dl>
            <dt>Leads</dt><dd>{inteiro(pago.leads)}</dd>
            <dt>Vendas</dt><dd>{inteiro(pago.vendas)}</dd>
            <dt>Receita</dt><dd>{reais(pago.receita)}</dd>
            <dt>Investimento</dt><dd>{reais(inv)}</dd>
            <dt>Custo por venda (CAC)</dt><dd>{pago.vendas ? reais(inv / pago.vendas) : '—'}</dd>
            <dt>Custo por lead</dt><dd>{pago.leads ? reais(inv / pago.leads) : '—'}</dd>
            <dt>Retorno (ROAS)</dt><dd>{inv > 0 ? `${(pago.receita / inv).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x` : '—'}</dd>
          </dl>
        </div>
        <div className="pn-cartao pn-grupo">
          <span className="pn-olho">Direto e e-mail</span>
          <b>{inteiro(direto.sessoes)} visitas</b>
          <dl>
            <dt>Leads</dt><dd>{inteiro(direto.leads)}</dd>
            <dt>Vendas</dt><dd>{inteiro(direto.vendas)}</dd>
            <dt>Receita</dt><dd>{reais(direto.receita)}</dd>
          </dl>
          <p className="pn-nota">WhatsApp e apps costumam chegar como "direto". Use links com UTM (aba Operação) para saber de onde veio.</p>
        </div>
      </section>

      <section className="pn-cartao">
        <h3>Canais</h3>
        <div className="pn-tabela-rola">
          <table className="pn-tabela">
            <thead>
              <tr><th>Canal</th><th>Visitas</th><th>Leads</th><th>Vendas</th><th>Receita</th><th>Conversão</th></tr>
            </thead>
            <tbody>
              {[...r.canais].sort((x, y) => y.sessoes - x.sessoes).map((c) => (
                <tr key={c.canal}>
                  <td><b>{CANAIS[c.canal as Canal]?.nome ?? c.canal}</b><small>{CANAIS[c.canal as Canal]?.ajuda}</small></td>
                  <td>{inteiro(c.sessoes)}</td>
                  <td>{inteiro(c.leads)}</td>
                  <td>{inteiro(c.vendas)}</td>
                  <td>{reais(Number(c.receita))}</td>
                  <td>{pct(razao(c.vendas, c.sessoes))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="pn-cartao">
        <h3>Campanhas (utm_campaign)</h3>
        {r.campanhas.length ? (
          <div className="pn-tabela-rola">
            <table className="pn-tabela">
              <thead>
                <tr><th>Campanha</th><th>Origem · meio</th><th>Visitas</th><th>Leads</th><th>Vendas</th><th>Receita</th><th>Investimento</th><th>ROAS</th></tr>
              </thead>
              <tbody>
                {r.campanhas.map((c) => (
                  <tr key={c.campanha}>
                    <td><b>{c.campanha}</b></td>
                    <td>{[c.origem, c.meio].filter(Boolean).join(' · ') || '—'}</td>
                    <td>{inteiro(c.sessoes)}</td>
                    <td>{inteiro(c.leads)}</td>
                    <td>{inteiro(c.vendas)}</td>
                    <td>{reais(Number(c.receita))}</td>
                    <td>{Number(c.investimento) ? reais(Number(c.investimento)) : '—'}</td>
                    <td>{Number(c.investimento) ? `${(Number(c.receita) / Number(c.investimento)).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x` : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pn-vazio">Nenhuma campanha com UTM no período. Gere os links na aba Operação.</p>
        )}
      </section>

      <section className="pn-tres">
        <div className="pn-cartao">
          <h3>Páginas mais vistas</h3>
          <Barras formato={inteiro} itens={r.paginas.map((p) => ({ rotulo: nomePagina(p.caminho), ajuda: p.caminho, valor: Number(p.visualizacoes), extra: `${inteiro(p.sessoes)} visitas` }))} />
        </div>
        <div className="pn-cartao">
          <h3>Sites que mandam visitas</h3>
          {r.referencias.length ? (
            <Barras formato={inteiro} itens={r.referencias.map((x) => ({ rotulo: x.dominio, valor: Number(x.sessoes) }))} />
          ) : (
            <p className="pn-vazio">Nenhum site de origem no período.</p>
          )}
        </div>
        <div className="pn-cartao">
          <h3>Dispositivos</h3>
          <Barras
            formato={inteiro}
            itens={[
              { rotulo: 'Celular', valor: celular, extra: pct(razao(celular, r.totais.sessoes)) },
              { rotulo: 'Computador e tablet', valor: Math.max(0, r.totais.sessoes - celular), extra: pct(razao(r.totais.sessoes - celular, r.totais.sessoes)) },
            ]}
          />
          <p className="pn-nota">Receita total no período: {reaisCurto(r.totais.receita)}.</p>
        </div>
      </section>
    </div>
  );
}
