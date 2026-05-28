Vou tratar isso como regressão crítica e corrigir com o mínimo de mudança possível.

Plano:
1. Corrigir o erro global de CSS que está quebrando o preview: o `@import` de fonte em `src/index.css` está no meio do arquivo, e o Vite está acusando que ele precisa vir antes de qualquer regra. Isso pode causar tela preta/HMR quebrado mesmo antes do questionário avançar.
2. Remover a edição manual indevida em `src/integrations/supabase/types.ts` restaurando esse arquivo ao estado gerado automaticamente, sem depender dele para o fluxo do teste.
3. Blindar o fluxo do teste:
   - no início: se a criação do lead funcionar, garantir que `leadId` e `accessToken` sejam válidos antes de ir para o questionário;
   - no questionário: validar que o RPC `finalize_maturity_lead` realmente retornou sucesso antes de trocar para resultado;
   - no dashboard: se o resultado não carregar, mostrar erro recuperável em vez de deixar tela preta.
4. Manter a correção de segurança com `access_token` e RPCs, sem reabrir SELECT público direto na tabela de leads.
5. Validar novamente o fluxo principal: abrir teste, iniciar, carregar perguntas e evitar tela preta.

O que provavelmente aconteceu: ao tentar corrigir o acesso seguro dos leads, eu mudei o fluxo para RPCs e também houve alteração indevida no arquivo gerado de tipos. Além disso, há um erro de CSS já aparecendo no servidor (`@import must precede all other statements`) que pode derrubar a renderização/HMR. A correção agora será focada em estabilizar, não em adicionar recurso novo.