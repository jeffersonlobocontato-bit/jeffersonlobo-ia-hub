## Objetivo

Permitir disparar uma lista segmentada inteira (ex.: Noroeste com 119, Oeste com 200+) em **um único clique**, sem precisar quebrar a lista manualmente. O sistema envia em lotes de 100, pausa N segundos, e continua até terminar — tudo dentro da mesma campanha.

## O que muda

### 1. Wizard de disparo (`PressCampaignWizard.tsx`)
- Remover o limite atual de 280 contatos por disparo. Listas grandes passam a ser aceitas.
- Adicionar dois campos no painel de envio (com defaults bons, sem precisar mexer):
  - **Tamanho do lote**: padrão `100` (máximo aceito pelo backend hoje)
  - **Pausa entre lotes (segundos)**: padrão `30`
- Ao clicar em "Disparar":
  1. Cria a campanha (status `em_envio`).
  2. Divide os IDs em chunks de N (padrão 100).
  3. Para cada chunk: chama `send-press-email`, soma `sent/failed/skipped`, persiste totais parciais em `press_campaigns`.
  4. Entre chunks: aguarda a pausa (com contador regressivo visível) e continua. Se for o último, pula a pausa.
  5. Ao final: marca campanha como `concluida`.
- **Barra de progresso** mostrando: `Lote X/Y · 220/500 enviados · próxima leva em 27s` + botão **Cancelar** que para após o lote em andamento.
- Se a aba for fechada durante o disparo: alerta `beforeunload` ("disparo em andamento, sair vai interromper").

### 2. Backend (`send-press-email/index.ts`)
- Sem mudança de schema. Mantém limite de 100 por chamada (já existente).
- **Removida** a linha que marca a campanha como `concluida` ao final de cada chamada — só o cliente sabe quando o último lote foi disparado. O cliente passa a fazer esse `UPDATE` final.
- Acrescenta `pendingRow` upsert idempotente (já implementado) — re-disparo do mesmo (campaign_id, contact_id) não duplica.

### 3. Histórico/Dashboard
- Sem alteração de UI. Já mostram totais a partir de `press_sends`, então funcionam mesmo durante disparos longos (atualizam ao recarregar).

## Por que essa abordagem (e não reorganizar listas)

Reorganizar as listas em "Noroeste 1 / Noroeste 2" funcionaria, mas:
- Toda nova importação de XLSX precisaria do mesmo cuidado manual.
- Quebra a semântica: o usuário pensa "região Noroeste", não "Noroeste lote 2".
- Não resolve o problema raiz (limite por chamada do edge function).

A pausa entre lotes resolve o problema **uma vez** e funciona para qualquer tamanho de lista futura.

## Limites práticos

- Edge functions Supabase têm timeout de ~150s por chamada — o limite de 100 contatos por chamada continua adequado (cada email demora ~200ms = ~20s por lote).
- Brevo Free: 300 emails/dia. Listas maiores que 300 vão dar erro de quota no meio — exibimos o erro do lote no painel mas continuamos os próximos (próximos também falharão até o reset diário).
- Aba precisa ficar aberta durante o disparo (limitação de rodar no cliente). Para listas muito grandes (>1000) futuramente daria pra mover o loop para uma edge function com `EdgeRuntime.waitUntil`, mas é overkill agora.

## Arquivos afetados

- `src/components/admin/press/PressCampaignWizard.tsx` — adiciona controles, barra de progresso, loop com pausa
- `supabase/functions/send-press-email/index.ts` — remove update de status `concluida` do final
