## Diagnóstico

Verifiquei os logs HTTP da edge function `send-press-email` e confirmei o problema:

- A função foi chamada **2 vezes** e **ambas retornaram HTTP 400** em ~1.3s
- 400 só acontece em dois pontos da função: `invalid_input` (campaign_id / subject / html / contact_ids vazios) ou `max_100_per_batch`
- Os logs textuais da função estão vazios (só boot/shutdown) → não dá pra saber **qual** dos dois disparou
- **Nenhuma campanha nova** foi criada no banco — significa que o disparo abortou no primeiro lote e provavelmente você apagou a campanha vazia

Como o wizard já chunka em lotes de no máximo 100 (245 vira 100/100/45), `max_100` é improvável. Suspeita principal: `subject` ou `html` chegando vazios na função (algum problema de estado/serialização) ou `campaign_id` perdido entre o insert e o invoke.

Além disso, encontrei um **bug colateral**: no `catch` do disparo, o wizard tenta `UPDATE press_campaigns SET status='erro'`, mas o CHECK constraint só aceita `rascunho | em_envio | concluida | cancelada`. Esse update falha silenciosamente e a campanha fica travada em `em_envio`.

## O que vou fazer

### 1. Instrumentar `send-press-email/index.ts`
Antes de retornar 400, logar exatamente o que a função recebeu (sem expor HTML inteiro):

```ts
if (!campaign_id || !subject || !html || contact_ids.length === 0) {
  console.error("invalid_input", {
    has_campaign_id: !!campaign_id,
    subject_len: subject.length,
    html_len: html.length,
    contacts_count: contact_ids.length,
  });
  return new Response(JSON.stringify({
    error: "invalid_input",
    detail: { has_campaign_id: !!campaign_id, subject_len: subject.length, html_len: html.length, contacts_count: contact_ids.length }
  }), { status: 400, ... });
}
```

E também retornar o `detail` para o cliente para o toast mostrar exatamente qual campo veio vazio.

### 2. Corrigir o status inválido no catch do wizard
Em `PressCampaignWizard.tsx` (linha 261), trocar `status: 'erro'` por `status: 'cancelada'` — alinhado ao CHECK constraint. Assim a campanha não fica órfã em `em_envio` se o disparo falhar.

### 3. Melhorar a mensagem de erro no toast
Quando `data?.error === 'invalid_input'`, mostrar o `detail` retornado para você saber na hora qual campo veio vazio.

### 4. Redeploy
`deploy_edge_functions(["send-press-email"])` e te pedir para tentar disparar de novo. Com o log estruturado vou conseguir te dizer em segundos se o problema é `subject`, `html` ou `campaign_id`.

## Arquivos afetados

- `supabase/functions/send-press-email/index.ts` — logging + detail no 400
- `src/components/admin/press/PressCampaignWizard.tsx` — fix `status: 'erro'` → `'cancelada'` + toast melhorado

## Fora do escopo

Não vou mexer na lógica de chunking, throttle ou no fluxo de envio — só diagnóstico + 1 bug do catch. Depois que você retentar e a gente ver o log real, aí faço o fix definitivo.