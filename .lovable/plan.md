## Problema

No painel de disparo (modal "Disparar campanha" + tela Kiosk), o botão **ABRIR** chama `window.open('https://wa.me/...')` dentro de um handler React. O iframe de preview do Lovable (e alguns bloqueadores de popup) descartam essas chamadas programáticas silenciosamente — por isso "nada acontece" quando você clica.

A correção padrão é usar uma **âncora `<a>` real** com `href` direto e `target="_blank"`. O navegador trata o clique como navegação nativa do usuário, não como popup script, e libera mesmo dentro do iframe.

## O que vou alterar

Dois lugares onde existe o botão "Abrir WhatsApp":

### 1. `src/components/admin/press/PressCampaignWizard.tsx` (linha ~805)
Trocar:
```tsx
<Button size="sm" onClick={() => waMarkSent(c)}>
  <ExternalLink /> Abrir
</Button>
```
por:
```tsx
<Button size="sm" asChild>
  <a
    href={`https://wa.me/${c.whatsapp}?text=${encodeURIComponent(buildWaText(c))}`}
    target="_blank"
    rel="noopener noreferrer"
    onClick={() => waMarkSent(c, { skipOpen: true })}
  >
    <ExternalLink /> Abrir
  </a>
</Button>
```
E ajustar `waMarkSent` para aceitar a flag `skipOpen` (quando vier da âncora, só marca como enviado no banco e não tenta abrir de novo).

### 2. `src/pages/admin/PressCampaignKiosk.tsx` (botão grande "Abrir WhatsApp")
Mesmo padrão: substituir o `<Button onClick={openWhatsApp}>` por `<Button asChild><a href=... target="_blank">`. Manter o restante do fluxo (checklist, cooldown, marcar como enviado) intacto.

### 3. Pequena defesa extra
Sanitizar o número de WhatsApp antes de montar a URL (remover espaços, `+`, `-`, parênteses) — alguns contatos importados podem ter formatação que quebra o link `wa.me`.

## Fora do escopo

- Não mexo no fluxo de email, no checklist, no cooldown, nem na lógica de gravar `press_sends`.
- Não toco em RLS, edge functions ou schema.

## Como você testa depois

1. Abre o modal "Disparar campanha" → WhatsApp → clica **Abrir** em um contato. Deve abrir uma nova aba com `wa.me/55...` e a mensagem pronta.
2. Mesma coisa no **Modo celular** (Kiosk): o botão grande "Abrir WhatsApp" deve abrir o app/WhatsApp Web direto.
