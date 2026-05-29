## Problema
Clicar em "Abrir" no painel envia o usuário pra `wa.me/...`, que redireciona pra `api.whatsapp.com/send?...`. Esse domínio está sendo bloqueado no navegador do usuário (extensão, antivírus, firewall ou DNS corporativo) → erro `ERR_BLOCKED_BY_RESPONSE`.

## Solução
Linkar direto pro destino final, sem passar por `wa.me`:
- Desktop: `https://web.whatsapp.com/send?phone=NUM&text=MSG`
- Mobile: `whatsapp://send?phone=NUM&text=MSG`

## Alterações

### 1. `src/lib/press-utils.ts`
Adicionar helper:
```ts
export function buildWhatsappDirectLink(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '');
  const msg = encodeURIComponent(text);
  const isMobile = typeof navigator !== 'undefined'
    && /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
  return isMobile
    ? `whatsapp://send?phone=${digits}&text=${msg}`
    : `https://web.whatsapp.com/send?phone=${digits}&text=${msg}`;
}
```

### 2. `src/components/admin/press/PressCampaignWizard.tsx` (botão "Abrir" do WhatsApp, ~linha 805)
Trocar `href={`https://wa.me/${c.whatsapp}?text=...`}` por `href={buildWhatsappDirectLink(c.whatsapp, buildWaText(c))}`.
Logo abaixo, adicionar link de fallback discreto: "Não abriu? Tentar wa.me" → âncora normal pro `https://wa.me/${c.whatsapp}?text=...`.

### 3. `src/pages/admin/PressCampaignKiosk.tsx`
Mesma troca no botão grande "Abrir WhatsApp" + mesmo fallback.

## Fora do escopo
Backend, schema, RLS, edge functions, template, checklist, cooldown e gravação em `press_sends` ficam intactos.

## Teste
1. `/admin` → Imprensa → Disparar campanha → WhatsApp → **Abrir** num contato → deve abrir `web.whatsapp.com/send?phone=55...&text=...` direto.
2. No celular (Kiosk): botão grande abre o app do WhatsApp.
3. Se o link principal falhar, o fallback "Tentar wa.me" continua disponível.
