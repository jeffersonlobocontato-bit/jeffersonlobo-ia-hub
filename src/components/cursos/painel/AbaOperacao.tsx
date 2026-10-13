import { lazy, Suspense, useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Check,
  Copy,
  CreditCard,
  ExternalLink,
  GraduationCap,
  Link2,
  Loader2,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
  AlertTriangle,
} from 'lucide-react';
import { db } from '@/lib/cursos';
import { dataHora } from '@/lib/painelAcademia';
import { POCKETS } from '@/content/cursos/pockets';

const AdminCursosTab = lazy(() => import('@/components/admin/AdminCursosTab'));

type Estado = 'ok' | 'falta' | 'aviso' | 'checando';
type Item = { id: string; nome: string; estado: Estado; detalhe: string; acao?: string };

const URL_SUPA = import.meta.env.VITE_SUPABASE_URL as string;
const CHAVE = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function tabelaExiste(tabela: string) {
  const { error } = await db.from(tabela).select('*', { count: 'exact', head: true });
  if (!error) return true;
  return !(error.code === 'PGRST205' || /does not exist|Could not find/.test(error.message ?? ''));
}

async function chamarFuncao(nome: string): Promise<{ publicada: boolean; status?: number; texto?: string }> {
  try {
    const r = await fetch(`${URL_SUPA}/functions/v1/${nome}`, {
      method: 'POST',
      headers: { apikey: CHAVE, Authorization: `Bearer ${CHAVE}`, 'Content-Type': 'application/json' },
      body: '{}',
    });
    const texto = await r.text();
    if (r.status === 404 && /not found|NOT_FOUND/i.test(texto)) return { publicada: false, status: 404 };
    return { publicada: true, status: r.status, texto };
  } catch {
    // função que não existe não responde ao CORS: o navegador acusa falha de rede
    return { publicada: false };
  }
}

async function checarTudo(): Promise<Item[]> {
  const [cursos, pedidos, leads, invest, painel, checkout, webhook, material, tutor, email] = await Promise.all([
    tabelaExiste('curso_acessos'),
    tabelaExiste('curso_pedidos'),
    tabelaExiste('academia_leads'),
    tabelaExiste('academia_investimentos'),
    db.rpc('painel_academia', { p_de: '2026-01-01', p_ate: '2026-01-01' }).then(({ error }) => !error || !/PGRST202|Could not find/.test(`${error.code} ${error.message}`)),
    chamarFuncao('mercadopago-checkout'),
    chamarFuncao('mercadopago-webhook'),
    chamarFuncao('curso-material'),
    chamarFuncao('curso-tutor'),
    chamarFuncao('send-transactional-email'),
  ]);

  let ultimoAviso: string | null = null;
  if (pedidos) {
    const { data } = await db.from('pagamento_eventos').select('created_at').order('created_at', { ascending: false }).limit(1);
    ultimoAviso = data?.[0]?.created_at ?? null;
  }
  let aprovados = 0;
  if (pedidos) {
    const { count } = await db.from('curso_pedidos').select('id', { count: 'exact', head: true }).eq('status', 'aprovado');
    aprovados = count ?? 0;
  }

  const tokenOk = checkout.publicada && checkout.status !== 503;
  return [
    { id: 'cursos', nome: 'Tabelas de cursos e acessos', estado: cursos ? 'ok' : 'falta', detalhe: cursos ? 'Área do aluno, acessos e materiais prontos no banco.' : 'Faltam as migrações de cursos.', acao: cursos ? undefined: 'Aplicar no Lovable: 20261012190000_cursos_plataforma, 20261013010000_cursos_mercadopago, 20261013020000_cursos_marca_dagua e 20261013160000_cursos_pockets.' },
    { id: 'pedidos', nome: 'Tabela de pedidos', estado: pedidos ? 'ok' : 'falta', detalhe: pedidos ? `${aprovados} venda(s) aprovada(s) até hoje.` : 'Vem com a migração 20261013010000_cursos_mercadopago.' },
    { id: 'leads', nome: 'Leads do e-book', estado: leads ? 'ok' : 'falta', detalhe: leads ? 'Cadastro do e-book gravando.' : 'Aplicar a migração 20261013200000_academia_leads.' },
    { id: 'painel', nome: 'Painel e investimento', estado: painel && invest ? 'ok' : 'falta', detalhe: painel && invest ? 'Resumo e lançamentos de anúncio ativos.' : 'Aplicar a migração 20261013230000_academia_painel (depois das de cursos).' },
    {
      id: 'checkout',
      nome: 'Pagamento (Mercado Pago)',
      estado: !checkout.publicada ? 'falta' : tokenOk ? 'ok' : 'aviso',
      detalhe: !checkout.publicada ? 'A função mercadopago-checkout não está publicada.' : tokenOk ? 'Função publicada e com o Access Token configurado.' : 'Função publicada, mas falta o segredo MERCADOPAGO_ACCESS_TOKEN.',
      acao: !checkout.publicada ? 'Publicar a função mercadopago-checkout no Lovable.' : tokenOk ? undefined : 'Criar o segredo em Lovable › Cloud › Secrets.',
    },
    {
      id: 'webhook',
      nome: 'Aviso de pagamento (webhook)',
      estado: !webhook.publicada ? 'falta' : ultimoAviso ? 'ok' : 'aviso',
      detalhe: !webhook.publicada ? 'A função mercadopago-webhook não está publicada.' : ultimoAviso ? `Último aviso recebido em ${dataHora(ultimoAviso)}.` : 'Publicada, mas nenhum aviso do Mercado Pago chegou ainda.',
      acao: !webhook.publicada ? 'Publicar a função mercadopago-webhook.' : ultimoAviso ? undefined : 'Configurar o webhook no Mercado Pago e fazer a compra de teste.',
    },
    { id: 'material', nome: 'Download de materiais', estado: material.publicada ? 'ok' : 'falta', detalhe: material.publicada ? 'Função curso-material publicada.' : 'Publicar a função curso-material.' },
    { id: 'tutor', nome: 'Tutor IA das aulas', estado: tutor.publicada ? 'ok' : 'falta', detalhe: tutor.publicada ? 'Função curso-tutor publicada.' : 'Publicar a função curso-tutor.' },
    { id: 'email', nome: 'E-mails transacionais', estado: email.publicada ? 'ok' : 'falta', detalhe: email.publicada ? 'Envio de e-mail ativo (acesso liberado, e-book).' : 'Publicar a função send-transactional-email.' },
  ];
}

const ICONE: Record<Estado, JSX.Element> = {
  ok: <Check size={16} aria-hidden />,
  falta: <X size={16} aria-hidden />,
  aviso: <AlertTriangle size={16} aria-hidden />,
  checando: <Loader2 size={16} className="e-gira" aria-hidden />,
};
const NOME_ESTADO: Record<Estado, string> = { ok: 'Pronto', falta: 'Falta', aviso: 'Atenção', checando: 'Checando' };

// ---------- gerador de links com UTM ----------
const PAGINAS = [
  { id: '/cursos', nome: 'Vitrine da Academia' },
  { id: '/cursos#ebook-gratis', nome: 'E-book grátis (50 skills)' },
  { id: '/cursos/ilha', nome: 'Ilha de Edição completa' },
  ...POCKETS.map((p) => ({ id: p.pagina, nome: `Pocket ${p.numero} · ${p.nome}` })),
];
const MODELOS = [
  { id: 'bio', nome: 'Bio do Instagram', source: 'instagram', medium: 'social', campaign: 'bio' },
  { id: 'stories', nome: 'Stories', source: 'instagram', medium: 'social', campaign: 'stories' },
  { id: 'post', nome: 'Post ou reel', source: 'instagram', medium: 'social', campaign: 'post' },
  { id: 'whatsapp', nome: 'WhatsApp', source: 'whatsapp', medium: 'social', campaign: 'whatsapp' },
  { id: 'linkedin', nome: 'LinkedIn', source: 'linkedin', medium: 'social', campaign: 'post' },
  { id: 'meta', nome: 'Anúncio Meta', source: 'meta', medium: 'paid_social', campaign: '' },
  { id: 'google', nome: 'Anúncio Google', source: 'google', medium: 'cpc', campaign: '' },
  { id: 'email', nome: 'E-mail', source: 'email', medium: 'email', campaign: '' },
];
const limpaUtm = (s: string) => s.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9_-]+/g, '-').replace(/^-+|-+$/g, '');

function GeradorLinks() {
  const [pagina, setPagina] = useState(PAGINAS[0].id);
  const [modelo, setModelo] = useState(MODELOS[0].id);
  const m = MODELOS.find((x) => x.id === modelo)!;
  const [source, setSource] = useState(m.source);
  const [medium, setMedium] = useState(m.medium);
  const [campaign, setCampaign] = useState(m.campaign);
  const [content, setContent] = useState('');
  const [copiado, setCopiado] = useState(false);

  useEffect(() => {
    setSource(m.source);
    setMedium(m.medium);
    setCampaign(m.campaign);
  }, [m]);

  const link = useMemo(() => {
    const [caminho, ancora] = pagina.split('#');
    const q = new URLSearchParams();
    if (source) q.set('utm_source', limpaUtm(source));
    if (medium) q.set('utm_medium', limpaUtm(medium));
    if (campaign) q.set('utm_campaign', limpaUtm(campaign));
    if (content) q.set('utm_content', limpaUtm(content));
    return `https://jeffersonlobo.tech${caminho}${q.toString() ? `?${q}` : ''}${ancora ? `#${ancora}` : ''}`;
  }, [pagina, source, medium, campaign, content]);

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sem permissão de área de transferência: o link continua selecionável */
    }
  };

  return (
    <div className="pn-cartao pn-form" id="links">
      <h3>Gerar link rastreável</h3>
      <p className="pn-nota">Use estes links na bio, nos posts, no WhatsApp e nos anúncios. Sem eles, boa parte das visitas aparece como "direto".</p>
      <div className="pn-campos">
        <label>
          <span>Página</span>
          <select value={pagina} onChange={(e) => setPagina(e.target.value)}>{PAGINAS.map((p) => <option key={p.id} value={p.id}>{p.nome}</option>)}</select>
        </label>
        <label>
          <span>Onde vai o link</span>
          <select value={modelo} onChange={(e) => setModelo(e.target.value)}>{MODELOS.map((x) => <option key={x.id} value={x.id}>{x.nome}</option>)}</select>
        </label>
        <label><span>Origem (utm_source)</span><input value={source} onChange={(e) => setSource(e.target.value)} /></label>
        <label><span>Meio (utm_medium)</span><input value={medium} onChange={(e) => setMedium(e.target.value)} /></label>
        <label><span>Campanha (utm_campaign)</span><input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="ex.: lote2-ilha" /></label>
        <label><span>Variação (utm_content, opcional)</span><input value={content} onChange={(e) => setContent(e.target.value)} placeholder="ex.: video-bastidores" /></label>
      </div>
      <div className="pn-link-gerado">
        <code>{link}</code>
        <button type="button" className="e-btn e-btn--cheio" onClick={copiar}>{copiado ? <Check size={16} aria-hidden /> : <Copy size={16} aria-hidden />} {copiado ? 'Copiado' : 'Copiar'}</button>
      </div>
      <p className="pn-nota">Nos anúncios, use o meio <b>paid_social</b> (Meta) ou <b>cpc</b> (Google) e lance o gasto com a mesma campanha na aba Investimento.</p>
    </div>
  );
}

// ---------- aba ----------
export default function AbaOperacao({ irPara }: { irPara: (aba: string) => void }) {
  const [itens, setItens] = useState<Item[] | null>(null);
  const [checando, setChecando] = useState(false);
  const [alunos, setAlunos] = useState(false);

  const checar = async () => {
    setChecando(true);
    setItens((atual) => atual?.map((i) => ({ ...i, estado: 'checando' as Estado })) ?? null);
    setItens(await checarTudo());
    setChecando(false);
  };

  useEffect(() => {
    void checar();
  }, []);

  const prontos = itens?.filter((i) => i.estado === 'ok').length ?? 0;

  const cards = [
    { icone: <GraduationCap size={20} />, nome: 'Alunos, acessos e materiais', texto: 'Liberar acesso à mão, subir PDFs e instalador, configurar cada curso.', onClick: () => setAlunos((v) => !v) },
    { icone: <CreditCard size={20} />, nome: 'Vendas e pedidos', texto: 'Pedidos do período, status e receita por produto.', onClick: () => irPara('vendas') },
    { icone: <Users size={20} />, nome: 'Leads do e-book', texto: 'Cadastros, quem pediu para sair e exportação para remarketing.', onClick: () => irPara('leads') },
    { icone: <Megaphone size={20} />, nome: 'Investimento em anúncios', texto: 'Lançar gastos por campanha e ver custo por venda e ROAS.', onClick: () => irPara('investimento') },
    { icone: <BarChart3 size={20} />, nome: 'Tráfego', texto: 'Orgânico, pago e direto; campanhas, páginas e sites de origem.', onClick: () => irPara('trafego') },
    { icone: <Link2 size={20} />, nome: 'Links rastreáveis', texto: 'Gerar links com UTM para bio, posts, WhatsApp e anúncios.', onClick: () => document.getElementById('links')?.scrollIntoView({ behavior: 'smooth' }) },
  ];

  const externos = [
    { nome: 'Mercado Pago · atividades', url: 'https://www.mercadopago.com.br/activities' },
    { nome: 'Mercado Pago · integrações', url: 'https://www.mercadopago.com.br/developers/panel/app' },
    { nome: 'Lovable · projetos', url: 'https://lovable.dev/projects' },
    { nome: 'GitHub · repositório do site', url: 'https://github.com/jeffersonlobocontato-bit/jeffersonlobo-ia-hub' },
    { nome: 'Google Search Console', url: 'https://search.google.com/search-console' },
    { nome: 'Gerenciador de Anúncios da Meta', url: 'https://adsmanager.facebook.com/' },
    { nome: 'Google Ads', url: 'https://ads.google.com/' },
    { nome: 'Admin geral do site', url: '/admin' },
  ];

  const paginas = [
    { nome: 'Vitrine', url: '/cursos' },
    { nome: 'Ilha de Edição', url: '/cursos/ilha' },
    ...POCKETS.map((p) => ({ nome: `Pocket ${p.numero}`, url: p.pagina })),
    { nome: 'Área do aluno', url: '/cursos/entrar' },
    { nome: 'Termos de uso', url: '/cursos/termos' },
    { nome: 'Privacidade', url: '/cursos/privacidade' },
  ];

  return (
    <div className="pn-aba">
      <section className="pn-cards" aria-label="Acessos da operação">
        {cards.map((c) => (
          <button key={c.nome} type="button" className="pn-card-acesso" onClick={c.onClick}>
            <span className="pn-card-acesso__icone" aria-hidden>{c.icone}</span>
            <b>{c.nome}</b>
            <span>{c.texto}</span>
          </button>
        ))}
      </section>

      {alunos ? (
        <section className="pn-cartao pn-ferramenta dark">
          <div className="pn-cab-cartao">
            <h3>Alunos, acessos e materiais</h3>
            <button type="button" className="e-btn e-btn--fantasma e-btn--pequeno" onClick={() => setAlunos(false)}>Fechar</button>
          </div>
          <Suspense fallback={<p className="pn-vazio">Carregando…</p>}>
            <AdminCursosTab dentroDoPainel />
          </Suspense>
        </section>
      ) : null}

      <section className="pn-duas">
        <div className="pn-cartao">
          <div className="pn-cab-cartao">
            <h3><ShieldCheck size={18} aria-hidden /> Status do sistema</h3>
            <button type="button" className="e-btn e-btn--fantasma e-btn--pequeno" onClick={checar} disabled={checando}>
              <RefreshCw size={14} className={checando ? 'e-gira' : ''} aria-hidden /> Checar de novo
            </button>
          </div>
          {itens ? <p className="pn-nota">{prontos} de {itens.length} itens prontos.</p> : null}
          <ul className="pn-status-lista">
            {(itens ?? []).map((i) => (
              <li key={i.id} className={`is-${i.estado}`}>
                <span className="pn-status-lista__icone">{ICONE[i.estado]}</span>
                <div>
                  <b>{i.nome} <small>{NOME_ESTADO[i.estado]}</small></b>
                  <span>{i.detalhe}</span>
                  {i.acao ? <em>{i.acao}</em> : null}
                </div>
              </li>
            ))}
            {!itens ? <li className="is-checando"><span className="pn-status-lista__icone">{ICONE.checando}</span><div><b>Checando…</b></div></li> : null}
          </ul>
          <p className="pn-nota">Os segredos (Access Token e assinatura do webhook) ficam em Lovable › Cloud › Secrets. Nunca cole esses valores em conversas.</p>
        </div>

        <div className="pn-cartao">
          <h3><BookOpen size={18} aria-hidden /> Páginas e ferramentas</h3>
          <ul className="pn-links pn-links--duas">
            {paginas.map((p) => (
              <li key={p.url}><a href={p.url} target="_blank" rel="noopener">{p.nome} <ExternalLink size={13} aria-hidden /></a></li>
            ))}
          </ul>
          <ul className="pn-links">
            {externos.map((x) => (
              <li key={x.url}><a href={x.url} target="_blank" rel="noopener">{x.nome} <ExternalLink size={13} aria-hidden /></a></li>
            ))}
          </ul>
        </div>
      </section>

      <GeradorLinks />
    </div>
  );
}
