# Disparo de WhatsApp — pacote mínimo para operar do celular

Objetivo: deixar você capaz de pegar o celular, abrir uma campanha e disparar com segurança, sem duplicar contato e sem esquecer de anexar a mídia.

## 1. Checklist pré-disparo (item "a")

Card fixo no topo da fila de envio (`PressCampaignsTab` / detalhe da campanha) com 5 verificações:

- Mídia carregada (verde se `media_url` existe, cinza se `media_tipo = nenhum`)
- Link com OG válido (chama `validate-og-tags` 1x quando a campanha abre; cacheia resultado)
- Janela de horário recomendada (usa `whatsapp-rhythm.ts` — verde dentro da janela, amarelo fora)
- Próximo disparo liberado (já existe no `WhatsAppRhythmGuard`, vira linha do checklist)
- Confirmação manual: "Salvei todos os contatos da lista na agenda do celular" (checkbox que persiste em `localStorage` por `campaign_id`)

Botão grande "Começar disparos" só fica ativo quando os 4 automáticos estão verdes e o checkbox manual está marcado. Os itens amarelos (fora de janela) deixam disparar mas com aviso.

## 2. Estado "mídia já baixada" (item "b")

- Adicionar `localStorage` flag `press-media-downloaded:{campaign_id}` quando o usuário clica em "Baixar mídia".
- Botão muda de "Baixar mídia" → "Mídia baixada ✓ Baixar de novo".
- Na barra fixa de mídia, mostrar lembrete "Anexe a mídia baixada no WhatsApp antes de colar o texto" apenas enquanto o flag não estiver marcado.
- Nenhuma mudança de schema — é puro estado de cliente.

## 3. Modo kiosk mobile (item "c")

Nova rota `/admin/press/disparar/:campaignId`, mobile-first, otimizada para uso de celular durante o disparo.

Estrutura da tela:

```text
┌─────────────────────────────┐
│ Campanha: Release Maio       │
│ 12 / 47 enviados   ▓▓░░░░    │
├─────────────────────────────┤
│ [Card mídia grande]          │
│ [Baixar mídia ✓]             │
├─────────────────────────────┤
│ Contato 13 de 47             │
│ Folha de Cuiabá              │
│ João Silva — Editor          │
│ +55 65 9xxxx-xxxx            │
├─────────────────────────────┤
│ [Preview da mensagem]        │
│ *Título*                     │
│ Corpo...                     │
│ link                         │
├─────────────────────────────┤
│ [ABRIR WHATSAPP] (full)      │
│ [✓ Enviado]  [Pular →]       │
└─────────────────────────────┘
```

Comportamento:
- Mostra 1 contato por vez, ordenado por `press_sends.status = 'pendente'`.
- "Abrir WhatsApp" abre `wa.me/{whatsapp}?text={mensagem encoded}` em nova aba.
- "Enviado" grava `press_sends.status = 'enviado'`, `sent_at = now()`, incrementa `press_campaigns.total_enviado`, respeita o ritmo (mostra contador "próximo em Xs" se ainda não liberou).
- "Pular" pula sem marcar (não conta como enviado nem como erro).
- Quando todos os contatos pendentes acabam → tela "Disparo concluído" com resumo.
- Header com botão "Voltar para o painel" e indicador de ritmo (próximo livre / disparos restantes na janela atual).

## Arquivos

Novos:
- `src/pages/admin/PressCampaignKiosk.tsx` — rota kiosk mobile
- `src/components/admin/press/PreDispatchChecklist.tsx` — card checklist (item a)
- `src/hooks/use-media-downloaded.ts` — flag localStorage (item b)
- `src/hooks/use-og-validation.ts` — cache do resultado do `validate-og-tags`

Editados:
- `src/App.tsx` — registrar `/admin/press/disparar/:campaignId` (admin-only)
- `src/components/admin/press/PressCampaignsTab.tsx` — injetar `PreDispatchChecklist` no topo e botão "Modo celular" que abre a rota kiosk
- `src/components/admin/press/CampaignMediaUploader.tsx` (ou onde está o botão "Baixar mídia") — consumir `use-media-downloaded`

Sem mudança de schema, sem migration, sem edge function nova.

## Fora do escopo

- Exportação CSV de quem falta (item "d")
- Tela de resultado pós-campanha com métricas (item "e")
- Anexar mídia automaticamente (impossível via `wa.me`)
- Disparo via API oficial do WhatsApp Business Cloud
