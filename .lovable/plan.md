# Rota /claude redirecionando para /claude.html

## O que muda
- Em `src/App.tsx`, adicionar `<Route path="/claude" ...>` acima do catch-all `*`.
- O elemento é um pequeno componente inline que, ao montar, executa `window.location.replace("/claude.html")` (sem entrada extra no histórico) e não renderiza nada.

## Atenção
- Hoje **não existe** `public/claude.html`. Sem esse arquivo, o redirecionamento cai na página do site em vez de um HTML próprio. É preciso enviar o arquivo (ou confirmar que ele será adicionado depois).
- Não mexo em mais nenhum arquivo nem publico.
