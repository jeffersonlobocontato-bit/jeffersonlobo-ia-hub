import { useCallback, useEffect, useState, type FormEvent } from 'react';
import { Check, Copy, ExternalLink, FileText } from 'lucide-react';
import {
  EMISSOR_NACIONAL,
  NOMES_PRODUTO,
  STATUS_NOTA,
  atualizarNota,
  carregarNotasPendentes,
  dataHora,
  descricaoDaNota,
  documentoFormatado,
  reais,
  valorDigitavel,
  type Falha,
  type Pedido,
} from '@/lib/painelAcademia';

// Notas a emitir: cada venda aprovada aparece com os dados prontos para copiar
// no Emissor Nacional (gov.br/nfse). Depois de emitir, o admin marca aqui com o
// número. Venda reembolsada com nota emitida volta para a lista como "cancelar".

function Campo({ rotulo, valor, destaque = false }: { rotulo: string; valor: string; destaque?: boolean }) {
  const [copiado, setCopiado] = useState(false);
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(valor);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      /* sem permissão: o texto continua selecionável */
    }
  };
  return (
    <div className={`pn-copia${destaque ? ' is-destaque' : ''}`}>
      <span>{rotulo}</span>
      <b>{valor}</b>
      <button type="button" className="pn-icone" onClick={copiar} title={`Copiar ${rotulo.toLowerCase()}`} aria-label={`Copiar ${rotulo.toLowerCase()}`}>
        {copiado ? <Check size={15} /> : <Copy size={15} />}
      </button>
    </div>
  );
}

function ItemNota({ p, aoSalvar }: { p: Pedido; aoSalvar: () => void }) {
  const [numero, setNumero] = useState('');
  const [doc, setDoc] = useState('');
  const [nome, setNome] = useState('');
  const [erro, setErro] = useState('');
  const [salvando, setSalvando] = useState(false);
  const cancelar = p.nf_status === 'cancelar';
  const st = STATUS_NOTA[p.nf_status ?? 'pendente'];
  const data = p.aprovado_em ?? p.created_at;
  const nomeTomador = p.comprador_nome || p.nome || '';

  const salvar = async (dados: Parameters<typeof atualizarNota>[0]) => {
    setErro('');
    setSalvando(true);
    const e = await atualizarNota(dados);
    setSalvando(false);
    if (e) return setErro(e);
    aoSalvar();
  };

  const emitir = (ev: FormEvent) => {
    ev.preventDefault();
    void salvar({ pedido: p.id, status: 'emitida', numero });
  };

  const completar = (ev: FormEvent) => {
    ev.preventDefault();
    void salvar({ pedido: p.id, status: 'pendente', doc: doc || undefined, nome: nome || undefined });
  };

  return (
    <li className={`pn-nota-item${cancelar ? ' is-cancelar' : ''}`}>
      <div className="pn-nota-item__topo">
        <div>
          <b>{NOMES_PRODUTO[p.curso_slug] ?? p.curso_slug}</b>
          <small>
            {dataHora(data)} · {p.email}
          </small>
        </div>
        <span className={`pn-status is-${st.tom}`}>{st.nome}</span>
      </div>

      {cancelar ? (
        <>
          <p className="pn-nota-item__texto">
            Esta venda foi {p.status === 'contestado' ? 'contestada' : p.status === 'cancelado' ? 'cancelada' : 'reembolsada'}. Cancele a nota{' '}
            <b>nº {p.nf_numero}</b> no Emissor Nacional (motivo: serviço não prestado) e marque aqui.
          </p>
          <div className="pn-nota-item__acoes">
            <button type="button" className="e-btn e-btn--cheio e-btn--pequeno" disabled={salvando} onClick={() => salvar({ pedido: p.id, status: 'cancelada' })}>
              Marcar como cancelada
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="pn-copias">
            {p.comprador_doc ? <Campo rotulo={p.comprador_doc.length === 14 ? 'CNPJ do tomador' : 'CPF do tomador'} valor={documentoFormatado(p.comprador_doc)} destaque /> : null}
            {nomeTomador ? <Campo rotulo="Nome do tomador" valor={nomeTomador} /> : null}
            <Campo rotulo="E-mail do tomador" valor={p.email} />
            <Campo rotulo="Valor do serviço (R$)" valor={valorDigitavel(Number(p.valor_pago ?? p.valor))} destaque />
            <Campo rotulo="Competência" valor={new Date(data).toLocaleDateString('pt-BR', { timeZone: 'America/Sao_Paulo' })} />
            <Campo rotulo="Descrição do serviço" valor={descricaoDaNota(p)} />
          </div>

          {!p.comprador_doc || !nomeTomador ? (
            <form className="pn-nota-item__form" onSubmit={completar}>
              <p className="pn-nota">
                O Mercado Pago não informou {!p.comprador_doc && !nomeTomador ? 'o CPF e o nome' : !p.comprador_doc ? 'o CPF' : 'o nome'} desta compra. Veja no detalhe do pagamento
                {p.pagamento_id ? ` ${p.pagamento_id}` : ''} no Mercado Pago e complete aqui.
              </p>
              <div className="pn-campos">
                {!p.comprador_doc ? (
                  <label>
                    <span>CPF (ou CNPJ)</span>
                    <input inputMode="numeric" value={doc} onChange={(e) => setDoc(e.target.value)} placeholder="000.000.000-00" />
                  </label>
                ) : null}
                {!nomeTomador ? (
                  <label>
                    <span>Nome</span>
                    <input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={120} />
                  </label>
                ) : null}
              </div>
              <button type="submit" className="e-btn e-btn--fantasma e-btn--pequeno" disabled={salvando || (!doc && !nome)}>
                Salvar dados do comprador
              </button>
            </form>
          ) : null}

          <form className="pn-nota-item__acoes" onSubmit={emitir}>
            <label className="pn-nota-item__numero">
              <span>Nº da nota emitida</span>
              <input value={numero} onChange={(e) => setNumero(e.target.value)} placeholder="ex.: 15" maxLength={60} />
            </label>
            <button type="submit" className="e-btn e-btn--cheio e-btn--pequeno" disabled={salvando || !numero.trim()}>
              Marcar como emitida
            </button>
            <button
              type="button"
              className="pn-link-botao"
              disabled={salvando}
              onClick={() => salvar({ pedido: p.id, status: 'dispensada', observacao: 'Dispensada pelo admin no painel.' })}
            >
              Não emitir (dispensar)
            </button>
          </form>
        </>
      )}
      {erro ? <p className="pn-aviso">{erro}</p> : null}
    </li>
  );
}

export default function NotasAEmitir({ aoMudar }: { aoMudar: () => void }) {
  const [itens, setItens] = useState<Pedido[] | null>(null);
  const [falha, setFalha] = useState<Falha | null>(null);

  const carregar = useCallback(async () => {
    const r = await carregarNotasPendentes();
    setItens(r.pedidos ?? []);
    setFalha(r.falha ?? null);
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const depoisDeSalvar = () => {
    void carregar();
    aoMudar();
  };

  const total = (itens ?? []).reduce((s, p) => s + (p.nf_status === 'pendente' ? Number(p.valor_pago ?? p.valor) : 0), 0);

  return (
    <section className="pn-cartao pn-notas" id="notas">
      <div className="pn-cab-cartao">
        <h3>
          <FileText size={18} aria-hidden /> Notas a emitir
          {itens?.length ? <span className="pn-contador">{itens.length}</span> : null}
        </h3>
        <a className="e-btn e-btn--fantasma e-btn--pequeno" href={EMISSOR_NACIONAL} target="_blank" rel="noopener">
          Abrir o Emissor Nacional <ExternalLink size={13} aria-hidden />
        </a>
      </div>
      <p className="pn-nota">
        Emita cada nota no portal do governo (login gov.br da AIV), copiando os dados abaixo, e marque aqui com o número. Simples Nacional: ISS não retido.
        Use o código de serviço indicado pelo contador.
      </p>

      {falha?.tipo === 'sem-migracao' ? (
        <p className="pn-aviso">Falta aplicar no Lovable a migração 20261014010000_notas_fiscais.sql.</p>
      ) : falha ? (
        <p className="pn-aviso">Não carregou as notas: {falha.mensagem}</p>
      ) : itens === null ? (
        <p className="pn-vazio">Carregando…</p>
      ) : itens.length ? (
        <>
          {total > 0 ? <p className="pn-nota">Total a emitir: <b>{reais(total)}</b> em {itens.filter((p) => p.nf_status === 'pendente').length} nota(s).</p> : null}
          <ul className="pn-notas-lista">
            {itens.map((p) => (
              <ItemNota key={`${p.id}-${p.nf_status}`} p={p} aoSalvar={depoisDeSalvar} />
            ))}
          </ul>
        </>
      ) : (
        <p className="pn-vazio">Nenhuma nota pendente. Cada venda aprovada aparece aqui automaticamente.</p>
      )}
    </section>
  );
}
