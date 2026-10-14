// Quem entra nas estatísticas do site (site_analytics, cliques, rolagem e
// cliques em botões). Ficam de fora:
// - robôs: prévia de link (WhatsApp, Facebook, LinkedIn…), buscadores e
//   navegadores automáticos, que costumam abrir a página numa janela 800x600;
// - a prévia do Lovable e qualquer endereço que não seja o site no ar;
// - navegadores marcados como internos: o do admin, marcado sozinho ao abrir o
//   Painel da Academia (dá para desfazer na aba Operação).
// O mesmo filtro de robôs existe no banco (academia_visita_robo) para limpar
// o histórico já gravado.

const CHAVE_INTERNO = 'analytics_ignorar';
const HOSTS_DO_SITE = ['jeffersonlobo.tech', 'www.jeffersonlobo.tech'];
const ROBO =
  /bot|crawl|spider|slurp|facebookexternalhit|facebookcatalog|whatsapp|telegram|embedly|headless|lighthouse|pagespeed|gtmetrix|pingdom|python|curl|wget|axios|node-fetch|go-http|preview/i;

export function ehRobo(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  if ((navigator as Navigator & { webdriver?: boolean }).webdriver) return true;
  if (!navigator.userAgent || ROBO.test(navigator.userAgent)) return true;
  return window.screen?.width === 800 && window.screen?.height === 600;
}

export const ehSiteNoAr = () => typeof window !== 'undefined' && HOSTS_DO_SITE.includes(window.location.hostname);

/** '1' = não contar este navegador; '0' = o admin escolheu contar; vazio = nunca decidido. */
export function estadoInterno(): '1' | '0' | null {
  try {
    const v = localStorage.getItem(CHAVE_INTERNO);
    return v === '1' || v === '0' ? v : null;
  } catch {
    return null;
  }
}

export function marcarInterno(naoContar: boolean) {
  try {
    localStorage.setItem(CHAVE_INTERNO, naoContar ? '1' : '0');
  } catch {
    /* navegação privada: segue contando */
  }
}

/** Marca o navegador do admin como interno, a não ser que ele tenha escolhido contar. */
export function marcarAdminSeNuncaDecidiu() {
  if (estadoInterno() === null) marcarInterno(true);
}

export const deveRastrear = () => ehSiteNoAr() && !ehRobo() && estadoInterno() !== '1';
