
# Recalibrar LPs comerciais — paleta executiva

Você tem razão. A combinação lilás + sky + pêssego + mint virou arco-íris pastel e mata a credibilidade. Precisamos voltar à disciplina brutalista executiva: **muito preto, muito branco, amarelo como ÚNICO acento de marca, e zero pastéis**.

## Princípio

Contraste vem de **preto vs. branco vs. amarelo**, não de variar a cor de cada seção. Cada bloco se diferencia por **densidade, tipografia e estrutura** — não por trocar o tom de fundo.

## Sistema de superfícies (novo)

Remover todos os tokens `--surface-{lilac,sky,peach,mint,coral,cream}` das LPs comerciais e usar apenas 3 superfícies:

1. **`bg-background`** (off-white quase branco) — superfície padrão
2. **`bg-foreground`** (preto sólido) — blocos de impacto / autoridade
3. **`bg-primary`** (amarelo) — usado com PARCIMÔNIA: kicker pill, CTA final, badges pontuais

Sem azul, sem rosa, sem verde, sem lilás em nenhum lugar.

## Mudanças por seção em `CommercialLanding.tsx`

| Seção | Antes | Depois |
|---|---|---|
| HERO | `bg-surface-lilac` | `bg-background` + grid sutil amarelo + faixa preta inferior |
| Para quem | `bg-surface-sky` com cards multicor | `bg-foreground` (preto) com cards brancos e ícone amarelo |
| O que entrega | `bg-foreground` (mantém) | Mantém preto, mas remove cor secundária laranja — só amarelo |
| Formatos | `bg-surface-cream` + badges multicor | `bg-background` com badges todas pretas, exceto a "destaque" amarela |
| FAQ | `bg-surface-peach` | `bg-background` com divisores pretos espessos |
| CTA final | `bg-primary` (amarelo) | Mantém amarelo — único momento de cor "cheia" |

Resultado: ritmo **branco → preto → branco → preto → branco → amarelo**. Sóbrio, executivo, com contraste real.

## Cards e badges

- Cards: sempre `bg-card` (branco) sobre fundo preto, ou `bg-foreground` (preto) sobre fundo branco — nunca pastel.
- Badges de duração nos Formatos: todas `bg-foreground text-background`, exceto uma em destaque por LP em `bg-primary`.
- Ícones de check: removível o roxo/coral — usar apenas amarelo sobre preto ou preto sobre amarelo.

## Tipografia e peso visual

Para compensar a perda de cor, aumentar peso visual com:
- Bordas pretas mais grossas em blocos-chave (`border-2` → `border-[3px]` em hero e CTA)
- Sombras offset mais marcadas (`shadow-[6px_6px_0_...]`)
- Mais uppercase Arial Black nos títulos de seção

## Tokens em `index.css`

Manter os tokens `--surface-*` definidos (podem ser úteis em outras páginas como o blog), mas **não usá-los nas LPs comerciais**. Atualizar a memória `mem://design/color-surfaces` deixando explícito: pastéis NÃO entram em páginas comerciais/executivas.

## Memória

- Atualizar `mem://design/color-surfaces`: pastéis proibidos em LPs comerciais.
- Adicionar nova memória `mem://style/executive-palette`: regra "preto + off-white + amarelo, zero pastéis em contexto B2B/executivo".

## Arquivos afetados

- `src/components/CommercialLanding.tsx` (reescrita das classes de fundo e dos arrays de paleta dos cards)
- `mem://design/color-surfaces` (revisão)
- `mem://style/executive-palette` (novo)
- `mem://index.md` (referência)

Sem mudanças em backend, rotas ou conteúdo — só presentation.
