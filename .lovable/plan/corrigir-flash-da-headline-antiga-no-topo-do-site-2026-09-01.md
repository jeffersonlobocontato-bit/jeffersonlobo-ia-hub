# Corrigir "flash" da headline antiga no topo do site

## O que está acontecendo

A headline do topo vem do banco (tabela de conteúdo do hero), mas o componente do hero tem um texto fixo de fallback escrito no código: "O marketing entrou na era da orquestração de fluxos com IA...". Enquanto a consulta ao banco não retorna (primeiro carregamento, sem cache), o site mostra esse texto antigo e depois troca pela headline real, cadastrada no admin:

- Banco: "IA está redesenhando empresas, carreiras e profissões. Lidere essa transformação."
- Fallback no código: a frase antiga do marketing/orquestração

## Correção

1. Atualizar o fallback do hero para refletir o conteúdo atual (headline, subtítulo e os três CTAs iguais aos do banco), para que nenhum texto obsoleto apareça em nenhuma situação.
2. Evitar o "pisca-pisca": enquanto o conteúdo do hero estiver carregando, exibir o bloco de texto com um placeholder neutro (skeleton) em vez de um texto diferente do final — assim o visitante nunca lê uma frase e vê ela mudar.
3. Manter o layout estável (mesma altura/estrutura) para não causar salto de conteúdo.

## Detalhes técnicos

- `src/hooks/useHeroContent.ts`: expor também `isLoading` (já disponível do React Query) e considerar `placeholderData` para reduzir o intervalo sem dados.
- `src/components/HeroSection.tsx`: sincronizar `defaultData` com os valores atuais do banco e usar `isLoading` para renderizar skeleton no título/subtítulo/CTAs em vez do fallback textual.
- Nenhuma mudança de banco, de dados ou de lógica de negócio; apenas apresentação.
