## Objetivo

Substituir o painel atual (3 abas separadas, dependentes de seleção manual na tabela) por um fluxo guiado de "Novo disparo" em 4 passos: escolher tipo → escolher listas → escrever conteúdo → revisar e disparar.

## Conceito de "Lista"

Cada importação de XLSX vira uma **lista nomeada**. Contatos podem pertencer a várias listas (relação N:N). A base global continua existindo para edição/inspeção, mas o disparo passa a ser feito sempre via listas (uma ou mais).

## Mudanças no banco

Novas tabelas:

- `press_lists` — `id`, `nome`, `descricao`, `total_contatos`, `created_by`, `created_at`
- `press_list_members` — `list_id`, `contact_id` (PK composta)

Política: admin gerencia tudo, sem acesso público. GRANTs para `authenticated` e `service_role`.

No `PressImportDialog`: passa a exigir um **nome de lista** antes do upload. Após import, todos os contatos importados são vinculados via `press_list_members`. Mantém o upsert por email/whatsapp para não duplicar contato global, mas sempre cria membership na lista nova.

## Mudanças no app

### Reorganização da aba Imprensa (`AdminPressTab`)

Duas seções principais, sem sub-abas:

```text
┌─────────────────────────────────────────────┐
│  [+ NOVO DISPARO]      [Importar XLSX]      │
├─────────────────────────────────────────────┤
│  LISTAS                                     │
│  ┌─────────┬─────────┬─────────┐            │
│  │ ADJORI  │ Rádios  │ Norte   │ ...        │
│  │ 234 ✉   │ 88 ✉    │ 412 ✉   │            │
│  └─────────┴─────────┴─────────┘            │
├─────────────────────────────────────────────┤
│  BASE COMPLETA (988)        [ver tabela]    │
└─────────────────────────────────────────────┘
```

### Wizard "Novo disparo" (`PressCampaignWizard.tsx`)

Modal em 4 passos:

1. **Tipo** — dois cards grandes: WhatsApp / Email
2. **Listas** — grid de cards de listas com checkbox (multi-seleção). Mostra total único de contatos elegíveis (com email/whatsapp + sem opt-out) à medida que seleciona. Botão "ver contatos" abre drawer com a união.
3. **Conteúdo** — editor rico dedicado + campos auxiliares (nome interno, assunto se email)
4. **Revisar** — preview no primeiro contato + total + botão "Disparar para N"

### Novo editor dedicado (`PressRichEditor.tsx`)

Baseado em Tiptap (mesma stack do blog), mas toolbar focada em disparo:

- Negrito, itálico, sublinhado, tachado
- Lista, lista numerada
- Link, imagem (upload para bucket `blog-covers` existente ou outro a criar)
- Inserir variável (`{{primeiro_nome}}`, `{{veiculo}}`, etc.) via dropdown
- **Sem** H2/H3 nem blockquote (email não precisa)

Exporta HTML para email. Para WhatsApp, converte em markdown WA (`**texto**` → `*texto*`, `_texto_`, `~texto~`, listas em texto puro, imagens viram link).

### Refatorações

- `PressContactsTable` permanece para edição da base, mas perde a coluna de checkbox de seleção (não é mais ponto de partida do disparo).
- `PressCampaignsTab` (WA) e `PressEmailCampaignTab` viram páginas internas do wizard, não abas.
- `send-press-email` edge function: aceita `list_ids` opcional além de `contact_ids` para resolver no servidor (defesa em profundidade contra divergência cliente/servidor). Lógica de envio inalterada.

## Arquivos afetados

Criar:
- `supabase/migrations/...` (tabelas + grants + policies)
- `src/components/admin/press/PressCampaignWizard.tsx`
- `src/components/admin/press/PressRichEditor.tsx`
- `src/components/admin/press/PressListsGrid.tsx`
- `src/hooks/usePressLists.ts`

Editar:
- `src/components/admin/AdminPressTab.tsx` (nova estrutura)
- `src/components/admin/press/PressImportDialog.tsx` (campo "nome da lista" obrigatório, criar membership)
- `src/components/admin/press/PressContactsTable.tsx` (remover seleção)
- `src/lib/press-utils.ts` (helper htmlToWhatsAppMarkdown)

## Fora de escopo

- Edição manual de membership (adicionar/remover contato de lista pela UI) — fica para um próximo passo se precisar.
- Agendamento de disparo.
- Histórico visual de campanhas (já existe em `press_campaigns`, podemos expor depois).
