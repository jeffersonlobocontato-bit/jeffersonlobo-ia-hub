# Fases 2 e 3 — tema global e componentes compartilhados

## Escopo
Aplicar juntas as Fases 2 e 3, sem iniciar a adaptação individual das páginas da Fase 4. As páginas existentes herdarão o novo tema; seus layouts, conteúdo e funcionalidades serão preservados.

## 1. Preservar a Academia
- Não editar `src/styles/escola.css`, a classe `.escola`, `Vitrine.tsx`, `IlhaVendas.tsx` nem os componentes de `src/components/cursos/escola/`.
- Registrar a aparência de `/cursos` e `/cursos/ilha` antes das mudanças, em desktop e 390px, para comparar depois.
- Evitar que novas regras globais de títulos, corpo e controles sobrescrevam os estilos locais da Academia. Se houver interferência herdada, ajustar apenas as novas regras globais.

## 2. Substituir os tokens globais
**Arquivos principais:** `src/index.css` e `tailwind.config.ts`.
- Tema único escuro em `:root`, com fundo próximo de `#050505`, texto branco, texto secundário `0 0% 71%`, card branco a 3% e bordas brancas a 8%.
- Primary, accent e ring em `171 77% 64%`; criar token de hover equivalente a `#2DD4BF`.
- Substituir os tokens atuais, sem criar tema paralelo; remover o bloco `.dark`.
- Definir tokens semânticos de raio para botão (999px), card (24px) e input (12px), além da sombra de card e dos estados de botão pedidos.
- Atualizar as utilidades compartilhadas dependentes do tema antigo, incluindo `.display-title`, `.highlight-yellow`, kickers, destaques e painéis.

## 3. Tipografia e remoção de alternância
- Inter no corpo e nos títulos; títulos com peso 500. `.display-title` e `.highlight-yellow` passam a usar Inter; destaque em teal, sem itálico.
- IBM Plex Mono em kickers, chips e dados, com tratamento consistente nos componentes compartilhados.
- Remover os efeitos que adicionam `dark` em `Index`, `BlogIndex`, `BlogPost`, `TesteIA` e `Claudia`, e eliminar a dependência de tema do componente de notificações. Revisar marcadores e variantes de tema para manter legibilidade no tema único.
- Trocar usos de `font-serif` e referências diretas às fontes antigas por Inter, somente como substituição tipográfica mecânica, sem redesenhar as páginas. Preservar a classe `.display-title` como utilidade pública, atualizando sua definição.
- Após essa substituição, retirar Instrument Serif, Manrope, DM Sans e Source Serif 4 do carregamento web. Em `index.html`, alterar **somente o link de fontes**; o restante do head, Meta Pixel e JSON-LD permanece intacto.
- Não tocar nas fontes ou no conteúdo de `teste-ia-pdf.ts` e `branded-cover.ts`; esses usos continuam pendentes para a Fase 6.

## 4. Componentes compartilhados
- **Button:** pílula escura com fundo preto a 72%, borda teal a 45%, brilho teal a 35%, hover e foco por tokens. Preservar variantes e comportamento.
- **Card:** fundo branco a 3%, borda branca a 8%, raio de 24px e sombra `0 20px 40px` preta a 55%.
- **Input e controles equivalentes:** raio de 12px, borda e foco consistentes.
- **Badge:** IBM Plex Mono e cores do novo tema.
- **Header:** reproduzir a linguagem do EscolaTopo — transparência inicial e vidro em pílula ao rolar — mantendo os links, textos, menu móvel e ações de conta atuais; logo em Inter com Lobo em teal.
- **Footer:** reproduzir a linguagem do EscolaRodape — assinatura ampla, divisórias discretas e acabamento escuro — mantendo todos os textos, contatos, links e ações atuais; Lobo em teal.
- Não importar os componentes da Academia para substituir os do site nem adicionar conteúdo comercial da Academia ao rodapé.

## 5. Verificação e entrega
- Verificar erros de compilação e execução e testar menu, navegação e controles compartilhados.
- Comparar `/cursos` e `/cursos/ilha` antes/depois em desktop e 390px; confirmar que não sofreram alteração visual.
- Conferir contraste dos componentes alterados e ausência de sobreposição no Header/Footer.
- Conferir que código de tracking, SEO, rotas, textos, lógica de negócio, banco e funções não mudou; verificar PageView em navegação real, sem simular compras ou gerar leads de teste.
- Entregar lista do que mudou por arquivo e pendências visuais das páginas; parar e aguardar aprovação antes da Fase 4. Não publicar nesta etapa.

## Limites e pendências previstas
- Classes e cores locais das páginas, gráficos e ferramentas administrativas podem continuar exigindo adaptação: serão identificadas, não redesenhadas agora.
- PDFs, capas OG, imagens e e-mails não serão alterados. A varredura final de fontes e cores deve distinguir essas exceções e os arquivos protegidos da Academia.
- O tema único pode expor classes locais claras ou cores fixas; inconsistências fora dos componentes compartilhados serão relatadas para a fase seguinte.

## Detalhes técnicos
- Cores, transparências, sombras e raios serão definidos como tokens semânticos, com cores HSL compatíveis com shadcn/Tailwind.
- `escola.css` usa tokens locais `--e-*` e regras próprias de tipografia; essas definições ficam intactas.
- A única exceção autorizada à proibição de editar `index.html` é a limpeza do link de fontes.
- O fundo exato `#050505` corresponde a aproximadamente `0 0% 1.96%`; não serão criadas regras específicas de tema claro.