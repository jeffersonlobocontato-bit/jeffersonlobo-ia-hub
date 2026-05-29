// Utilitários do módulo de imprensa: normalização de telefone/email/strings
// e helpers para variáveis de mensagem.

export type PressContact = {
  id: string;
  regiao: string | null;
  focal: string | null;
  municipio: string | null;
  censo_ibge_2022: number | null;
  veiculo: string;
  meio: string | null;
  contato: string | null;
  cargo: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  endereco: string | null;
  site: string | null;
  tags: string[];
  opt_out: boolean;
  notas: string | null;
  created_at?: string;
  updated_at?: string;
};

/** Remove tudo que não é dígito e adiciona DDI 55 se faltar (10-15 dígitos esperados). */
export function normalizePhone(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  if (!str) return null;
  // remove notação científica do Excel (ex: 5.543398e+11)
  let digits: string;
  if (/^\d+(\.\d+)?e\+?\d+$/i.test(str)) {
    digits = Number(str).toFixed(0).replace(/\D/g, '');
  } else {
    digits = str.replace(/\D/g, '');
  }
  if (!digits) return null;
  // Adiciona DDI Brasil se faltar
  if (digits.length === 10 || digits.length === 11) digits = '55' + digits;
  if (digits.length < 10 || digits.length > 15) return null;
  return digits;
}

export function normalizeEmail(raw: unknown): string | null {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim().toLowerCase();
  if (!str) return null;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(str)) return null;
  if (str.length > 254) return null;
  return str;
}

export function cleanText(raw: unknown, max = 500): string | null {
  if (raw === null || raw === undefined) return null;
  const str = String(raw).trim();
  if (!str || str.toLowerCase() === 'nan') return null;
  return str.slice(0, max);
}

export function cleanInt(raw: unknown): number | null {
  if (raw === null || raw === undefined || raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? Math.round(n) : null;
}

/** Primeiro nome capitalizado a partir do nome completo. */
export function firstName(full: string | null | undefined): string {
  if (!full) return '';
  const first = full.trim().split(/\s+/)[0] || '';
  return first.charAt(0).toUpperCase() + first.slice(1).toLowerCase();
}

/** Substitui {{var}} pelas variáveis do contato. Suporta {{primeiro_nome}}. */
export function renderTemplate(tpl: string, c: PressContact): string {
  const vars: Record<string, string> = {
    contato: c.contato || `redação do ${c.veiculo}`,
    primeiro_nome: firstName(c.contato) || 'colega',
    veiculo: c.veiculo || '',
    municipio: c.municipio || '',
    regiao: c.regiao || '',
    cargo: c.cargo || '',
    meio: c.meio || '',
  };
  return tpl.replace(/\{\{\s*([a-z_]+)\s*\}\}/gi, (_, k) => vars[k.toLowerCase()] ?? '');
}

/** Mapeamento case-insensitive de cabeçalhos da planilha para nossas colunas. */
const HEADER_MAP: Record<string, keyof PressContact> = {
  regiao: 'regiao',
  região: 'regiao',
  focal: 'focal',
  municipio: 'municipio',
  município: 'municipio',
  censo_ibge_2022: 'censo_ibge_2022',
  populacao: 'censo_ibge_2022',
  população: 'censo_ibge_2022',
  veiculo: 'veiculo',
  veículo: 'veiculo',
  meio: 'meio',
  contato: 'contato',
  cargo: 'cargo',
  telefone: 'telefone',
  whatsapp: 'whatsapp',
  email: 'email',
  'e-mail': 'email',
  endereco: 'endereco',
  endereço: 'endereco',
  site: 'site',
  url: 'site',
};

export type ImportRow = Partial<PressContact> & { _row: number; _errors: string[] };

export function parseSheetRows(rows: Record<string, unknown>[]): ImportRow[] {
  return rows.map((raw, idx) => {
    const out: any = { _row: idx + 2, _errors: [] };
    for (const [k, v] of Object.entries(raw)) {
      const key = k.trim().toLowerCase().replace(/\s+/g, '_');
      const target = HEADER_MAP[key];
      if (!target) continue;
      if (target === 'censo_ibge_2022') out[target] = cleanInt(v);
      else if (target === 'telefone' || target === 'whatsapp') out[target] = normalizePhone(v);
      else if (target === 'email') out[target] = normalizeEmail(v);
      else out[target] = cleanText(v, target === 'endereco' ? 500 : 200);
    }
    if (!out.veiculo) out._errors.push('Sem veículo');
    if (!out.email && !out.whatsapp) out._errors.push('Sem email nem WhatsApp');
    return out as ImportRow;
  });
}

export function toCSV(rows: PressContact[]): string {
  const cols: (keyof PressContact)[] = [
    'regiao','focal','municipio','censo_ibge_2022','veiculo','meio',
    'contato','cargo','telefone','whatsapp','email','endereco','site','tags','opt_out','notas',
  ];
  const esc = (v: unknown) => {
    if (v === null || v === undefined) return '';
    const s = Array.isArray(v) ? v.join(';') : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const head = cols.join(',');
  const body = rows.map(r => cols.map(c => esc(r[c])).join(',')).join('\n');
  return head + '\n' + body;
}

export function buildWhatsappLink(contact: PressContact, message: string): string | null {
  if (!contact.whatsapp) return null;
  const txt = renderTemplate(message, contact);
  return `https://wa.me/${contact.whatsapp}?text=${encodeURIComponent(txt)}`;
}

/**
 * Link direto para o WhatsApp, evitando o redirect via wa.me → api.whatsapp.com
 * (que é bloqueado por alguns navegadores/extensões/firewalls com ERR_BLOCKED_BY_RESPONSE).
 * Em mobile abre o app nativo; em desktop abre o WhatsApp Web direto.
 */
export function buildWhatsappDirectLink(phone: string | null | undefined, text: string): string {
  const digits = String(phone ?? '').replace(/\D/g, '');
  const msg = encodeURIComponent(text);
  const isMobile = typeof navigator !== 'undefined'
    && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isMobile
    ? `whatsapp://send?phone=${digits}&text=${msg}`
    : `https://web.whatsapp.com/send?phone=${digits}&text=${msg}&type=phone_number&app_absent=0`;
}

/** Monta a mensagem final do WhatsApp: *título*\n\n{corpo}\n\n{link}
 *  - bodyMarkdown já deve estar em markdown do WhatsApp (use htmlToWhatsAppMarkdown antes)
 *  - todos os campos passam por renderTemplate com o contato
 */
export function composeWhatsAppMessage(opts: {
  titulo?: string | null;
  bodyMarkdown: string;
  link?: string | null;
  contact: PressContact;
}): string {
  const { titulo, bodyMarkdown, link, contact } = opts;
  const parts: string[] = [];
  if (titulo && titulo.trim()) parts.push(`*${renderTemplate(titulo.trim(), contact)}*`);
  if (bodyMarkdown && bodyMarkdown.trim()) parts.push(renderTemplate(bodyMarkdown, contact));
  if (link && link.trim()) parts.push(renderTemplate(link.trim(), contact));
  return parts.join('\n\n');
}

/** Gera slug curto a partir de texto livre (sem acentos, kebab-case, máx 60 chars). */
export function slugify(input: string): string {
  return input
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

/** Converte HTML do editor rico para o "markdown" aceito pelo WhatsApp.
 *  WhatsApp aceita *negrito*, _itálico_, ~tachado~ e ```mono```. Listas viram texto. Imagens viram URL. */
export function htmlToWhatsAppMarkdown(html: string): string {
  if (!html) return '';
  let s = html;
  // normaliza quebras
  s = s.replace(/<br\s*\/?>/gi, '\n');
  s = s.replace(/<\/(p|div|h[1-6]|li)>/gi, '\n');
  // imagens -> URL inline
  s = s.replace(/<img[^>]*src="([^"]+)"[^>]*>/gi, '$1\n');
  // links -> "texto (url)"
  s = s.replace(/<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, '$2 ($1)');
  // formatação
  s = s.replace(/<(strong|b)>([\s\S]*?)<\/\1>/gi, '*$2*');
  s = s.replace(/<(em|i)>([\s\S]*?)<\/\1>/gi, '_$2_');
  s = s.replace(/<(s|del|strike)>([\s\S]*?)<\/\1>/gi, '~$2~');
  s = s.replace(/<code>([\s\S]*?)<\/code>/gi, '```$1```');
  // listas: prefixa cada <li> com "• "
  s = s.replace(/<li[^>]*>/gi, '• ');
  // remove demais tags
  s = s.replace(/<[^>]+>/g, '');
  // decodifica entidades básicas
  s = s.replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'");
  // colapsa múltiplas quebras
  s = s.replace(/\n{3,}/g, '\n\n').trim();
  return s;
}
