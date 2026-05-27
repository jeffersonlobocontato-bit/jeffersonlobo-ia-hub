# Régua de Vendas Automatizada

Objetivo: te alertar **em segundos** no Telegram quando chega lead quente, e nutrir o lead automaticamente por email até você responder.

---

## Parte 1 — Alertas instantâneos no Telegram

### Setup (você faz 1 vez, leva 2 minutos)
1. Abre o Telegram, busca `@BotFather`, manda `/newbot`
2. Escolhe um nome (ex: "Jefferson Lobo Leads Bot")
3. Copia o **token** que ele te dá
4. Busca `@userinfobot` no Telegram e manda `/start` — ele te dá seu **chat_id numérico**
5. Você me passa esses 2 valores (vou pedir como secrets seguros)

### O que vou construir
- Edge Function `send-telegram-alert` que recebe payload e dispara mensagem formatada pro seu chat
- Mensagem com markdown: nome, email, telefone, tipo de evento, link direto pro admin e botão "Abrir WhatsApp do lead"

### Gatilhos que vão te alertar
1. **Briefing enviado** (já existe, vou adicionar o alerta)
2. **Teste de maturidade concluído** (novo gatilho)
3. **Teste de maturidade iniciado mas não concluído** (alerta após 30min de inatividade — recuperação)

---

## Parte 2 — Sequência de nutrição automática (5 emails)

### Templates novos (estilo brutalista, mesma identidade do site)
1. **T+1h** — `briefing-em-analise`: "Estou analisando seu briefing pessoalmente, [nome]"
2. **T+24h** — `case-relacionado`: case de sucesso do tipo de palestra que o lead escolheu
3. **T+3d** — `convite-teste-maturidade`: só envia se o lead AINDA não fez o teste
4. **T+7d** — `posso-ajudar`: pergunta aberta + botão wa.me direto pro seu WhatsApp
5. **T+14d** — `ultima-chamada`: reengajamento final + oferta de conversa rápida

### Regras de envio
- Cada email checa antes de enviar se o lead **já avançou** (ex: se já marcou reunião, para a sequência)
- Cada email tem condições próprias (ex: convite ao teste só se score = null)
- Tudo respeita unsubscribe automático

---

## Arquitetura técnica

### Tabelas novas
- `sales_sequence_jobs` — agenda de envios pendentes
  - campos: lead_id, lead_email, lead_name, template_name, scheduled_for, status (pending/sent/skipped/cancelled), context (jsonb com tipo_evento, briefing_id etc), attempts
- `sales_sequence_state` — controle por lead
  - campos: lead_email, current_step, sequence_paused, paused_reason

### Edge Functions novas
- `send-telegram-alert` — dispara mensagem no Telegram via connector gateway
- `schedule-sales-sequence` — cria os 5 jobs agendados quando briefing é criado
- `process-sales-sequence` — roda a cada 5 min via pg_cron, busca jobs `pending` com `scheduled_for <= now()`, valida condições, chama `send-transactional-email`, marca como sent

### Conector
- Conectar **Telegram** via `standard_connectors--connect` (gratuito, sem custos)

### Cron job
- `process-sales-sequence` executando `*/5 * * * *` (a cada 5 minutos)

### Triggers no código
- `BriefingForm.tsx`: ao inserir briefing → invoca `send-telegram-alert` + `schedule-sales-sequence`
- Onde o teste de maturidade é concluído → invoca `send-telegram-alert`
- Job separado detecta testes "abandonados" há 30min e dispara alerta uma única vez

---

## O que NÃO está no escopo
- WhatsApp via Twilio (fica para fase 2, se você quiser depois)
- SMS / push web
- Painel de acompanhamento da régua no admin (posso adicionar depois)

---

## Ordem de execução
1. Migration: criar `sales_sequence_jobs` + `sales_sequence_state` + cron job
2. Conectar Telegram via connector
3. Criar Edge Function `send-telegram-alert` + pedir seu chat_id
4. Criar 5 templates de email + registrar no registry
5. Criar Edge Functions `schedule-sales-sequence` e `process-sales-sequence`
6. Integrar alertas nos triggers (briefing, teste concluído, teste abandonado)
7. Deploy de tudo + teste end-to-end

Você confirma o plano e eu implemento tudo de uma vez?
