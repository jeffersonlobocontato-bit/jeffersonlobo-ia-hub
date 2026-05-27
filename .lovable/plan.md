# Adicionar botão de teste do Telegram no /admin

## Objetivo
Permitir validar o envio do Telegram sem precisar criar briefings, mostrando a resposta exata da API (sucesso ou erro) para diagnosticar o `chat not found`.

## Mudanças

### 1. `supabase/functions/notify-telegram/index.ts`
- Aceitar payload opcional `{ text, test?: boolean }`.
- Quando `test: true`, retornar também `chat_id_used` (mascarado: primeiros 4 e últimos 2 dígitos) e o corpo de resposta bruto do Telegram, para facilitar o diagnóstico.
- Manter comportamento atual quando `test` não for enviado.

### 2. `src/pages/Admin.tsx`
- Adicionar um card "Diagnóstico Telegram" no topo (visível só para admin, que já é o caso da rota).
- Botão "Enviar mensagem de teste" que chama `supabase.functions.invoke('notify-telegram', { body: { text: '✅ Teste do painel admin — ' + new Date().toLocaleString('pt-BR'), test: true } })`.
- Mostrar resultado em um bloco:
  - Sucesso: badge verde + `message_id` + `chat_id_used` mascarado.
  - Erro: badge vermelho + mensagem de erro completa retornada pela função (inclui status HTTP e corpo do Telegram, ex.: `Bad Request: chat not found`).
- Toast também (sucesso/erro).

## Como o usuário vai usar
1. Acessar `/admin`.
2. Clicar em "Enviar mensagem de teste".
3. Se aparecer `chat not found` → o `TELEGRAM_CHAT_ID` está errado. Pego o ID correto (via `@userinfobot` para chat privado, ou mensagem no grupo) e atualizo o secret.
4. Repetir o teste até receber a mensagem no Telegram.

## Fora de escopo
- Não altero o fluxo do formulário de briefing nem do teste de IA.
- Não toco no secret automaticamente — quando você confirmar o `chat_id` correto, eu uso a ferramenta de update de secret em seguida.