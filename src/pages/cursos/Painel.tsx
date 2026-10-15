import { lazy, Suspense, useCallback, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ExternalLink, Loader2, RefreshCw } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { PERIODOS, carregarResumo, intervalo, type Falha, type PeriodoId, type Resumo } from '@/lib/painelAcademia';
import { marcarAdminSeNuncaDecidiu } from '@/lib/rastreio';
import AbaVisao from '@/components/cursos/painel/AbaVisao';
import AbaTrafego from '@/components/cursos/painel/AbaTrafego';
import AbaVendas from '@/components/cursos/painel/AbaVendas';
import AbaInvestimento from '@/components/cursos/painel/AbaInvestimento';
import AbaOperacao from '@/components/cursos/painel/AbaOperacao';
import '@/styles/escola.css';
import '@/styles/painel.css';

const AdminLeadsAcademia = lazy(() => import('@/components/admin/AdminLeadsAcademia'));

// Painel da Academia (/cursos/painel), só para admin (AdminRoute no App).
// Toda a operação dos cursos num lugar: números do período, tráfego orgânico
// e pago, vendas, leads, investimento em anúncios e os acessos do back-office.

const ABAS = [
  { id: 'visao', nome: 'Visão geral' },
  { id: 'trafego', nome: 'Tráfego' },
  { id: 'vendas', nome: 'Vendas' },
  { id: 'leads', nome: 'Leads' },
  { id: 'investimento', nome: 'Investimento' },
  { id: 'operacao', nome: 'Operação' },
] as const;
type AbaId = (typeof ABAS)[number]['id'];

const lerAba = (hash: string): AbaId => {
  const h = hash.replace('#', '') as AbaId;
  return ABAS.some((a) => a.id === h) ? h : 'visao';
};

export default function Painel() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [aba, setAba] = useState<AbaId>(() => lerAba(location.hash));
  const [periodo, setPeriodo] = useState<PeriodoId>(() => {
    try {
      return (localStorage.getItem('painel-academia-periodo') as PeriodoId) || '30';
    } catch {
      return '30';
    }
  });
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [falha, setFalha] = useState<Falha | null>(null);
  const [carregando, setCarregando] = useState(true);
  const { de, ate } = intervalo(periodo);

  const carregar = useCallback(async () => {
    setCarregando(true);
    const { resumo: r, falha: f } = await carregarResumo(de, ate);
    setResumo(r ?? null);
    setFalha(f ?? null);
    setCarregando(false);
  }, [de, ate]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  // quem abre o painel é o admin: este navegador deixa de contar nas
  // estatísticas (dá para desfazer na aba Operação)
  useEffect(() => {
    marcarAdminSeNuncaDecidiu();
  }, []);

  useEffect(() => {
    setAba(lerAba(location.hash));
  }, [location.hash]);

  const irPara = (id: string) => {
    navigate({ hash: id }, { replace: false });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mudarPeriodo = (id: PeriodoId) => {
    setPeriodo(id);
    try {
      localStorage.setItem('painel-academia-periodo', id);
    } catch {
      /* ignore */
    }
  };

  const textoPeriodo = `${de.split('-').reverse().join('/')} a ${ate.split('-').reverse().join('/')}`;
  const precisaResumo = aba !== 'operacao' && aba !== 'leads';

  return (
    <div className="escola painel">
      <Helmet>
        <title>Painel da Academia | jeffersonlobo.tech</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <header className="pn-topo">
        <div className="pn-topo__marca">
          <span className="e-selo__ponto" aria-hidden />
          <div>
            <b>Painel da Academia</b>
            <small>jeffersonlobo.tech · {user?.email}</small>
          </div>
        </div>
        <nav className="pn-abas" aria-label="Seções do painel">
          {ABAS.map((a) => (
            <a key={a.id} href={`#${a.id}`} className={aba === a.id ? 'is-ativa' : ''} aria-current={aba === a.id ? 'page' : undefined}>
              {a.nome}
            </a>
          ))}
        </nav>
        <div className="pn-topo__acoes">
          <Link to="/cursos" target="_blank" className="e-btn e-btn--fantasma e-btn--pequeno">Ver a vitrine <ExternalLink size={13} aria-hidden /></Link>
        </div>
      </header>

      <main className="pn-corpo">
        <div className="pn-barra">
          <div>
            <h1>{ABAS.find((a) => a.id === aba)?.nome}</h1>
            {precisaResumo ? <p>{textoPeriodo} · comparado com os {resumo?.periodo.dias ?? ''} dias anteriores</p> : aba === 'leads' ? <p>Todos os cadastros dos materiais gratuitos. O número de leads por período e por canal está em Visão geral e Tráfego.</p> : null}
          </div>
          {precisaResumo ? (
            <div className="pn-periodo" role="group" aria-label="Período">
              {PERIODOS.map((p) => (
                <button key={p.id} type="button" className={periodo === p.id ? 'is-ativo' : ''} onClick={() => mudarPeriodo(p.id)}>
                  {p.nome}
                </button>
              ))}
              <button type="button" className="pn-icone" onClick={carregar} title="Atualizar" aria-label="Atualizar os números">
                <RefreshCw size={15} className={carregando ? 'e-gira' : ''} />
              </button>
            </div>
          ) : null}
        </div>

        {aba === 'operacao' ? (
          <AbaOperacao irPara={irPara} />
        ) : aba === 'leads' ? (
          <div className="pn-aba">
            <section className="pn-cartao pn-ferramenta dark">
              <Suspense fallback={<p className="pn-vazio">Carregando…</p>}>
                <AdminLeadsAcademia />
              </Suspense>
            </section>
          </div>
        ) : falha ? (
          <div className="pn-cartao pn-aviso-grande">
            {falha.tipo === 'sem-migracao' ? (
              <>
                <h3>O painel ainda não está ligado ao banco</h3>
                <p>Falta aplicar no Lovable as migrações de cursos e a do painel (20261013230000_academia_painel.sql). A aba Operação mostra o que já está pronto e o que falta.</p>
                <button type="button" className="e-btn e-btn--cheio" onClick={() => irPara('operacao')}>Ver o status do sistema</button>
              </>
            ) : falha.tipo === 'sem-permissao' ? (
              <>
                <h3>Sem permissão</h3>
                <p>Esta conta não tem papel de administrador.</p>
              </>
            ) : (
              <>
                <h3>Não carregou os números</h3>
                <p>{falha.mensagem}</p>
                <button type="button" className="e-btn e-btn--cheio" onClick={carregar}>Tentar de novo</button>
              </>
            )}
          </div>
        ) : !resumo ? (
          <p className="pn-carregando"><Loader2 size={18} className="e-gira" aria-hidden /> Carregando os números…</p>
        ) : aba === 'visao' ? (
          <AbaVisao r={resumo} />
        ) : aba === 'trafego' ? (
          <AbaTrafego r={resumo} de={de} ate={ate} />
        ) : aba === 'vendas' ? (
          <AbaVendas r={resumo} de={de} ate={ate} />
        ) : aba === 'investimento' ? (
          <AbaInvestimento r={resumo} de={de} ate={ate} aoMudar={carregar} />
        ) : null}
      </main>
    </div>
  );
}
