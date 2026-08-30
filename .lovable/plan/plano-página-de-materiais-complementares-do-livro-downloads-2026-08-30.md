# Plano: página de materiais complementares do livro (downloads)

## Objetivo
Publicar no site os dois materiais complementares do livro "O código invisível dos superagentes de IA" — **Protocolo de auditoria de fidelidade autoral** e **Templates operacionais: seus três arquivos DEL** — para consulta online e download direto em PDF, sem exigir cadastro.

## O que será criado

### 1. Nova página `/materiais`
- Rota `/materiais` em `src/App.tsx`, nova página `src/pages/Materiais.tsx`.
- Cabeçalho na identidade visual atual do site (preto / off-white / amarelo, títulos em display uppercase) — o CSS de marca que veio no zip é usado apenas como referência, não é importado.
- Kicker "Material complementar", H1 "Materiais do livro", parágrafo curto explicando que são anexos operacionais do livro liberados para consulta e download.
- Grid com 2 cards, um por material: título, resumo de 1–2 linhas, e dois botões: **Baixar PDF** e **Ler online**.
- Header e Footer do site, SEO (`SEO.tsx`) com title/description próprios e breadcrumb.

### 2. Páginas de leitura online
- `/materiais/auditoria-del` e `/materiais/templates-del`, renderizando o conteúdo dos dois materiais como conteúdo real do site (checklists e templates convertidos para JSX com os tokens de cor do projeto, não iframe do HTML original).
- Botões no topo: **Baixar PDF** e **Copiar texto** (copia o conteúdo em texto puro, útil para os templates DEL que se salvam como .txt).
- Índice interno curto no topo de cada material.

### 3. Arquivos PDF
- Os dois PDFs (`auditoria-del.pdf`, `templates-del.pdf`) publicados como assets via `lovable-assets`, referenciados pelos botões de download com `download` no link.
- Sem cópia dos binários para o repositório.

### 4. Ligações de entrada
- Botão **"Materiais complementares"** na seção do livro (`BookSection.tsx`), ao lado dos CTAs existentes, apontando para `/materiais`.
- Link "Materiais" no menu do `Header` e no `Footer`.
- Cliques nos downloads registrados via `useTrackCTA` (`material_download_auditoria` / `material_download_templates`) para aparecerem na analytics do painel.

### 5. SEO
- `/materiais` e as duas páginas de leitura adicionadas ao `sitemap.xml` (via `scripts/generate-sitemap.ts`).
- Um H1 por página, metadados próprios, texto real indexável (por isso o conteúdo é reescrito em JSX em vez de PDF embutido).

## Notas técnicas
- Nenhuma mudança de banco de dados: o conteúdo é estático em código, não editável pelo admin.
- As fontes IBM Plex Mono / Instrument Serif / Manrope do zip **não** serão adicionadas — o site mantém sua tipografia atual para não criar duas identidades.
- Fallback: se um PDF falhar em carregar, o botão "Ler online" continua entregando o conteúdo.

## Fora do escopo
- Captura de lead / formulário antes do download (downloads abertos, conforme escolhido).
- Plano anterior do resumo curto no perfil — descartado, a seção "Sobre" fica como está.

## Critério de pronto
- `/materiais` lista os dois materiais com download funcionando (PDF abre/baixa).
- As duas páginas de leitura online exibem o conteúdo completo, responsivo no mobile.
- Links de entrada no livro, header e footer funcionando; build sem erros.
