# Plano: resumo curto do perfil com CTA "Saiba mais"

## Objetivo
Reduzir o texto inicial da seção "Sobre" para um resumo curto e convidativo, mantendo a biografia completa acessível através de um CTA expansível "Saiba mais".

## O que será alterado

### 1. Banco de dados
- Adicionar coluna `short_description` (TEXT, nullable) na tabela `public.about_content`.
- Criar migration SQL para a nova coluna.
- Manter `description` como o texto completo/expandido.

### 2. Componente público `src/components/AboutSection.tsx`
- Exibir `short_description` como texto principal/resumo.
- Adicionar botão "Saiba mais sobre o Lobo" abaixo do resumo.
- Ao clicar, expandir suavemente a `description` completa (animação de altura/opacidade).
- Permitir recolher o texto expandido.
- Fallback: se `short_description` estiver vazio, manter o comportamento atual (mostrar `description` completo) para não quebrar o site enquanto o conteúdo não for editado.
- Atualizar o `defaultData` local com um `short_description` de exemplo.

## Sugestão de copy para o resumo curto
**Opção principal (recomendada):**
> "Head Executivo de Marketing do Sistema Fiep. Ajudo lideranças e times a orquestrarem fluxos de IA com identidade própria — saindo da era dos prompts genéricos para agentes de marca que realmente performam."

**Opção alternativa (mais direta):**
> "Estrategista de IA para marketing e marca: transformo prompts genéricos em agentes com DNA autoral para empresas e diretorias no Brasil."

A biografia completa continua sendo o texto atual, expandido ao clicar em "Saiba mais sobre o Lobo".

### 3. Painel admin `src/components/admin/AdminAboutTab.tsx`
- Adicionar campo "Resumo Curto" (textarea) editando `short_description`.
- Renomear o campo existente "Descrição" para "Biografia Completa (expandida)" para deixar clara a diferença.
- Ajustar placeholders e labels.

### 4. Validações e ajustes
- Garantir que o botão use os tokens de cor primária e estilo consistente com os demais CTAs do site.
- Preservar responsividade mobile: resumo e botão bem espaçados, expansão sem quebrar layout.
- Manter acessibilidade: botão com `aria-expanded` e transição suave.

## Não será alterado
- Estrutura da foto de perfil, título, read_line ou grid de serviços.
- Dados existentes de `description` no banco.
- Permissões/RLS da tabela `about_content`.

## Critério de pronto
- A seção "Sobre" mostra apenas o resumo curto inicialmente.
- O botão "Saiba mais" expande a biografia completa com animação.
- O admin permite editar separadamente o resumo curto e a biografia completa.
- Build sem erros e preview validado.
