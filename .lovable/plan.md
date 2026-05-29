# Disparo WhatsApp — fluxo linear "à prova de leigo"

## Objetivo
Substituir a confusão atual (wizard com abas + Kiosk separado + checklist + cooldown + fallback visíveis) por **uma única tela linear de 3 passos**, que funciona igual no desktop e no celular. Modo simples por padrão; um toggle "avançado" libera os controles atuais pra quem quiser.

## Como vai ficar

### Entrada única
`/admin` → Imprensa → botão grande **"Disparar WhatsApp"** abre a tela nova. Fim. Sem aba, sem múltiplos botões.

### Tela única, 3 passos (stepper no topo)

```
[ 1. Lista ] ───▶ [ 2. Mensagem ] ───▶ [ 3. Enviar ]
```

Cada passo ocupa a tela inteira. Botão **"Avançar"** fixo no rodapé. **"Voltar"** discreto. Sem nada mais visível.

**Passo 1 — Lista**
- Cards grandes das listas existentes, com contagem de WhatsApp.
- Clica → marca. Botão "Avançar" libera.
- Link pequeno "Importar nova lista" abre o dialog atual.

**Passo 2 — Mensagem**
- Campo título (opcional) + corpo (editor simples, já existe).
- Anexo opcional (mídia, já existe).
- Preview ao lado mostrando como vai chegar no WhatsApp de 1 contato real da lista.
- "Avançar" salva a campanha e vai pro passo 3.

**Passo 3 — Enviar (o "Kiosk" embutido)**
- Mostra **1 contato por vez**, em card grande:
  - Nome do veículo + jornalista
  - 1 botão gigante amarelo **"ABRIR WHATSAPP"**
  - Depois que clica, aparecem 2 botões: **"✓ Enviei"** e **"Pular"**
- Barra de progresso no topo: `12 de 47`.
- Quando termina, tela final: "Disparo concluído ✓".

### Modo simples vs avançado

Toggle pequeno no canto superior direito: **"Modo avançado"**.

**Simples (padrão):**
- Sem checklist pré-disparo
- Sem cooldown visível (continua rodando por baixo, só bloqueia se passar do limite e mostra uma mensagem clara: "Espere 30s")
- Sem link de fallback wa.me
- Sem preview de markdown técnico

**Avançado (toggle ligado):**
- Volta o checklist
- Volta o ritmo/cooldown com contador
- Volta o fallback wa.me
- Volta atalhos (pular sem marcar, etc.)

A preferência fica salva em `localStorage` por usuário.

## O que sai da frente
- Tela `/admin/press/campaign/:id` (Kiosk) deixa de ser rota separada — vira o passo 3 do wizard. A rota continua existindo por compatibilidade, mas o fluxo principal não passa mais por lá.
- Aba "Disparos" do `AdminPressTab` perde os botões "Novo disparo" e "Importar" soltos — vira só **1 botão grande** + histórico abaixo.
- `PressCampaignWizard` atual fica como referência, mas é substituído pela nova tela `PressDispatchFlow`.

## Arquivos

### Novos
- `src/components/admin/press/PressDispatchFlow.tsx` — componente único com os 3 passos (state machine local).
- `src/components/admin/press/dispatch/Step1List.tsx`
- `src/components/admin/press/dispatch/Step2Message.tsx`
- `src/components/admin/press/dispatch/Step3Send.tsx`
- `src/components/admin/press/dispatch/DispatchStepper.tsx` — barra dos 3 passos.
- `src/hooks/use-advanced-mode.ts` — toggle persistido em localStorage.

### Editados
- `src/components/admin/AdminPressTab.tsx` — substitui a barra de ações por 1 botão grande "Disparar WhatsApp" + histórico. Remove "Ver base completa" do topo (vira link no rodapé).
- `src/pages/admin/PressCampaignKiosk.tsx` — passa a renderizar `<Step3Send campaignId={...} embedded={false} />` (reusa a lógica). Mantém rota pra links antigos.
- `src/components/admin/press/PressCampaignWizard.tsx` — não é mais aberto por padrão; fica disponível só no modo avançado (botão "wizard clássico").

### Reaproveitado integralmente
- `useMediaDownloaded`, `whatsapp-rhythm`, `PreDispatchChecklist`, `buildWhatsappDirectLink`, `composeWhatsAppMessage`, `press_sends`, RLS. **Zero mudança de backend.**

## Visual
Brutalist do projeto: preto / off-white / amarelo, Arial Black uppercase, sombras offset. Sem pastéis. Stepper grande no topo. Botão de ação ocupa largura total no celular, altura ≥ 56px.

## Teste
1. `/admin` → Imprensa: só vejo **1 botão "Disparar WhatsApp"** + histórico.
2. Clico → Passo 1: escolho uma lista → "Avançar".
3. Passo 2: escrevo a mensagem, vejo o preview → "Avançar".
4. Passo 3: vejo contato 1/N, clico **"Abrir WhatsApp"** (abre `web.whatsapp.com/send` direto). Volto, clico **"✓ Enviei"** → vai pro próximo automaticamente.
5. Liga toggle **Modo avançado** → reaparecem checklist, cooldown, fallback wa.me.
6. Mesmo fluxo funciona idêntico no celular (responsivo).

## Fora do escopo
Email, edge functions, schema, RLS, ritmo/cooldown (lógica), import de XLSX, dashboard. Tudo continua igual.