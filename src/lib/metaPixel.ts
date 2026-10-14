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
