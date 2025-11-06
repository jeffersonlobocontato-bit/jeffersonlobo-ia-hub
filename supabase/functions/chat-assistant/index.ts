import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ASSISTANT_ID = 'asst_Al7CbMOQtnWjVzxy2hDLzJdq';

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, threadId } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('💬 Recebendo mensagem do chat:', messages[messages.length - 1]);

    const headers = {
      'Authorization': `Bearer ${openAIApiKey}`,
      'Content-Type': 'application/json',
      'OpenAI-Beta': 'assistants=v2'
    };

    // Criar ou usar thread existente
    let currentThreadId = threadId;
    if (!currentThreadId) {
      console.log('🧵 Criando nova thread...');
      const threadResponse = await fetch('https://api.openai.com/v1/threads', {
        method: 'POST',
        headers,
      });

      if (!threadResponse.ok) {
        const error = await threadResponse.text();
        console.error('❌ Erro ao criar thread:', error);
        throw new Error(`Erro ao criar thread: ${threadResponse.status}`);
      }

      const threadData = await threadResponse.json();
      currentThreadId = threadData.id;
      console.log('✅ Thread criada:', currentThreadId);
    }

    // Adicionar mensagem do usuário à thread
    const userMessage = messages[messages.length - 1];
    console.log('📝 Adicionando mensagem à thread...');
    
    const messageResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        role: 'user',
        content: userMessage.content
      }),
    });

    if (!messageResponse.ok) {
      const error = await messageResponse.text();
      console.error('❌ Erro ao adicionar mensagem:', error);
      throw new Error(`Erro ao adicionar mensagem: ${messageResponse.status}`);
    }

    // Executar o assistente
    console.log('🤖 Executando assistente...');
    const runResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        assistant_id: ASSISTANT_ID,
      }),
    });

    if (!runResponse.ok) {
      const error = await runResponse.text();
      console.error('❌ Erro ao executar assistente:', error);
      throw new Error(`Erro ao executar assistente: ${runResponse.status}`);
    }

    const runData = await runResponse.json();
    const runId = runData.id;
    console.log('✅ Run iniciado:', runId);

    // Aguardar conclusão da execução
    let runStatus = 'queued';
    let attempts = 0;
    const maxAttempts = 30;

    while (runStatus !== 'completed' && attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const statusResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/runs/${runId}`, {
        headers,
      });

      if (!statusResponse.ok) {
        throw new Error(`Erro ao verificar status: ${statusResponse.status}`);
      }

      const statusData = await statusResponse.json();
      runStatus = statusData.status;
      console.log(`⏳ Status da execução: ${runStatus}`);

      if (runStatus === 'failed' || runStatus === 'cancelled' || runStatus === 'expired') {
        throw new Error(`Execução falhou com status: ${runStatus}`);
      }

      attempts++;
    }

    if (runStatus !== 'completed') {
      throw new Error('Timeout aguardando resposta do assistente');
    }

    // Buscar mensagens da thread
    console.log('📥 Buscando resposta...');
    const messagesResponse = await fetch(`https://api.openai.com/v1/threads/${currentThreadId}/messages?limit=1`, {
      headers,
    });

    if (!messagesResponse.ok) {
      throw new Error(`Erro ao buscar mensagens: ${messagesResponse.status}`);
    }

    const messagesData = await messagesResponse.json();
    const assistantMessage = messagesData.data[0];
    const content = assistantMessage.content[0].text.value;

    console.log('✅ Resposta gerada com sucesso');

    return new Response(JSON.stringify({ 
      content,
      threadId: currentThreadId 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('❌ Erro no chat-assistant:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
