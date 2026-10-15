import { useEffect, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Barras } from './Graficos';
import { CANAIS, carregarAds, inteiro, ligarAnuncio, nomePagina, pct, razao, reais, reaisCurto, sincronizarAds, type AdsMetricas, type AdsResumo, type Canal, type Resumo } from '@/lib/painelAcademia';

const soma = (linhas: Resumo['canais'], filtro: (c: Canal) => boolean) =>
  linhas.filter((l) => filtro(l.canal as Canal)).reduce(
    (acc, l) => ({ sessoes: acc.sessoes + l.sessoes, leads: acc.leads + l.leads, vendas: acc.vendas + l.vendas, receita: acc.receita + Number(l.receita) }),
    { sessoes: 0, leads: 0, vendas: 0, receita: 0 },
  );

const n = (v: unknown) => Number(v) || 0;
const x = (v: number) => `${v.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x`;
const div = (a: number, b: number, f: (v: number) => string) => (b > 0 ? f(a / b) : '—');
const dataHora = (s: string | null | undefined) => (s ? new Date(s).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' }) : 'nunca');
const vazio: AdsMetricas = { spend: 0, impressions: 0, video_views: 0, thruplays: 0, link_clicks: 0, landing_page_views: 0 };

function CampanhasAds({ r, de, ate }: { r: Resumo; de: string; ate: string }) {
  const [ads, setAds] = useState<AdsResumo | null>(null);
  const [sinc, setSinc] = useState(false);
  const [msg, setMsg] = useState('');
  const carregar = () => carregarAds(de, ate).then(setAds);
  useEffect(() => { void carregar(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [de, ate]);

  const atualizar = async () => {
    setSinc(true); setMsg('');
    const res = await sincronizarAds();
    setSinc(false);
    if (!res.ok) setMsg(res.erro ?? 'Falhou');
    await carregar();
  };
  const ligar = async (id: string, utm: string) => { if (utm) { await ligarAnuncio(id, utm); await carregar(); } };

  const metaDe = (c: string) => ads?.campanhas.find((a) => a.campanha === c) ?? vazio;
  const nomes = Array.from(new Set([...r.campanhas.map((c) => c.campanha), ...(ads?.campanhas.map((c) => c.campanha) ?? [])]));
  const linhas = nomes.map((nome) => {
    const u = r.campanhas.find((c) => c.campanha === nome);
    const m = metaDe(nome);
    const spend = n(m.spend);
    return { nome, u, m, inv: spend > 0 ? spend : n(u?.investimento), fonte: spend > 0 ? 'Meta' : 'manual' };
  });
  const utms = Array.from(new Set([...(ads?.utms ?? []), ...r.campanhas.map((c) => c.campanha)]));
  const st = ads?.status;

  return (
    <>
      <section className="pn-cartao">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h3>Campanhas (utm_campaign)</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <small className="pn-nota">Meta Ads · última atualização: {dataHora(st?.last_ok_at)}</small>
            <button type="button" className="e-btn e-btn--fantasma e-btn--pequeno" onClick={atualizar} disabled={sinc}>
              <RefreshCw size={13} className={sinc ? 'e-gira' : ''} aria-hidden /> Atualizar agora
            </button>
          </div>
        </div>
        {msg || st?.last_error ? <p className="pn-aviso">Erro na última sincronização: {msg || st?.last_error}</p> : null}
        {linhas.length ? (
          <div className="pn-tabela-rola">
            <table className="pn-tabela">
              <thead>
                <tr><th>Campanha</th><th>Impressões</th><th>Visualiz. vídeo</th><th>Cliques no link</th><th>Visitas</th><th>CTR</th><th>Clique → visita</th><th>Custo/clique</th><th>Custo/visita</th><th>Leads</th><th>Vendas</th><th>Receita</th><th>Investimento</th><th>CPA</th><th>ROAS</th></tr>
              </thead>
              <tbody>
                {linhas.map(({ nome, u, m, inv, fonte }) => {
                  const vis = n(u?.sessoes), cl = n(m.link_clicks), imp = n(m.impressions), vendas = n(u?.vendas), rec = n(u?.receita);
                  return (
                    <tr key={nome}>
                      <td><b>{nome}</b><small>{[u?.origem, u?.meio].filter(Boolean).join(' · ')}</small></td>
                      <td>{imp ? inteiro(imp) : '—'}</td>
                      <td>{n(m.video_views) ? inteiro(n(m.video_views)) : '—'}</td>
                      <td>{cl ? inteiro(cl) : '—'}</td>
                      <td>{inteiro(vis)}</td>
                      <td>{imp ? pct(razao(cl, imp)) : '—'}</td>
                      <td>{cl ? pct(razao(vis, cl)) : '—'}</td>
                      <td>{n(m.spend) ? div(n(m.spend), cl, reais) : '—'}</td>
                      <td>{div(inv, vis, reais)}</td>
                      <td>{inteiro(n(u?.leads))}</td>
                      <td>{inteiro(vendas)}</td>
                      <td>{reais(rec)}</td>
                      <td>{inv ? <>{reais(inv)}<small>{fonte}</small></> : '—'}</td>
                      <td>{div(inv, vendas, reais)}</td>
                      <td>{div(rec, inv, x)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pn-vazio">Nenhuma campanha com UTM no período. Gere os links na aba Operação.</p>
        )}
      </section>

      <section className="pn-cartao">
        <h3>Por anúncio (Meta)</h3>
        {ads?.anuncios.length ? (
          <div className="pn-tabela-rola">
            <table className="pn-tabela">
              <thead>
                <tr><th>Anúncio</th><th>Campanha</th><th>Gasto</th><th>Impressões</th><th>Alcance (maior dia)</th><th>Visualiz. vídeo</th><th>ThruPlays</th><th>Cliques no link</th><th>Visitas à página</th><th>CTR</th><th>Custo/clique</th></tr>
              </thead>
              <tbody>
                {ads.anuncios.map((a) => (
                  <tr key={a.ad_id}>
                    <td><b>{a.label || a.ad_name || a.ad_id}</b><small>{a.active ? '● ativo' : '○ pausado'} · {a.ad_id}</small></td>
                    <td>{a.utm_campaign ?? 'sem campanha'}</td>
                    <td>{reais(n(a.spend))}</td>
                    <td>{inteiro(n(a.impressions))}</td>
                    <td>{inteiro(n(a.reach_max_dia))}</td>
                    <td>{inteiro(n(a.video_views))}</td>
                    <td>{inteiro(n(a.thruplays))}</td>
                    <td>{inteiro(n(a.link_clicks))}</td>
                    <td>{inteiro(n(a.landing_page_views))}</td>
                    <td>{pct(razao(n(a.link_clicks), n(a.impressions)))}</td>
                    <td>{div(n(a.spend), n(a.link_clicks), reais)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="pn-vazio">Sem dados do Meta no período. Depois de cadastrar a chave do Windsor, clique em "Atualizar agora".</p>
        )}
        <p className="pn-nota">Alcance não se soma entre dias nem entre anúncios; mostramos o maior alcance diário de cada anúncio.</p>
      </section>

      {ads?.sem_campanha.length ? (
        <section className="pn-cartao">
          <h3>Anúncios sem campanha</h3>
          <ul className="pn-links">
            {ads.sem_campanha.map((s) => (
              <li key={s.ad_id}>
                <span>{s.ad_name || s.label || s.ad_id}</span>
                <select defaultValue="" onChange={(e) => ligar(s.ad_id, e.target.value)} aria-label="Ligar à campanha">
                  <option value="" disabled>Ligar a utm_campaign…</option>
                  {utms.map((u) => <option key={u} value={u}>{u}</option>)}
                </select>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </>
  );
}

export default function AbaTrafego({ r, de, ate }: { r: Resumo; de: string; ate: string }) {
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

      <CampanhasAds r={r} de={de} ate={ate} />

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
