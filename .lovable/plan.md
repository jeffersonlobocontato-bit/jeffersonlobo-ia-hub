
## Objetivo

Transformar o blog em duas frentes:

1. **Leitura** — diagramação fluida, arejada e hierárquica, como portais de notícia (UOL, NYT, The Intercept).
2. **Edição** — substituir o textarea de Markdown por um editor visual (WYSIWYG) com barra de ferramentas para títulos, negrito, itálico, listas, links, citação e **frase de destaque** (pull quote) inserida no meio do texto.

Mantemos Markdown como formato de armazenamento (continua bom para SEO, diff, portabilidade e os CTAs intercalados já existentes). O editor só passa a ser visual — escreve Markdown por baixo.

---

## 1. Editor rico no admin (`MarkdownEditor.tsx`)

Substituir o `<Textarea>` atual por um editor **TipTap** (já é o padrão de fato no ecossistema React, leve, extensível, gera HTML→Markdown limpo).

**Toolbar fixa no topo do editor**, agrupada:

- Parágrafo · H2 · H3 · H4
- **B** · *I* · ~~S~~ · `code`
- Lista • · Lista 1. · Citação `"`
- 🔗 Link · 🖼 Imagem (do bucket `blog-covers`)
- **★ Destaque** (insere um *pull quote* — bloco `> [!destaque]` no Markdown)
- ─ Separador (hr) · ↶ Desfazer · ↷ Refazer
- Botão "Markdown" para alternar para o textarea cru (escape hatch para quem prefere)

**Persistência:** o editor mantém o conteúdo como Markdown em `content_md` (via `tiptap-markdown`). Nada muda no banco.

**Pull quote (frase de destaque):**
- No Markdown fica como bloco customizado: `> [!destaque]\n> Texto da frase em destaque`
- No render, vira um `<aside class="pull-quote">` grande, com aspas tipográficas, tipografia display e borda lateral.

---

## 2. Diagramação editorial em `BlogPost.tsx` + `BlogContent.tsx`

Inspiração: NYT / The Intercept / Piauí.

**Layout da página do post:**
- Container central **mais estreito e respirado**: `max-w-[680px]` (hoje é `max-w-3xl` = 768px e o texto fica colado). Margem lateral generosa no desktop.
- **Capa em largura total** (bleed) acima do título no desktop, com legenda discreta abaixo.
- **Cabeçalho editorial:** categoria pequena em caps → título grande em serifa display → linha fina → **dek** (subtítulo/excerpt em fonte maior, peso leve, cor suave) → linha de autor + data + tempo de leitura.
- **Barra de progresso de leitura** fixa no topo (1px, cor primary).

**Tipografia do corpo (`.blog-content`):**
- Fonte serifa para o corpo (ex.: `Lora` ou `Source Serif 4` via Google Fonts) — quebra do "tudo Arial Black" e melhora dramaticamente a leitura longa.
- `font-size: 1.125rem` (18px) mobile, `1.1875rem` (19px) desktop.
- `line-height: 1.75`.
- `max-width: 65ch` dentro do container.
- Parágrafos com `margin-bottom: 1.5em`.
- **Drop cap** opcional no primeiro parágrafo (`::first-letter` grande, float left).
- H2/H3 mantêm sans display (Arial Black) mas com mais respiro acima (`mt-16`) e uma linha fina divisória.
- **Links** em primary com sublinhado fino, sem peso bold (fica menos agressivo).
- **Listas** com bullets/numeração customizados e indentação maior.
- **Blockquote padrão** discreto (barra lateral fina, itálico).
- **Pull quote** (`> [!destaque]`): bloco que "sai" do fluxo — fonte display 2xl/3xl, peso bold, com aspas grandes decorativas, borda superior + inferior 2px, `my-12`. No desktop pode flutuar à direita ocupando ~40% da largura (`md:float-right md:w-2/5 md:ml-8`).
- **Imagens inline:** largura total do container + legenda em itálico abaixo.

**Os CTAs intercalados** já existentes (`BlogInlineCTA`) ganham margens verticais maiores (`my-14`) e ficam visualmente mais "respirados" entre seções.

---

## 3. Renderização do pull quote

Em `BlogContent.tsx`, antes de jogar no `ReactMarkdown`, faz-se um pré-processamento simples: blocos `> [!destaque]\n> ...` são substituídos por um marcador que vira `<aside class="pull-quote">...</aside>` via componente customizado no `mdComponents.blockquote` (que inspeciona se o conteúdo começa com `[!destaque]`).

Alternativa mais limpa: usar `remark-directive` + `:::destaque ... :::`. Vou pelo `blockquote` para não adicionar dependência nova.

---

## 4. Estilos globais

Adicionar em `src/index.css`:

```css
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&display=swap');

.blog-content { font-family: 'Source Serif 4', Georgia, serif; }
.blog-content p { font-size: 1.125rem; line-height: 1.75; }
.blog-content .pull-quote { /* ver acima */ }
.blog-content p:first-of-type::first-letter { /* drop cap */ }
.reading-progress { position: fixed; top: 0; height: 2px; background: hsl(var(--primary)); z-index: 60; }
```

Tokens (cores, espaçamentos) continuam vindo do design system — nada hard-coded fora dos `--*`.

---

## 5. Arquivos

**Novos**
- `src/components/blog/RichEditor.tsx` — TipTap + toolbar + conversor para Markdown
- `src/components/blog/ReadingProgress.tsx` — barra fina no topo

**Editados**
- `src/components/blog/MarkdownEditor.tsx` → passa a renderizar `RichEditor` por padrão, com toggle "Markdown cru"
- `src/components/blog/BlogContent.tsx` → suporte ao pull quote + componentes Markdown com tipografia editorial
- `src/pages/BlogPost.tsx` → novo cabeçalho editorial, capa em bleed, container 680px, `ReadingProgress`
- `src/index.css` → fonte serifa, estilos `.blog-content`, `.pull-quote`, drop cap
- `tailwind.config.ts` → família `serif: ['"Source Serif 4"', 'Georgia', 'serif']` se necessário

**Dependências novas**
- `@tiptap/react`, `@tiptap/starter-kit`, `@tiptap/extension-link`, `@tiptap/extension-image`, `tiptap-markdown`

Nenhuma mudança de schema, rotas ou backend.

---

## Fora de escopo

- Não muda o sistema de CTAs intercalados (já funciona).
- Não muda o card de blog na home.
- Não muda autenticação, RLS ou edge functions.
