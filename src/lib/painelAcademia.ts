import { db } from '@/lib/cursos';

// Dados e formatos do painel da Academia (/cursos/painel). O resumo vem
// pronto do banco (função painel_academia, só admin); pedidos, leads e
// investimento são lidos direto das tabelas, também só por admin (RLS).

export type Totais = {
  sessoes: number;
  visualizacoes: number;
  sessoes_venda: number;
  leads: number;
  pedidos_criados: number;
  vendas: number;
  receita: number;
  reembolsos: number;
  valor_reembolsado: number;
  investimento: number;
  sessoes_celular: number;
};
export type Anterior = Pick<Totais, 'sessoes' | 'leads' | 'vendas' | 'receita' | 'investimento'>;
export type Dia = { dia: string; sessoes: number; leads: number; vendas: number; receita: number };
export type LinhaCanal = { canal: Canal; sessoes: number; leads: number; vendas: number; receita: number };
export type LinhaCampanha = {
  campanha: string;
  origem: string | null;
  meio: string | null;
  sessoes: number;
  leads: number;
  vendas: number;
  receita: number;
  investimento: number;
};
export type Resumo = {
  periodo: { de: string; ate: string; dias: number };
  totais: Totais;
  anterior: Anterior;
  serie: Dia[];
  canais: LinhaCanal[];
  campanhas: LinhaCampanha[];
  paginas: { caminho: string; visualizacoes: number; sessoes: number }[];
  referencias: { dominio: string; sessoes: number }[];
  produtos: { produto: string; vendas: number; receita: number }[];
  investimento_canal: { canal: string; investimento: number }[];
};

export type Canal = 'busca' | 'ia' | 'social' | 'referencia' | 'email' | 'pago' | 'direto' | 'outros';

export const CANAIS: Record<Canal, { nome: string; grupo: 'organico' | 'pago' | 'direto' | 'email'; ajuda: string }> = {
  busca: { nome: 'Busca orgânica', grupo: 'organico', ajuda: 'Google, Bing e outros buscadores, sem anúncio.' },
  ia: { nome: 'Busca por IA', grupo: 'organico', ajuda: 'ChatGPT, Perplexity, Gemini e outros assistentes.' },
  social: { nome: 'Redes sociais', grupo: 'organico', ajuda: 'Instagram, LinkedIn, YouTube e WhatsApp, sem anúncio.' },
  referencia: { nome: 'Outros sites', grupo: 'organico', ajuda: 'Links em blogs, portais e parceiros.' },
  email: { nome: 'E-mail', grupo: 'email', ajuda: 'Links com utm_medium=email.' },
  pago: { nome: 'Anúncios', grupo: 'pago', ajuda: 'Meta, Google e outros: links com utm_medium=cpc/paid ou com gclid/fbclid.' },
  direto: { nome: 'Direto', grupo: 'direto', ajuda: 'Endereço digitado, favoritos ou apps que não mandam a origem.' },
  outros: { nome: 'Outras campanhas', grupo: 'organico', ajuda: 'Links com UTM fora das categorias acima.' },
};

export const NOMES_PRODUTO: Record<string, string> = {
  ilha: 'Ilha de Edição completa',
  'pocket-configurar': 'Pocket 1 · Configurei o Claude errado',
  'pocket-voz': 'Pocket 2 · Claude com a sua voz',
  'pocket-postagem': 'Pocket 3 · Do roteiro à postagem',
};

/** Forma de pagamento como o Mercado Pago manda (payment_type_id ou payment_method_id). */
export const FORMAS_PAGAMENTO: Record<string, string> = {
  bank_transfer: 'Pix',
  pix: 'Pix',
  credit_card: 'Cartão de crédito',
  debit_card: 'Cartão de débito',
  prepaid_card: 'Cartão pré-pago',
  ticket: 'Boleto',
  bolbradesco: 'Boleto',
  pec: 'Boleto',
  account_money: 'Saldo Mercado Pago',
  digital_currency: 'Linha de crédito MP',
};
export const formaPagamento = (f: string | null, parcelas: number | null) =>
  f ? `${FORMAS_PAGAMENTO[f] ?? f}${parcelas && parcelas > 1 ? ` · ${parcelas}x` : ''}` : '—';

/** Nome legível das páginas da Academia (o caminho vai no título). */
export function nomePagina(caminho: string) {
  const fixo: Record<string, string> = {
    '/cursos': 'Vitrine',
    '/cursos/ilha': 'Ilha de Edição (venda)',
    '/cursos/termos': 'Termos de uso',
    '/cursos/privacidade': 'Privacidade',
    '/livro-del': 'Livro DEL',
  };
  if (fixo[caminho]) return fixo[caminho];
  const pocket = caminho.match(/^\/cursos\/pocket\/(.+)$/);
  if (pocket) {
    const nomes: Record<string, string> = {
      'configurei-o-claude-errado': 'Pocket 1 · Configurei o Claude errado',
      'claude-com-a-sua-voz': 'Pocket 2 · Claude com a sua voz',
      'do-roteiro-a-postagem': 'Pocket 3 · Do roteiro à postagem',
    };
    return nomes[pocket[1]] ?? `Pocket · ${pocket[1]}`;
  }
  return caminho;
}
/** Dia de uma coluna DATE (aceita '2026-10-13' ou ISO completo). */
export const diaBR = (d: string) => String(d).slice(0, 10).split('-').reverse().join('/');
/** Valor do eixo do gráfico de dinheiro, sem centavos. */
export const reaisEixo = (v: number) => `R$ ${num.format(Math.round(Number(v) || 0))}`;

export const STATUS_PEDIDO: Record<string, { nome: string; tom: 'ok' | 'espera' | 'ruim' | 'neutro' }> = {
  aprovado: { nome: 'Aprovado', tom: 'ok' },
  pendente: { nome: 'Pendente', tom: 'espera' },
  criado: { nome: 'Abriu o pagamento', tom: 'neutro' },
  recusado: { nome: 'Recusado', tom: 'ruim' },
  cancelado: { nome: 'Cancelado', tom: 'neutro' },
  reembolsado: { nome: 'Reembolsado', tom: 'ruim' },
  contestado: { nome: 'Contestado', tom: 'ruim' },
  em_disputa: { nome: 'Em disputa', tom: 'ruim' },
};

export const CANAIS_INVESTIMENTO = [
  { id: 'meta', nome: 'Meta (Instagram e Facebook)' },
  { id: 'google', nome: 'Google Ads' },
  { id: 'youtube', nome: 'YouTube' },
  { id: 'tiktok', nome: 'TikTok' },
  { id: 'linkedin', nome: 'LinkedIn' },
  { id: 'outro', nome: 'Outro' },
] as const;

// ---------- período ----------
export type PeriodoId = '7' | '30' | '90' | 'mes' | 'mes-anterior';
export const PERIODOS: { id: PeriodoId; nome: string }[] = [
  { id: '7', nome: '7 dias' },
  { id: '30', nome: '30 dias' },
  { id: '90', nome: '90 dias' },
  { id: 'mes', nome: 'Este mês' },
  { id: 'mes-anterior', nome: 'Mês passado' },
];

const iso = (d: Date) => d.toISOString().slice(0, 10);
/** hoje no fuso de São Paulo, como data (meia-noite UTC do dia) */
export function hojeSP(agora = new Date()) {
  const s = agora.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' });
  return new Date(`${s}T00:00:00Z`);
}
export function intervalo(id: PeriodoId, agora = new Date()): { de: string; ate: string } {
  const hoje = hojeSP(agora);
  const menos = (n: number) => new Date(hoje.getTime() - n * 86400000);
  if (id === 'mes') return { de: iso(new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 1))), ate: iso(hoje) };
  if (id === 'mes-anterior') {
    const ini = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth() - 1, 1));
    const fim = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), 0));
    return { de: iso(ini), ate: iso(fim) };
  }
  return { de: iso(menos(Number(id) - 1)), ate: iso(hoje) };
}

// ---------- formatos ----------
const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
const brl0 = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
const num = new Intl.NumberFormat('pt-BR');
export const reais = (v: number) => brl.format(Number(v) || 0);
export const reaisCurto = (v: number) => (Math.abs(v) >= 1000 ? brl0.format(Number(v) || 0) : brl.format(Number(v) || 0));
export const inteiro = (v: number) => num.format(Number(v) || 0);
export const pct = (v: number | null) => {
  if (v == null || !Number.isFinite(v)) return '—';
  const x = v * 100;
  // abaixo de 10% a casa decimal importa (1,4% de conversão não é 1%)
  return `${x.toLocaleString('pt-BR', { minimumFractionDigits: Math.abs(x) < 10 && x !== 0 ? 1 : 0, maximumFractionDigits: 1 })}%`;
};
export const razao = (a: number, b: number) => (b > 0 ? a / b : null);
export const diaCurto = (isoDia: string) => {
  const [, m, d] = isoDia.split('-');
  return `${d}/${m}`;
};
export const dataHora = (iso: string) =>
  new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short', timeZone: 'America/Sao_Paulo' }).format(new Date(iso));

/** variação contra o período anterior; null quando não dá para comparar */
export const variacao = (atual: number, antes: number) => (antes > 0 ? (atual - antes) / antes : atual > 0 ? null : 0);

// ---------- leitura ----------
export type Falha = { tipo: 'sem-migracao' | 'sem-permissao' | 'erro'; mensagem: string };

const falhaDe = (e: { message?: string; code?: string } | null): Falha => {
  const m = e?.message ?? '';
  if (e?.code === 'PGRST202' || e?.code === 'PGRST205' || /does not exist|Could not find/.test(m)) return { tipo: 'sem-migracao', mensagem: m };
  if (/sem_permissao|permission denied/.test(m)) return { tipo: 'sem-permissao', mensagem: m };
  return { tipo: 'erro', mensagem: m || 'Erro desconhecido' };
};

export async function carregarResumo(de: string, ate: string): Promise<{ resumo?: Resumo; falha?: Falha }> {
  const { data, error } = await db.rpc('painel_academia', { p_de: de, p_ate: ate });
  if (error) return { falha: falhaDe(error) };
  const r = data as Resumo;
  const n = (v: unknown) => Number(v) || 0;
  // números do jsonb chegam como number; garante o tipo
  r.totais = Object.fromEntries(Object.entries(r.totais).map(([k, v]) => [k, n(v)])) as Totais;
  r.anterior = Object.fromEntries(Object.entries(r.anterior).map(([k, v]) => [k, n(v)])) as Anterior;
  return { resumo: r };
}

export type Pedido = {
  id: string;
  created_at: string;
  curso_slug: string;
  email: string;
  nome: string | null;
  valor: number;
  valor_pago: number | null;
  status: string;
  forma_pagamento: string | null;
  parcelas: number | null;
  origem?: Record<string, string> | null;
};

export async function carregarPedidos(de: string, ate: string): Promise<{ pedidos?: Pedido[]; falha?: Falha }> {
  const ini = new Date(`${de}T00:00:00-03:00`).toISOString();
  const fim = new Date(new Date(`${ate}T00:00:00-03:00`).getTime() + 86400000).toISOString();
  const { data, error } = await db
    .from('curso_pedidos')
    .select('*')
    .gte('created_at', ini)
    .lt('created_at', fim)
    .order('created_at', { ascending: false })
    .limit(500);
  if (error) return { falha: falhaDe(error) };
  return { pedidos: (data ?? []) as Pedido[] };
}

export type Investimento = { id: string; data: string; canal: string; campanha: string | null; valor: number; observacao: string | null };

export async function carregarInvestimentos(de: string, ate: string): Promise<{ itens?: Investimento[]; falha?: Falha }> {
  const { data, error } = await db
    .from('academia_investimentos')
    .select('*')
    .gte('data', de)
    .lte('data', ate)
    .order('data', { ascending: false });
  if (error) return { falha: falhaDe(error) };
  return { itens: (data ?? []) as Investimento[] };
}
