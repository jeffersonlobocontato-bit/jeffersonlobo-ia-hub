import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import Kpi from './Kpi';
import { Barras } from './Graficos';
import {
  CANAIS,
  NOMES_PRODUTO,
  STATUS_PEDIDO,
  carregarPedidos,
  dataHora,
  formaPagamento,
  inteiro,
  reais,
  type Canal,
  type Falha,
  type Pedido,
  type Resumo,
} from '@/lib/painelAcademia';

const canalDoPedido = (p: Pedido) => {
  const bruto = p.origem?.canal;
  const mapa: Record<string, Canal> = { paid: 'pago', organic: 'busca', ai: 'ia', social: 'social', email: 'email', referral: 'referencia', direct: 'direto' };
  const c = bruto ? mapa[bruto] ?? 'outros' : 'direto';
  return CANAIS[c].nome;
};

export default function AbaVendas({ r, de, ate }: { r: Resumo; de: string; ate: string }) {
  const [pedidos, setPedidos] = useState<Pedido[] | null>(null);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [filtro, setFiltro] = useState<'todos' | 'aprovado' | 'abertos' | 'problema'>('todos');

  useEffect(() => {
    let vivo = true;
    setPedidos(null);
    carregarPedidos(de, ate).then(({ pedidos: p, falha: f }) => {
      if (!vivo) return;
      setPedidos(p ?? []);
      setFalha(f ?? null);
    });
    return () => {
      vivo = false;
    };
  }, [de, ate]);

  const visiveis = useMemo(() => {
    const lista = pedidos ?? [];
    if (filtro === 'aprovado') return lista.filter((p) => p.status === 'aprovado');
    if (filtro === 'abertos') return lista.filter((p) => p.status === 'criado' || p.status === 'pendente');
    if (filtro === 'problema') return lista.filter((p) => ['recusado', 'reembolsado', 'contestado', 'em_disputa', 'cancelado'].includes(p.status));
    return lista;
  }, [pedidos, filtro]);

  const t = r.totais;
  const abertos = (pedidos ?? []).filter((p) => p.status === 'criado' || p.status === 'pendente').length;

  return (
    <div className="pn-aba">
      <section className="pn-kpis">
        <Kpi rotulo="Vendas aprovadas" valor={inteiro(t.vendas)} />
        <Kpi rotulo="Receita" valor={reais(t.receita)} />
        <Kpi rotulo="Ticket médio" valor={t.vendas ? reais(t.receita / t.vendas) : '—'} />
        <Kpi rotulo="Pagamentos em aberto" valor={inteiro(abertos)} nota="abriram e não concluíram" />
        <Kpi rotulo="Reembolsos" valor={inteiro(t.reembolsos)} nota={t.reembolsos ? `${reais(t.valor_reembolsado)} · inclui contestações` : 'inclui contestações'} />
      </section>

      <section className="pn-duas">
        <div className="pn-cartao">
          <h3>Receita por produto</h3>
          {r.produtos.length ? (
            <Barras formato={reais} itens={r.produtos.map((p) => ({ rotulo: NOMES_PRODUTO[p.produto] ?? p.produto, valor: Number(p.receita), extra: `${inteiro(p.vendas)} venda(s)` }))} />
          ) : (
            <p className="pn-vazio">Nenhuma venda aprovada no período.</p>
          )}
        </div>
        <div className="pn-cartao">
          <h3>Onde acompanhar</h3>
          <ul className="pn-links">
            <li><a href="https://www.mercadopago.com.br/activities" target="_blank" rel="noopener">Atividades no Mercado Pago <ExternalLink size={14} aria-hidden /></a><small>pagamentos, estornos e saldo</small></li>
            <li><a href="https://www.mercadopago.com.br/developers/panel/app" target="_blank" rel="noopener">Suas integrações (Mercado Pago) <ExternalLink size={14} aria-hidden /></a><small>credenciais e webhook</small></li>
            <li><a href="/admin" target="_blank" rel="noopener">Admin › Cursos <ExternalLink size={14} aria-hidden /></a><small>liberar acesso à mão e materiais</small></li>
          </ul>
          <p className="pn-nota">A nota fiscal de cada venda é emitida à parte, no emissor da prefeitura.</p>
        </div>
      </section>

      <section className="pn-cartao">
        <div className="pn-cab-cartao">
          <h3>Pedidos do período</h3>
          <div className="pn-filtros" role="group" aria-label="Filtrar pedidos">
            {(
              [
                ['todos', 'Todos'],
                ['aprovado', 'Aprovados'],
                ['abertos', 'Em aberto'],
                ['problema', 'Recusados e reembolsos'],
              ] as const
            ).map(([id, nome]) => (
              <button key={id} type="button" className={filtro === id ? 'is-ativo' : ''} onClick={() => setFiltro(id)}>
                {nome}
              </button>
            ))}
          </div>
        </div>
        {falha?.tipo === 'sem-migracao' ? (
          <p className="pn-aviso">A tabela de pedidos ainda não existe no banco. Aplique as migrações de cursos (aba Operação › Status do sistema).</p>
        ) : falha ? (
          <p className="pn-aviso">Não carregou os pedidos: {falha.mensagem}</p>
        ) : pedidos === null ? (
          <p className="pn-vazio">Carregando…</p>
        ) : visiveis.length ? (
          <div className="pn-tabela-rola">
            <table className="pn-tabela">
              <thead>
                <tr><th>Data</th><th>Produto</th><th>Comprador</th><th>Valor</th><th>Status</th><th>Pagamento</th><th>Canal</th></tr>
              </thead>
              <tbody>
                {visiveis.map((p) => {
                  const st = STATUS_PEDIDO[p.status] ?? { nome: p.status, tom: 'neutro' };
                  return (
                    <tr key={p.id}>
                      <td className="pn-num">{dataHora(p.created_at)}</td>
                      <td>{NOMES_PRODUTO[p.curso_slug] ?? p.curso_slug}</td>
                      <td><b>{p.nome ?? '—'}</b><small>{p.email}</small></td>
                      <td className="pn-num">{reais(Number(p.valor_pago ?? p.valor))}</td>
                      <td><span className={`pn-status is-${st.tom}`}>{st.nome}</span></td>
                      <td>{formaPagamento(p.forma_pagamento, p.parcelas)}</td>
                      <td>{canalDoPedido(p)}{p.origem?.utm_campaign ? <small>{p.origem.utm_campaign}</small> : null}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pn-vazio">Nenhum pedido neste filtro.</p>
        )}
      </section>
    </div>
  );
}
