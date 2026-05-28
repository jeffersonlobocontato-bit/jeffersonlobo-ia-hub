## Diagnóstico

Você está certo: a `/palestras-ia` está visualmente fria e plana. Os problemas que vejo no screenshot são:

1. **Todas as seções usam `bg-background` (branco 98%)** — não há alternância de fundos, o olho desliza sem âncoras. Vira uma única "parede branca" do hero até o FAQ.
2. **Sem seção escura** — a identidade brutalista do site (preto + amarelo + laranja) some completamente nas landings. A home tem blocos pretos que dão peso; aqui não tem nenhum.
3. **Cards muito tímidos** — `border-primary/30` + `shadow-[4px_4px_0]` ficam quase invisíveis sobre fundo branco. A sombra brutalista pede borda preta sólida e fundo contrastante.
4. **Bento "Provocando Lideranças Brasil afora"** aparece praticamente vazio — caixas amarelas com texto invisível (provavelmente herdou estilo de outro contexto).
5. **Tipografia uniforme em peso** — sem variação de escala/cor entre kicker, H2 e corpo. Falta hierarquia que puxe a leitura.
6. **Zero acentos de cor quentes** no meio do scroll — o laranja (`--secondary`) só aparece em ícones minúsculos.

## Plano de correção (somente UI — sem mexer em conteúdo/copy)

Alvo: `src/components/CommercialLanding.tsx` (template usado pelas 3 landings, então corrige as 3 de uma vez).

### 1. Ritmo de fundos (alternância)
Sequência proposta de cima para baixo:
- Hero: mantém claro com `bg-brand-grid` reforçado
- LogosBar: claro
- **"Para quem"**: fundo `bg-muted` (creme suave) — quebra do branco
- **"O que entrega"**: **fundo preto** (`bg-foreground`) com cards em fundo escuro e títulos amarelos → vira o bloco de impacto da página
- **"Formatos"**: volta ao claro com `bg-background`
- TrustBar + StagePhotos: mantém
- **FAQ**: `bg-muted` novamente
- **CTA final**: **fundo amarelo** (`bg-primary`) com texto preto — finalização brutalista forte

### 2. Cards mais brutalistas
- Borda preta sólida 2px (`border-foreground`) em vez de `border-primary/30`
- Sombra mais agressiva: `shadow-[6px_6px_0_hsl(var(--foreground))]`
- No bloco escuro: cards `bg-background/5` com borda amarela e sombra amarela

### 3. Hierarquia tipográfica
- Kickers em pílula amarela sólida (não só texto)
- H2 com tamanho maior e `tracking-tight`
- Adicionar uma linha divisória amarela curta abaixo dos H2

### 4. Acentos de cor
- Ícones `Sparkles` e `Check` ganham fundo amarelo sólido (não translúcido)
- Pelo menos um card de cada grid usa o laranja (`--secondary`) como destaque para criar "cor quente" no meio do scroll

### 5. CTA final em amarelo
Bloco final com `bg-primary` + texto preto + botão preto invertido → cria um "ponto de chegada" visual forte.

### Não vou mexer agora
- Conteúdo/copy das 3 landings (PalestrasIA, WorkshopIA, ConsultoriaIA)
- Bento "Provocando Lideranças" (parece ser outro componente herdado — se quiser, atacamos depois em chamada separada)
- Tokens globais do `index.css` (manter consistência com o resto do site)

### Resultado esperado
Mesma estrutura e copy, mas com ritmo claro→creme→**preto**→claro→creme→**amarelo**, dando temperatura, peso brutalista e âncoras de leitura ao longo do scroll.

Aprovar para eu implementar?