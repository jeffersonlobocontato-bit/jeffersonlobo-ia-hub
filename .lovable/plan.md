
# Módulo Imprensa — Mensageria Email + WhatsApp

## Stack decidida
- **Email**: Lovable Emails (nativo, já com fila/retry/logs). Precisa configurar domínio remetente (ex.: `notify.jeffersonlobo.tech`) — passo único.
- **WhatsApp**: link `wa.me` 1-a-1 assistido. Zero custo, zero risco de banimento, tom certo para imprensa. Arquitetura preparada para plugar Twilio/Meta Cloud API depois sem reescrever.
- **Compliance básico**: rodapé com descadastro no email + flag `opt_out` + supressão automática.

## Base que será importada (planilha auditada)

- **988 contatos** • 8 regiões (Campos Gerais, etc.) • 311 municípios • 847 veículos
- Aba **BASE COMPLETA** usada como fonte única (497 com email, 708 com WhatsApp)
- Schema da tabela `press_contacts` espelha exatamente as colunas da planilha:

```text
press_contacts
  id                uuid pk
  regiao            text          -- "Campos Gerais", "Norte", ...
  focal             text          -- responsável regional (Fábio, etc.)
  municipio         text
  censo_ibge_2022   integer       -- população (útil para priorizar)
  veiculo           text          -- nome do veículo
  meio              text          -- Rádio | TV | Internet | Facebook | Impresso
  contato           text          -- nome da pessoa (pode ser NULL)
  cargo             text          -- Diretor, Redação, Repórter...
  telefone          text (E.164)
  whatsapp          text (E.164)
  email             text          -- lower(trim), index único parcial
  endereco          text
  site              text
  tags              text[]        -- liberdade para o admin segmentar
  opt_out           bool default false
  notas             text
  created_at, updated_at
```

Constraints: ao menos um entre `email` e `whatsapp` obrigatório; emails únicos (case-insensitive).

## Entregas (MVP)

### 1. Nova aba "Imprensa" no /admin
- Tabela com busca livre + filtros por **região, município, veículo, meio, cargo, focal, tags, tem email, tem whatsapp, opt-out**.
- CRUD completo de contato.
- **Importar XLSX/CSV**: upload → detecta automaticamente os headers da planilha que você acabou de mandar (REGIAO, MUNICÍPIO, VEÍCULO, MEIO, CONTATO, CARGO, TELEFONE, WHATSAPP, EMAIL, ENDEREÇO, SITE, CENSO_IBGE_2022, FOCAL) → preview com contagem de novos/duplicados/inválidos → confirma → bulk insert com upsert por email/whatsapp.
- Normalização no import: telefone/WhatsApp → E.164 (regex tira `.`, `+`, espaços; assume Brasil se faltar DDI), email → lowercase/trim, valida regex.
- Exportar CSV da seleção atual.

### 2. Campanhas de Email
- Editor: assunto, corpo (markdown), preview ao vivo.
- **Variáveis**: `{{contato}}`, `{{primeiro_nome}}`, `{{veiculo}}`, `{{municipio}}`, `{{regiao}}`, `{{cargo}}`. Fallback automático ("Olá redação do {{veiculo}}") quando `contato` for NULL.
- **Segmentação**: usa os mesmos filtros da tabela + seleção manual via checkbox.
- Disparo via `enqueue_email` (infra Lovable Emails já existe no projeto, vi `enqueue_email` nas funções DB) com `template_name = 'press_campaign'` e header de unsubscribe.
- Rodapé automático com link `/unsubscribe?token=...` reaproveitando `email_unsubscribe_tokens`.
- Métricas: total enviado / falhas / suprimidos / opt-outs, lendo `email_send_log` filtrado.

### 3. Campanhas de WhatsApp (modo manual assistido)
- Editor com as mesmas variáveis.
- Lista filtrada de contatos com WhatsApp válido → botão **"Abrir WhatsApp"** em cada linha gera `https://wa.me/<E164>?text=<mensagem renderizada>`.
- Modo "fila": botão "próximo" abre o WhatsApp em nova aba, marca o atual como `enviado` em `press_sends`, e avança automaticamente.
- Contador de progresso (enviados / pendentes) por campanha.

### 4. Métricas e histórico
- Aba "Histórico" lista campanhas (tipo, data, filtro, total alvo, enviados, falhas).
- Drill-down por campanha mostra cada contato e status.

## Tabelas novas (RLS admin-only)

```text
press_contacts      (988 registros vindos da planilha)
press_campaigns     id, tipo('email'|'whatsapp'), assunto, corpo,
                    filtros jsonb, status, created_by, sent_at
press_sends         id, campaign_id, contact_id, canal, status,
                    message_id (correlaciona email_send_log),
                    sent_at, error
```

Todas com policies `has_role(auth.uid(),'admin')` + GRANTs corretos.

## Edge Function

- `send-press-email`: recebe `campaign_id`, busca contatos do filtro com email válido e `opt_out=false`, renderiza variáveis, enfileira no `auth_emails`/`transactional_emails` via `enqueue_email`, registra `press_sends` com `message_id`.

## Fluxo do usuário

```text
1. Admin → aba Imprensa → "Importar planilha"
2. Upload de mailing_imprensa_LIMPO.xlsx → preview → confirmar
   → 988 contatos importados, deduplicados por email/whatsapp
3. Filtra (ex.: REGIAO = Campos Gerais, MEIO = Rádio)
4. "Nova campanha" → Email
5. Escreve assunto + corpo com {{primeiro_nome}}, {{veiculo}}
6. "Disparar" → fila processa, métricas atualizam
7. Para WhatsApp: mesma campanha mas tipo whatsapp →
   abre 1-a-1 pelo wa.me, marca enviado automaticamente
```

## Fora do MVP (deixar para v2)
- Tracking de abertura/clique (Lovable Emails não fornece nativo — exigiria migrar para Brevo/Resend).
- WhatsApp em massa automatizado (Twilio + Meta Cloud API + templates aprovados).
- Agendamento e A/B test.
- Webhook de respostas do WhatsApp.

## Pré-requisitos antes de construir
1. Configurar domínio remetente do email (será solicitado via diálogo nativo do Lovable assim que entrarmos em build).
2. Confirmar este plano.

Aprova para entrar em build?

