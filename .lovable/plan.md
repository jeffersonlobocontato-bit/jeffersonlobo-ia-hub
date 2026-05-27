
## Objetivo

Transformar o "Plano de Ação 30/60/90" do Teste de Maturidade em IA em um conteúdo mais profundo, criativo e **personalizado pelo tipo de respondente**:

- **PF (profissional de mercado)** — foco em empregabilidade, produtividade individual, portfólio, posicionamento, hard/soft skills.
- **PJ (liderança, gestor, empresário)** — foco em estratégia, governança, ROI, times, processos e cultura.

Cada bloco passa a entregar, além das 3 ações temporais: **uma trilha de conhecimento recomendada** (cursos/livros/comunidades/práticas) coerente com o perfil.

## Mudanças no banco

Estender `ia_maturity_recommendations` com colunas novas (sem quebrar o que existe):

- `acao_pf_30d`, `acao_pf_60d`, `acao_pf_90d` (text)
- `acao_pj_30d`, `acao_pj_60d`, `acao_pj_90d` (text)
- `aprendizado_pf` (jsonb — lista de itens: tipo, título, fonte/autor, link opcional)
- `aprendizado_pj` (jsonb — mesma estrutura)
- `por_que_importa` (text — 1 parágrafo de contexto estratégico)

Popular conteúdo novo, criativo e específico para as **8 competências × 2 níveis** (BÁSICO / INTERMEDIÁRIO) — 16 registros. Os campos antigos (`acao_30d/60d/90d`, `descricao`) permanecem como fallback.

Exemplo (Segurança · Básico · PJ):
- 30d: Publicar política oficial de uso de IA + lista de ferramentas homologadas; comunicar em town hall.
- 60d: Contratar DLP com regras específicas para prompts (Microsoft Purview, Nightfall ou Forcepoint); treinar lideranças em red-team de prompts.
- 90d: Rodar simulação de incidente (vazamento via chatbot) com plano de resposta; auditoria externa de exposição.
- Trilha PJ: livro *AI Snake Oil* (Narayanan), curso MIT Sloan "AI Strategy", framework NIST AI RMF, comunidade IAPP.

Exemplo (Segurança · Básico · PF):
- 30d: Auditar seus próprios hábitos — listar tudo que já colou em LLM público; revogar acessos.
- 60d: Dominar uso de modelos locais (Ollama, LM Studio) para dados sensíveis; configurar contas "workspace" sem treino.
- 90d: Certificar-se em fundamentos de segurança em IA (ex.: ISC2 Certified in AI Security, AI Safety Fundamentals da BlueDot).
- Trilha PF: curso DeepLearning.AI "Generative AI for Everyone", newsletter Latent Space, prática semanal de red-teaming de prompts.

(Mesmo nível de profundidade replicado para Estratégia, Processos, Dados, Ferramentas, Pessoas, Ética, Governança × Básico/Intermediário.)

## Mudanças no PDF (`src/lib/teste-ia-pdf.ts`)

1. Aceitar `finalidade` do lead e selecionar `acao_pf_*` ou `acao_pj_*` (fallback nos antigos).
2. Página 3 (Plano 30/60/90) reformatada para corrigir o **bug atual de sobreposição** ("30 DIAS" colidindo com o texto da ação): aumentar coluna do rótulo, quebrar linha do texto com `splitTextToSize` respeitando margem real.
3. Adicionar bloco "Por que importa" abaixo do título de cada plano.
4. Adicionar **nova página "Trilha de Conhecimento Recomendada"** ao final, listando os itens de `aprendizado_pf`/`aprendizado_pj` agrupados pelas 3 competências do plano — com tipo (📚 Livro / 🎓 Curso / 🧪 Prática / 👥 Comunidade / 📰 Newsletter).
5. Pequeno polimento visual: numeração dos passos com mais respiro, badges 30/60/90 com fundo colorido distinto.

## Mudanças na dashboard (`TesteIADashboard.tsx`)

1. Renderizar plano usando os novos campos PF/PJ conforme `lead.finalidade`.
2. Mostrar bloco "Por que importa" e a Trilha de Conhecimento como cards após o plano.
3. Nenhuma mudança em scoring/lógica do teste.

## Mudanças no admin

`AdminLeadsTab` já baixa o PDF — sem alteração de fluxo. Apenas se beneficia automaticamente do conteúdo mais rico.

## Resumo técnico

```text
DB:   ALTER TABLE ia_maturity_recommendations ADD … (6 colunas) + UPDATE de 16 linhas
PDF:  refator de layout pág. 3 + nova pág. 4 (trilha) + seleção por finalidade
UI:   TesteIADashboard lê novos campos e renderiza trilha
```

Sem mudanças em autenticação, RLS ou estrutura de leads.

## Fora de escopo

- Geração dinâmica por LLM (poderíamos fazer numa próxima iteração via edge function se quiser conteúdo ainda mais personalizado pelas respostas exatas).
- Tradução/i18n.
- Reescrita do questionário.
