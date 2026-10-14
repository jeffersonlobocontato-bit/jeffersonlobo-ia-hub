declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function trackPageView() {
  try { window.fbq?.('track', 'PageView'); } catch { /* pixel bloqueado: ignora */ }
}

export function trackLead(params?: { content_name?: string }) {
  try { window.fbq?.('track', 'Lead', params ?? {}); } catch { /* ignora */ }
}

export function trackViewContent(content_name: string) {
  try { window.fbq?.('track', 'ViewContent', { content_name }); } catch { /* ignora */ }
}

export function trackInitiateCheckout(params: { value: number; content_name: string }) {
  try {
    window.fbq?.('track', 'InitiateCheckout', {
      value: params.value,
      currency: 'BRL',
      content_name: params.content_name,
    });
  } catch { /* pixel bloqueado: ignora */ }
}

// Compra aprovada. A marca no localStorage garante um disparo único por pedido,
// mesmo que a página de obrigado recarregue.
export function trackPurchase(params: { value: number; content_name: string; pedido: string }) {
  const marca = `px-compra-${params.pedido}`;
  try {
    if (localStorage.getItem(marca)) return;
    localStorage.setItem(marca, '1');
  } catch {
    /* navegação privada: dispara mesmo assim */
  }
  try {
    window.fbq?.('track', 'Purchase', { value: params.value, currency: 'BRL', content_name: params.content_name }, { eventID: params.pedido });
  } catch { /* pixel bloqueado: ignora */ }
}
