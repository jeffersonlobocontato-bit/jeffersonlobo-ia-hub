# Ativar emails automáticos do briefing

Domínio `notify.jeffersonlobo.tech` já está verificado e a infraestrutura de emails do Lovable Cloud já está provisionada. Falta apenas escafoldar os templates transacionais e disparar o envio quando um briefing for criado.

## O que será entregue

1. **Email de notificação interna** → `jeffersonlobocontato@gmail.com`
   - Disparado sempre que um novo briefing é inserido
   - Contém todos os campos: nome, empresa, cargo, email, whatsapp, tipo, data, formato, público, cidade e mensagem
   - Link direto para `/admin` (aba Briefings)

2. **Email de confirmação ao lead** → email informado no formulário
   - "Recebemos seu briefing, retornaremos em até 24h"
   - Tom brutalista alinhado ao site (preto/amarelo, Arial Black, sombra deslocada)
   - Inclui resumo do que ele preencheu para reforçar confiança

## Como vai funcionar (técnico)

1. Rodar `scaffold_transactional_email` para criar:
   - Edge Function `send-transactional-email`
   - Edge Function `handle-email-unsubscribe`
   - Edge Function `handle-email-suppression`
   - Página `/unsubscribe` no app
   - Template inicial de exemplo

2. Criar 2 templates React Email em `supabase/functions/_shared/transactional-email-templates/`:
   - `briefing-internal-notification.tsx` (notificação interna estilo "novo lead")
   - `briefing-lead-confirmation.tsx` (confirmação ao lead, estilo brutalista)
   - Registrar ambos em `registry.ts`

3. Editar `BriefingForm.tsx`:
   - Após `insert` bem-sucedido em `briefing_requests`, disparar **duas chamadas paralelas** `supabase.functions.invoke('send-transactional-email', ...)`:
     - Uma para `jeffersonlobocontato@gmail.com` com template `briefing-internal-notification`
     - Outra para o email do lead com template `briefing-lead-confirmation`
   - Usar `idempotencyKey` baseado no UUID do briefing para evitar duplicação em retry
   - Falhas no email **não bloqueiam** o sucesso do formulário (envio assíncrono)

4. Redeploy de todas as Edge Functions

## Estilo dos templates

- Fundo branco (regra obrigatória), mas com blocos internos amarelos `#FFD700` e pretos `#000`
- Headings em Arial Black uppercase
- Botões com sombra deslocada brutalista
- Sem links de descadastro manuais (sistema adiciona automaticamente no email do lead)

## Fora de escopo

- Não vou criar um dashboard de logs de email (já existe `email_send_log`; podemos adicionar depois se quiser)
- Não vou alterar emails de autenticação
- Não vou criar campanhas/newsletter (apenas transacionais conforme política do Lovable)

Posso seguir?
