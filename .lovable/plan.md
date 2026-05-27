# Ajuste de posicionamento dos formatos de Palestras / Consultoria

Reposicionar dois dos três cards da `PalestrasSection` (e dados correspondentes em `palestra_formats`) para refletir o que você realmente entrega: conversa executiva e início de jornada — **sem implantação técnica**.

## Mudanças nos formatos

### 1. Keynote (manter)
Sem alterações de essência. Pequeno ajuste de copy só se necessário para harmonizar com os outros dois.

### 2. Workshop / Imersão — reposicionar
- **Kicker**: "Nivelamento e largada da jornada"
- **Público**: lideranças, gestores e times-chave (não desenvolvedores)
- **Objetivo**: sensibilizar, nivelar linguagem sobre IA, mapear oportunidades e **iniciar a construção da governança**
- **Entregáveis**:
  - Nivelamento conceitual de IA aplicada ao negócio
  - Mapa inicial de casos de uso priorizados
  - Princípios e diretrizes iniciais de governança de IA
  - Plano de primeiros 90 dias para a jornada interna
- **Deixar explícito**: não é treinamento técnico nem implantação de ferramentas

### 3. Consultoria estratégica — reposicionar
- **Kicker**: "Conversa com a liderança"
- **Público**: C-level, donos, diretores, gestores de área — **não é mesa técnica de TI**
- **Objetivo**: provocar e estruturar a decisão executiva sobre IA — visão, prioridades, riscos, governança e caminhos
- **Entregáveis**:
  - Sessões executivas de alinhamento (visão e ambição em IA)
  - Recomendação de prioridades e quick wins
  - Estrutura inicial de governança (papéis, princípios, guardrails)
  - Indicação de caminhos e parceiros para a execução
- **Deixar explícito no card**: "Não implanto projetos. Abro o caminho para que sua equipe (ou parceiros) executem com clareza."

## Onde aplicar

- Atualizar registros da tabela `palestra_formats` (campos `kicker`, `description`, `audience`, `deliverables`, eventualmente `title`) via migration de UPDATE — sem alterar estrutura da tabela.
- `src/components/PalestrasSection.tsx` já lê tudo do banco, então não precisa de mudança de código.
- Conferir o intro da seção (`h2` + parágrafo) para alinhar com a nova narrativa (tirar qualquer eco de "capacitar times" que sugira treinamento técnico).
- Ajustar opções do `BriefingForm` se necessário (rótulos de "consultoria" e "imersão") para refletir a mesma linguagem.

## Fora de escopo

- Não criar novos formatos nem novas tabelas.
- Não mexer em layout, ordem do Index, Hero ou prova social.
