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
