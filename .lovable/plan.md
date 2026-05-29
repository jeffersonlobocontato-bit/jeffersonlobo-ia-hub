## Diagnóstico

O pixel `track-press-open` funciona — testei e gravou row em `press_email_opens`. O problema de "0 aberturas" é comportamento normal de lista B2B de imprensa:

- Outlook corporativo bloqueia imagens remotas → pixel nunca dispara.
- Apple Mail Privacy Protection mascara aberturas.
- Brevo Free + domínio com DKIM parcial → muitos vão pra spam.

Pixel sozinho não é métrica confiável. **Clique** é.

## Mudanças

### 1. Nova edge function `track-press-click`
- GET `?s=<send_id>&u=<url_b64>` → insere em nova tabela `press_email_clicks (id, send_id, url, clicked_at, user_agent, ip_hash)` e responde 302 para a URL original.
- Mesmo padrão público do `track-press-open` (sem JWT).
- Adicionar em `supabase/config.toml`: `[functions.track-press-click] verify_jwt = false`.

### 2. Migração
- `CREATE TABLE public.press_email_clicks` (campos acima, FK para `press_sends.id`).
- GRANT padrão + RLS habilitado + policy só `service_role` (anon não lê, função pública usa service key).

### 3. `send-press-email/index.ts`
- Após `renderTemplate(html, contact)`, varrer `<a href="...">` e reescrever cada `href` para `${SUPABASE_URL}/functions/v1/track-press-click?s=${sendId}&u=${base64url(originalUrl)}`.
- Não reescrever `mailto:`, âncoras `#`, nem o link de unsubscribe.
- Manter o pixel atual (não estraga nada e cobre Gmail webmail).

### 4. Dashboard `PressCampaignDashboard.tsx`
- Adicionar card "Cliques únicos" ao lado de "Aberturas".
- Pequena nota cinza embaixo das métricas: *"Aberturas dependem do cliente de email carregar imagens (Outlook bloqueia). Clique é a métrica real de interesse."*

### 5. Botão "Enviar teste pra mim" no Step 2 de email (`PressEmailCampaignTab.tsx`)
- Input de email do operador + botão que dispara `send-press-email` com 1 contato fake apontando pro próprio email.
- Permite validar fim-a-fim (pixel + clique + entrega) antes de disparar pra lista real.

## Fora do escopo

- Não mexer no fluxo de WhatsApp.
- Não trocar Brevo por outro provedor.
- Não configurar DKIM/SPF (isso é no painel Brevo, fora do código).
- Não alterar templates de email existentes.

## Como testar depois

1. Disparar teste pra seu próprio email via novo botão.
2. Abrir no Gmail web → ver row em `press_email_opens`.
3. Clicar num link do email → ver row em `press_email_clicks` + redirect correto.
4. Dashboard mostra ambos os contadores.
