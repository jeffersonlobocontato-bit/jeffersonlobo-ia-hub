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
  traffic_source: string; // direct | organic | social | referral | paid | email
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
const PAID_MEDIUMS = ['cpc', 'ppc', 'paid', 'paidsocial', 'paid-social', 'ads', 'display'];

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
  } catch {
    /* ignore */
  }
  return attribution;
};
