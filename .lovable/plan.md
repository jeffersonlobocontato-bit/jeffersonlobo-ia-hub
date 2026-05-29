
## Objetivo

Na aba "Campanha WhatsApp" (`PressCampaignsTab.tsx`), responder em tempo real:
1. **Posso enviar agora?** (janela horária + cooldown entre envios + cota diária)
2. **Quantos ainda devo enviar hoje?** (recomendação dinâmica)
3. **Este contato já recebeu este conteúdo?** (botão "Abrir" desabilitado se sim)

Tudo lendo de `press_sends` (sem precisar de nova tabela de log paralela).

---

## Parte 1 — Painel de ritmo (RhythmGuard)

Novo componente `WhatsAppRhythmGuard` renderizado no topo da campanha ativa, com 3 indicadores e 1 CTA.

### Regras de cadência (configuráveis no componente, defaults sólidos)

| Regra | Default | Por quê |
|---|---|---|
| Janela de envio | Seg-Sex, 9h-12h e 14h-18h (America/Sao_Paulo) | Imprensa não responde fora disso e marca como spam |
| Cooldown entre envios | 25-45s aleatório | Padrão humano; <20s aciona heurística do WhatsApp |
| Pausa forçada | 5 min a cada 30 envios | Quebra padrão de rajada |
| Cota diária | 150 envios/dia (configurável) | Limite seguro para número Business pessoal |
| Cota por hora | 40 envios/hora | Evita rajadas dentro da janela |
| Aquecimento de campanha | Dia 1 = 60% da cota / Dia 2 = 80% / Dia 3+ = 100% | Calibra reação do número |

### Como o componente decide

Faz uma query única ao montar e a cada 5s:

```sql
-- envios do usuário no canal whatsapp nas últimas 24h
SELECT sent_at FROM press_sends
WHERE canal = 'whatsapp' AND status = 'enviado'
  AND sent_at > now() - interval '24 hours'
ORDER BY sent_at DESC;
```

Daí calcula localmente: `lastSentAt`, `sentLastHour`, `sentToday`, `dayOfCampaign` (dias desde `press_campaigns.created_at`).

### UI do painel (3 cards lado a lado + faixa de status)

```text
┌──────────────────────────────────────────────────────────────┐
│ ● LIBERADO PARA ENVIAR   |   próximo em 00:00                │
│ Janela atual: 14:00–18:00 (3h 22min restantes)               │
├───────────────┬──────────────────┬───────────────────────────┤
│ HOJE          │ ÚLTIMA HORA      │ RECOMENDADO AGORA         │
│  47 / 150     │  18 / 40         │  enviar até 22 nesta hora │
│  31%          │  45%             │  parar em 18h00           │
└───────────────┴──────────────────┴───────────────────────────┘
```

**Estados do banner principal**:
- 🟢 `LIBERADO` — pode clicar próximo
- 🟡 `AGUARDE Xs` — cooldown entre envios ativo (mostra contador)
- 🟠 `PAUSA OBRIGATÓRIA 4:32` — atingiu 30 seguidos, pausa de 5min
- 🔴 `FORA DA JANELA — volte às 09:00 de seg` — sábado/domingo/madrugada
- 🔴 `COTA DIÁRIA ATINGIDA — retome amanhã 09:00` — bateu 150

Quando estado ≠ 🟢, **desabilita todos os botões "Abrir" da fila** (via prop `canSendNow`). Tooltip explica o motivo.

### Sino de notificação (opcional, fase 2)

Quando o tab está aberto e cooldown acaba, toca um beep curto e muda título da aba para "▶ Liberado — Campanha". Útil quando você sai para fazer outra coisa entre envios.

---

## Parte 2 — Anti-duplicidade ao reusar campanha

### Dois cenários distintos

**Cenário 2a — "Reabrir esta campanha" (mesma `campaign_id`)**  
Já temos parcialmente: `press_sends` guarda status por contato. Hoje o componente carrega `sends` apenas do estado local, perde após reload.

Fix: ao montar, se há `campaignId` salvo (vamos persistir em `localStorage`), recarrega o estado de `press_sends`:

```sql
SELECT contact_id, status FROM press_sends
WHERE campaign_id = :id;
```

Hidrata o objeto `sends`. Contatos com `status='enviado'` aparecem com badge "✓ Enviado" e botão "Abrir" desabilitado. Já é o comportamento desejado.

**Cenário 2b — "Nova campanha com mesmo release"** (o que você descreveu)  
Você cria nova campanha (D+15) com o mesmo release, ou variante dele. Quer bloquear quem já recebeu na onda anterior.

### Solução: agrupar campanhas por release

Adicionar coluna `release_group` (text, opcional) em `press_campaigns`. Quando criar nova campanha, oferece dropdown:

```text
Esta campanha faz parte de qual release?
[ Novo release ]  ou  [ Selecionar release existente ▾ ]
                          ├── Adjori PR — Mai/26
                          ├── Lançamento Livro
                          └── ...
```

Se selecionar release existente, na fila de envio cada contato fica marcado:

| Estado | Botão | Badge |
|---|---|---|
| Nunca recebeu este release | ✅ habilitado | — |
| Recebeu em campanha anterior do mesmo release | ❌ desabilitado | "Recebeu em 12/05 — campanha Adjori v1" |
| Recebeu nesta campanha | ❌ desabilitado | "✓ Enviado" |

Query que alimenta a fila:

```sql
-- ids dos contatos que já receberam algo do mesmo release
SELECT DISTINCT s.contact_id, c.nome, s.sent_at
FROM press_sends s
JOIN press_campaigns c ON c.id = s.campaign_id
WHERE c.release_group = :grupo
  AND s.canal = 'whatsapp'
  AND s.status = 'enviado'
  AND c.id != :campanha_atual;
```

Resultado vira `Map<contactId, {campanha, data}>` e o componente desabilita os botões.

### Opção "ignorar bloqueio" (escape válido)

Caso especial: você quer **propositalmente** reenviar para alguém (errou texto, quer follow-up direto). Cada linha bloqueada tem link "ignorar bloqueio" que, ao clicar, mostra confirmação:

> Este contato recebeu "Adjori v1" em 12/05. Tem certeza que quer enviar de novo?  
> [ Cancelar ]  [ Sim, enviar mesmo assim ]

Mantém você no controle, evita só o acidente.

---

## Mudanças técnicas

### Migração (1 coluna, sem breaking change)

```sql
ALTER TABLE public.press_campaigns
  ADD COLUMN release_group text;

CREATE INDEX idx_press_campaigns_release_group
  ON public.press_campaigns(release_group) WHERE release_group IS NOT NULL;

CREATE INDEX idx_press_sends_contact_canal_status
  ON public.press_sends(contact_id, canal, status)
  WHERE status = 'enviado';
```

### Arquivos a criar/editar

**Novos**:
- `src/components/admin/press/WhatsAppRhythmGuard.tsx` — painel de ritmo
- `src/components/admin/press/ReleaseGroupPicker.tsx` — dropdown de release na criação
- `src/lib/whatsapp-rhythm.ts` — funções puras `computeRhythmState(sentTimestamps, now, config)`, `isInWindow(date)`, `getCooldownRemaining()`

**Editados**:
- `src/components/admin/press/PressCampaignsTab.tsx`
  - Persistir `campaignId` em `localStorage` (`press_campaign_active`) e recarregar sends ao montar
  - Renderizar `<WhatsAppRhythmGuard campaignId=... onStateChange=... />` no topo
  - Carregar `blockedContacts: Map<id, {campanha, data}>` via query do release_group
  - Desabilitar botão "Abrir" quando `!canSendNow || blockedContacts.has(c.id)`
  - Tooltip explicando bloqueio
  - Botão "ignorar bloqueio" com `AlertDialog` de confirmação
  - Adicionar `<ReleaseGroupPicker>` no formulário de criação
- `src/components/admin/press/PressCampaignWizard.tsx` (se aplicável a campanhas email também) — mesmo dropdown de release

### Sem necessidade de edge function

Tudo roda no client (admin autenticado, RLS já restringe). Queries são leves (<1KB por refresh, a cada 5s só durante campanha ativa).

---

## Não-objetivos (escopo desta entrega)

- Não criamos sistema de templates A/B (Cenário B do plano anterior fica para depois)
- Não tocamos no fluxo de email (rastreamento atual de abertura permanece)
- Não automatizamos via API oficial — segue `wa.me` manual
- Não criamos bloqueio cross-release (se você fez release X em maio e Y em junho, contato pode receber ambos — bloqueio é só dentro do mesmo `release_group`)

---

## Resultado esperado

Na próxima onda você abre a aba, vê:

> 🟢 **LIBERADO PARA ENVIAR** — próximo em 00:00  
> Hoje: 12/150 • Última hora: 5/40 • Recomendado: enviar até 35 nesta hora, parar 18h00

E na fila, 47 dos 600 contatos aparecem com:

> ⛔ Recebeu "Adjori v1" em 12/05 — _ignorar bloqueio_

Risco de duplicidade some, risco de banimento por rajada some, e você ganha um sino que avisa quando pode clicar de novo.
