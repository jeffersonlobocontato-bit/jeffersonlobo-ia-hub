// Atribuição de origem do tráfego (first-touch por sessão).
// Persiste em sessionStorage para que pageviews subsequentes mantenham a origem.

export interface TrafficAttribution {
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  referrer: string | null;
  referrer_domain: string | null;
  traffic_source: string; // direct | organic | ai | social | referral | paid | email
  landing_page: string;
}

const STORAGE_KEY = 'analytics_attribution';

const SEARCH_ENGINES = ['google.', 'bing.', 'duckduckgo.', 'yahoo.', 'baidu.', 'yandex.', 'ecosia.', 'brave.'];
const SOCIAL_DOMAINS = [
  'linkedin.com', 'lnkd.in',
  'instagram.com', 'l.instagram.com',
  'facebook.com', 'l.facebook.com', 'm.facebook.com', 'fb.com',
  'twitter.com', 'x.com', 't.co',
  'youtube.com', 'youtu.be',
  'tiktok.com',
  'whatsapp.com', 'wa.me', 'api.whatsapp.com',
  'telegram.org', 't.me',
  'reddit.com', 'pinterest.com', 'threads.net', 'bsky.app',
];
const PAID_MEDIUMS = ['cpc', 'ppc', 'cpm', 'cpv', 'paid', 'paidsocial', 'paid-social', 'paid_social', 'paidsearch', 'paid-search', 'paid_search', 'ads', 'ad', 'display', 'sponsored'];
// Identificadores de clique que as plataformas de anúncio acrescentam ao link.
const CLICK_IDS = ['gclid', 'gbraid', 'wbraid', 'fbclid', 'msclkid', 'ttclid', 'li_fat_id', 'twclid'];
// Respostas de assistentes de IA (busca por IA), separadas da busca comum.
const AI_DOMAINS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com', 'claude.ai', 'you.com', 'meta.ai', 'grok.com'];

const domainOf = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return null;
  }
};

const classify = (params: URLSearchParams, refDomain: string | null, currentHost: string): string => {
  const utmMedium = (params.get('utm_medium') || '').toLowerCase();
  const utmSource = (params.get('utm_source') || '').toLowerCase();
  if (CLICK_IDS.some((k) => params.has(k))) return 'paid';
  if (utmMedium || utmSource) {
    if (PAID_MEDIUMS.includes(utmMedium)) return 'paid';
    if (utmMedium === 'email') return 'email';
    if (utmMedium === 'social') return 'social';
    if (utmMedium === 'organic') return 'organic';
    if (utmMedium === 'referral') return 'referral';
    return utmMedium || 'campaign';
  }
  if (!refDomain) return 'direct';
  if (refDomain === currentHost) return 'direct'; // navegação interna não conta
  if (AI_DOMAINS.some((s) => refDomain === s || refDomain.endsWith('.' + s))) return 'ai';
  if (SEARCH_ENGINES.some((s) => refDomain.includes(s))) return 'organic';
  if (SOCIAL_DOMAINS.some((s) => refDomain === s || refDomain.endsWith('.' + s))) return 'social';
  return 'referral';
};

export const getTrafficAttribution = (): TrafficAttribution => {
  // Já temos atribuição da sessão? Reusa (first-touch).
  try {
    const cached = sessionStorage.getItem(STORAGE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    /* ignore */
  }

  const params = new URLSearchParams(window.location.search);
  const referrer = document.referrer || null;
  const referrer_domain = referrer ? domainOf(referrer) : null;
  const currentHost = window.location.hostname.replace(/^www\./, '');
  const traffic_source = classify(params, referrer_domain, currentHost);

  const attribution: TrafficAttribution = {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_term: params.get('utm_term'),
    utm_content: params.get('utm_content'),
    referrer,
    referrer_domain: referrer_domain && referrer_domain !== currentHost ? referrer_domain : null,
    traffic_source,
    landing_page: window.location.pathname,
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    // Guarda a última origem que não foi "direto" por 30 dias: quem volta
    // digitando o endereço para comprar ainda conta para o canal que trouxe.
    if (attribution.traffic_source !== 'direct') {
      localStorage.setItem(ULTIMA_KEY, JSON.stringify({ ...attribution, em: Date.now() }));
    }
  } catch {
    /* ignore */
  }
  return attribution;
};

const ULTIMA_KEY = 'analytics_ultima_origem';
const TRINTA_DIAS = 30 * 24 * 3600 * 1000;

export type OrigemConversao = {
  canal: string;
  utm_source?: string;
  utm_medium?: string;
  utm_campaign?: string;
  utm_content?: string;
  utm_term?: string;
  referrer_domain?: string;
  landing_page?: string;
  sessao?: string;
};

/** Origem para gravar num lead ou numa compra: a da sessão atual ou, se ela
 *  for "direto", a última origem não direta dos últimos 30 dias. */
export const origemParaConversao = (): OrigemConversao => {
  let a: (TrafficAttribution & { em?: number }) | null = null;
  try {
    a = getTrafficAttribution();
    if (a.traffic_source === 'direct') {
      const guardada = JSON.parse(localStorage.getItem(ULTIMA_KEY) || 'null');
      if (guardada && Date.now() - Number(guardada.em ?? 0) < TRINTA_DIAS) a = guardada;
    }
  } catch {
    /* sem armazenamento: segue com o que tiver */
  }
  const limpa = (v: string | null | undefined) => (v ? v.slice(0, 200) : undefined);
  let sessao: string | undefined;
  try {
    sessao = sessionStorage.getItem('analytics_session_id') ?? undefined;
  } catch {
    /* ignore */
  }
  return {
    canal: a?.traffic_source ?? 'direct',
    utm_source: limpa(a?.utm_source),
    utm_medium: limpa(a?.utm_medium),
    utm_campaign: limpa(a?.utm_campaign),
    utm_content: limpa(a?.utm_content),
    utm_term: limpa(a?.utm_term),
    referrer_domain: limpa(a?.referrer_domain),
    landing_page: limpa(a?.landing_page),
    sessao,
  };
};
