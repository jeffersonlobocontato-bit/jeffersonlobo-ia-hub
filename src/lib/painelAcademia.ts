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
  if (e?.code === 'PGRST202' || e?.code === 'PGRST205' || e?.code === '42703' || /does not exist|Could not find/.test(m)) return { tipo: 'sem-migracao', mensagem: m };
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
  pagamento_id?: string | null;
  aprovado_em?: string | null;
  comprador_doc?: string | null;
  comprador_nome?: string | null;
  nf_status?: NotaStatus | null;
  nf_numero?: string | null;
  nf_observacao?: string | null;
  nf_atualizada_em?: string | null;
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

// ---------- notas fiscais (NFS-e) ----------
// Enquanto a emissão é manual no Emissor Nacional, o painel lista as vendas
// aprovadas com os dados prontos para copiar, e o admin marca o que emitiu.

export type NotaStatus = 'pendente' | 'emitida' | 'cancelar' | 'cancelada' | 'dispensada';

export const STATUS_NOTA: Record<NotaStatus, { nome: string; tom: 'ok' | 'espera' | 'ruim' | 'neutro' }> = {
  pendente: { nome: 'A emitir', tom: 'espera' },
  emitida: { nome: 'Emitida', tom: 'ok' },
  cancelar: { nome: 'Cancelar nota', tom: 'ruim' },
  cancelada: { nome: 'Cancelada', tom: 'neutro' },
  dispensada: { nome: 'Dispensada', tom: 'neutro' },
};

export const EMISSOR_NACIONAL = 'https://www.nfse.gov.br/EmissorNacional';

/** Dias da garantia de reembolso (termos de uso). A nota é emitida depois dela, sem cruzar o mês. */
export const DIAS_GARANTIA = 7;

export type Garantia = { dentro: boolean; ate: Date; viraMes: boolean; diasRestantes: number };

/** Situação da garantia de uma venda, no fuso de São Paulo. */
export function garantiaDaVenda(p: Pedido, agora = new Date()): Garantia {
  const inicio = new Date(p.aprovado_em ?? p.created_at);
  const ate = new Date(inicio.getTime() + DIAS_GARANTIA * 86400000);
  const mes = (d: Date) => d.toLocaleDateString('en-CA', { timeZone: 'America/Sao_Paulo' }).slice(0, 7);
  const dentro = agora < ate;
  // a garantia termina em outro mês: emitir até o fim deste mês, mesmo em garantia
  const viraMes = dentro && mes(ate) !== mes(inicio);
  return { dentro, ate, viraMes, diasRestantes: Math.max(0, Math.ceil((ate.getTime() - agora.getTime()) / 86400000)) };
}

/** Pode emitir agora: fora da garantia, ou a garantia termina só no mês que vem (emite no mês da venda). */
export const liberadaParaEmitir = (p: Pedido, agora = new Date()) => {
  const g = garantiaDaVenda(p, agora);
  return !g.dentro || g.viraMes;
};

/** 12345678909 -> 123.456.789-09; 14 dígitos -> CNPJ formatado. */
export function documentoFormatado(doc: string | null | undefined) {
  const d = String(doc ?? '').replace(/\D/g, '');
  if (d.length === 11) return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  if (d.length === 14) return d.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
  return d;
}

/** Texto da descrição do serviço na nota. */
export function descricaoDaNota(p: Pedido) {
  const produto = NOMES_PRODUTO[p.curso_slug] ?? p.curso_slug;
  const tipo = p.curso_slug.startsWith('pocket') ? 'Tutorial digital (curso livre online)' : 'Curso livre online';
  return `${tipo}: ${produto}. Acesso individual à área do aluno em jeffersonlobo.tech/cursos. Pedido ${p.id.slice(0, 8)}${p.pagamento_id ? `, pagamento Mercado Pago ${p.pagamento_id}` : ''}.`;
}

/** Valor em formato de digitação no portal: 9,90 */
export const valorDigitavel = (v: number) => Number(v).toFixed(2).replace('.', ',');

export async function carregarNotasPendentes(): Promise<{ pedidos?: Pedido[]; falha?: Falha }> {
  const { data, error } = await db
    .from('curso_pedidos')
    .select('*')
    .in('nf_status', ['pendente', 'cancelar'])
    .order('created_at', { ascending: true })
    .limit(300);
  if (error) return { falha: falhaDe(error) };
  return { pedidos: (data ?? []) as Pedido[] };
}

export async function atualizarNota(p: {
  pedido: string;
  status: NotaStatus;
  numero?: string;
  observacao?: string;
  doc?: string;
  nome?: string;
}): Promise<string | null> {
  const { error } = await db.rpc('atualizar_nota_pedido', {
    p_pedido: p.pedido,
    p_status: p.status,
    p_numero: p.numero ?? null,
    p_observacao: p.observacao ?? null,
    p_doc: p.doc ?? null,
    p_nome: p.nome ?? null,
  });
  if (!error) return null;
  const m = error.message ?? '';
  if (/numero_obrigatorio/.test(m)) return 'Informe o número da nota.';
  if (/documento_invalido/.test(m)) return 'O CPF precisa ter 11 dígitos (ou o CNPJ, 14).';
  if (/sem_permissao/.test(m)) return 'Esta conta não é admin.';
  if (/Could not find|PGRST202/.test(m)) return 'Falta aplicar a migração das notas (20261014010000_notas_fiscais).';
  return m || 'Não consegui salvar.';
}
