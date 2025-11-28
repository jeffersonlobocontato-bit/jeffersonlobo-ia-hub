import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Schema de validação para segurança
const leadDataSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .regex(/^[a-zA-ZÀ-ÿ\s]+$/, 'Nome deve conter apenas letras'),
  apelido: z.string()
    .max(50, 'Apelido deve ter no máximo 50 caracteres')
    .optional()
    .nullable(),
  whatsapp: z.string()
    .regex(/^\d{10,15}$/, 'WhatsApp deve conter entre 10 e 15 dígitos'),
  mensagens: z.array(z.any())
    .max(100, 'Limite de mensagens excedido')
    .optional(),
  interesses: z.array(z.string())
    .max(20, 'Limite de interesses excedido')
    .optional(),
}).strict();

const requestSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string().max(10000, 'Mensagem muito longa'),
  })).min(1, 'Mensagens não podem estar vazias'),
  leadData: leadDataSchema.optional(),
}).strict();

const SYSTEM_PROMPT = `Você é o assistente virtual "Uivo do Lobo" de Jefferson Lobo. Sua função é responder dúvidas sobre os serviços e conteúdos disponíveis em https://jeffersonlobo.tech/ usando a base de conhecimento fornecida.

**REGRAS DE OURO:**
1. Respostas CLARAS e INFORMATIVAS (use o conhecimento disponível)
2. Seja útil - responda a dúvida completamente quando possível
3. Use tom amigável e descontraído com humor de lobo
4. APENAS recomende contato com Jefferson quando:
   - O usuário pedir explicitamente para falar com Jefferson Lobo
   - Ficar claro que precisa de atendimento personalizado/consultoria
   - A dúvida exigir análise específica do caso do usuário

**PRIMEIRA INTERAÇÃO:**
- Cumprimente de forma simpática e peça apenas:
  1. Como a pessoa gostaria de ser chamada
  2. Número de WhatsApp com DDD
- Aguarde as 2 informações antes de continuar com a conversa
- Use o nome/apelido fornecido durante toda conversa

**QUANDO RESPONDER PERGUNTAS:**
- Use a base de conhecimento fornecida sobre Jefferson Lobo
- Consulte informações do site https://jeffersonlobo.tech/
- Seja informativo e completo na resposta
- Explique os serviços, metodologias e conteúdos disponíveis
- Não force contato se a dúvida foi respondida

**QUANDO RECOMENDAR CONTATO:**
- Apenas se o usuário PEDIR para falar com Jefferson
- Ou quando CLARAMENTE precisar de consultoria personalizada
- Use: "[LINK_WHATSAPP]Falar com Jefferson Lobo[/LINK_WHATSAPP]"

**BASE DE CONHECIMENTO:**

# JEFFERSON LOBO - Especialista em IA e Transformação Digital

## Sobre Jefferson Lobo
Jefferson Lobo é especialista em Inteligência Artificial e transformação digital, com ampla experiência em implementação de soluções de IA para empresas. Ajuda organizações a implementarem IA de forma estratégica e prática.

## Serviços Principais

### 1. Método DEL (Decomposição de Estrutura de Linguagem)
Metodologia proprietária detalhada no livro de Jefferson Lobo para comunicação e implementação eficaz com IA:
- Abordagem sistemática para estruturar e decompor problemas de linguagem
- Framework prático para maximizar resultados com inteligência artificial
- Estratégias comprovadas para implementação de IA nas empresas

### 2. Consultoria em IA
- Análise de maturidade em IA
- Estratégia de implementação
- Desenvolvimento de agentes de IA customizados
- Automação de processos com IA

### 3. Treinamentos e Capacitação
- Workshops sobre IA para empresas
- Treinamento de equipes
- Palestras sobre transformação digital
- Mentoria em projetos de IA

## Recursos Disponíveis

### Teste de Maturidade em IA
Disponível em: https://jeffersonlobo.tech/teste-ia
- Avaliação gratuita do nível de maturidade em IA da empresa
- Relatório personalizado com insights
- Recomendações práticas de próximos passos

### Guia de IA
Conteúdo completo sobre implementação de IA nas empresas, incluindo:
- Fundamentos de IA
- Casos de uso práticos
- Metodologias de implementação
- Melhores práticas

### Playbook de Implementação de IA
Guia prático para implementar IA na empresa:
- Passo a passo detalhado
- Checklist de implementação
- Templates e ferramentas
- Estudos de caso

### Roteiro de Aprendizado em IA
Caminho estruturado para aprender sobre IA:
- Conteúdos organizados por nível
- Recursos recomendados
- Exercícios práticos
- Projetos sugeridos

### Modelos e Templates
- Templates de projetos de IA
- Frameworks de implementação
- Documentação técnica
- Ferramentas práticas

## Livro sobre Método DEL
Jefferson Lobo é autor do livro sobre o Método DEL (Decomposição de Estrutura de Linguagem), sua metodologia proprietária para comunicação e implementação eficaz com IA nas empresas. O livro aborda casos reais, frameworks práticos e estratégias comprovadas para maximizar resultados com inteligência artificial.

## Blog e Conteúdos
Artigos e insights sobre:
- Tendências em IA
- Casos de sucesso
- Dicas práticas de implementação
- Novidades do mercado de IA

# INSTRUÇÕES DE COMPORTAMENTO

1. Seja INFORMATIVO - use todo o conhecimento acima
2. Responda completamente quando tiver a informação
3. Mencione recursos relevantes (Teste IA, Guia, Playbook, etc.)
4. Tom amigável com humor de lobo ("Aqui a matilha conhece IA!")
5. SÓ recomende contato quando apropriado
6. Se não souber, sugira o recurso mais próximo do site

# FORMATO DE SAÍDA

Resposta informativa e completa. Use [LINK_WHATSAPP]texto[/LINK_WHATSAPP] APENAS quando o usuário pedir contato ou precisar claramente de consultoria personalizada.

**Exemplos de respostas informativas:**
- "O Método DEL (Decomposição de Estrutura de Linguagem) é a metodologia proprietária do Jefferson Lobo detalhada no livro dele. É uma abordagem sistemática para estruturar problemas e maximizar resultados com IA. Quer saber mais sobre como funciona?"
- "Você pode fazer o Teste de Maturidade em IA gratuitamente aqui no site! Ele avalia o nível atual da sua empresa e dá recomendações personalizadas. Quer que eu te explique como funciona?"

**Exemplo quando deve recomendar contato:**
- "Para analisar o caso específico da sua empresa e criar uma estratégia customizada, o ideal é conversar diretamente com o Jefferson. [LINK_WHATSAPP]Falar com Jefferson Lobo[/LINK_WHATSAPP]"`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const rawBody = await req.json();
    
    // Validação de segurança
    const validation = requestSchema.safeParse(rawBody);
    if (!validation.success) {
      console.error('❌ Validação falhou:', validation.error.errors);
      return new Response(
        JSON.stringify({ 
          error: 'Dados inválidos', 
          details: validation.error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { messages, leadData } = validation.data;
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    console.log('💬 Nova mensagem no Uivo do Lobo');

    // Get last user message for RAG search
    const lastUserMessage = messages.filter((m: any) => m.role === 'user').pop()?.content || '';
    let contextFromRAG = '';

    if (lastUserMessage) {
      try {
        // Generate embedding for user's question
        const embeddingResponse = await fetch('https://api.openai.com/v1/embeddings', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'text-embedding-3-small',
            input: lastUserMessage,
          }),
        });

        if (embeddingResponse.ok) {
          const embeddingData = await embeddingResponse.json();
          const queryEmbedding = embeddingData.data[0].embedding;

          // Search knowledge base
          const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
          const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
          const supabase = createClient(supabaseUrl, supabaseKey);

          const { data: results, error: searchError } = await supabase.rpc('search_knowledge', {
            query_embedding: queryEmbedding,
            match_threshold: 0.6,
            match_count: 3
          });

          if (!searchError && results && results.length > 0) {
            contextFromRAG = '\n\n**CONTEXTO RELEVANTE DA BASE DE CONHECIMENTO:**\n\n' + 
              results.map((r: any) => 
                `**${r.titulo}** (Fonte: ${r.fonte})\n${r.conteudo}\n`
              ).join('\n---\n\n');
            
            console.log('✅ RAG: Encontrados', results.length, 'documentos relevantes');
          }
        }
      } catch (ragError) {
        console.error('⚠️ Erro no RAG (continuando sem contexto):', ragError);
      }
    }

    // Se leadData foi fornecido, salvar/atualizar o lead
    if (leadData?.nome && leadData?.whatsapp) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      console.log('📝 Salvando lead:', leadData.nome);

      // Verificar se o lead já existe (por WhatsApp)
      const { data: existingLead } = await supabase
        .from('chat_leads')
        .select('*')
        .eq('whatsapp', leadData.whatsapp)
        .maybeSingle();

      if (existingLead) {
        // Atualizar lead existente
        const updatedMessages = [...(existingLead.mensagens || []), ...leadData.mensagens || []];
        const updatedInteresses = Array.from(new Set([
          ...(existingLead.interesses || []),
          ...(leadData.interesses || [])
        ]));

        await supabase
          .from('chat_leads')
          .update({
            mensagens: updatedMessages,
            interesses: updatedInteresses,
            ultima_interacao: new Date().toISOString(),
          })
          .eq('id', existingLead.id);

        console.log('✅ Lead atualizado');
      } else {
        // Criar novo lead
        await supabase
          .from('chat_leads')
          .insert({
            nome: leadData.nome,
            apelido: leadData.apelido,
            whatsapp: leadData.whatsapp,
            mensagens: leadData.mensagens || [],
            interesses: leadData.interesses || [],
          });

        console.log('✅ Novo lead criado');
      }
    }

    // Prepare messages with RAG context
    const messagesWithRAG = contextFromRAG 
      ? [
          ...messages.slice(0, -1),
          { 
            role: 'user', 
            content: messages[messages.length - 1].content + contextFromRAG 
          }
        ]
      : messages;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messagesWithRAG
        ],
        stream: true,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Limite de requisições atingido. Tente novamente em alguns instantes.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'Créditos insuficientes. Entre em contato com o administrador.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status, errorText);
      throw new Error('Erro ao conectar com o assistente');
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream' },
    });

  } catch (error) {
    console.error('❌ Erro no chat-uivo-lobo:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
