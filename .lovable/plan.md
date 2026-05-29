## Objetivo

No painel "Análise por segmento e região", agrupar as variações de `meio` (e do `veiculo` quando o `meio` for vazio/ambíguo) em categorias canônicas via análise semântica no front, sem alterar dados no banco.

## Categorias canônicas e regras

| Canônico | Casos absorvidos |
|---|---|
| **Portal de Notícias** | "portal de notícias", "portal", "site", "internet", "web", "blog", "online", "digital" |
| **Jornal Impresso** | "jornal impresso", "jornal", "impresso", "periódico" |
| **Rádio** | "rádio", "radio", "rádio comunitária", "fm", "am", "webradio" |
| **TV** | "tv", "televisão", "canal" |
| **Revista** | "revista", "magazine" |
| **Redes Sociais** | "facebook", "instagram", "youtube", "tiktok", "x", "twitter", "linkedin", "telegram", "redes sociais", "rede social", "social" |
| **Podcast** | "podcast" |
| **Agência** | "agência", "agencia", "assessoria" |
| **Outros** | nada bate (mantém o rótulo original entre parênteses para inspeção) |

### Regras de combinação (quando o campo tem múltiplos termos, ex.: "Rádio e Portal")
Aplicar em ordem (primeiro match vence):
1. Contém Rádio + qualquer outro → **Rádio**
2. Contém TV + qualquer outro → **TV**
3. Contém Redes Sociais isolado ou combinado com Portal/Blog → **Redes Sociais** somente se NÃO houver Rádio/TV
4. Jornal Impresso + Portal → manter **separado** como "Jornal Impresso + Portal" (conflito real entre mídia física e digital, conforme orientação de manter separado quando há divergência)
5. Demais combinações com 2 canônicos distintos sem regra acima → **separado** como "A + B" ordenado alfabeticamente

### Fallback semântico
Quando `meio` for `null`/vazio/"—", analisar `veiculo` com a mesma tabela de keywords (ex.: "Rádio Difusora FM" → Rádio; "Portal G1" → Portal de Notícias; "Blog do Fulano" → Portal de Notícias).

Normalização: lowercase + remoção de acentos + remoção de pontuação antes de comparar.

## Implementação (1 arquivo, frontend only)

**`src/components/admin/press/PressCampaignDashboard.tsx`**

1. Criar helper `normalizeMeio(meio: string | null, veiculo?: string): string` no topo do arquivo com a tabela de regras acima.
2. No `useMemo` de `segFiltered` (linhas 104–115), trocar a chave de agregação `r.meio` por `normalizeMeio(r.meio)`. Como a view `press_segment_stats` não traz `veiculo`, o fallback semântico para linhas com `meio` vazio usará só `meio` aqui — suficiente para a maioria.
3. Na tabela "Ranking de leitores" (linha 300), trocar `{c.meio || '—'}` por `{normalizeMeio(c.meio, c.veiculo) || '—'}` para aplicar inclusive o fallback via `veiculo`.
4. Manter ordenação por `enviados` desc.

## O que NÃO muda

- Banco de dados, views (`press_segment_stats` etc.), edge functions e import XLSX permanecem intactos.
- O `meio` original dos contatos continua salvo como está — a normalização é só de exibição/agregação no dashboard.

## Fora de escopo (pode virar próximo passo se quiser)

- Botão "Aplicar normalização à base" (UPDATE em `press_contacts.meio`).
- Editar a tabela de regras pela UI.
