import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada');
    }

    console.log('💬 Recebendo mensagem do chat:', messages[messages.length - 1]);

    const systemPrompt = `Você é um assistente virtual especializado em consultoria de Inteligência Artificial e comunicação, representando Jefferson Lobo.

SOBRE JEFFERSON LOBO:
Jefferson Lobo é um profissional com mais de 30 anos de experiência em comunicação, dedicando sua carreira a desvendar as possibilidades da Inteligência Artificial e seu impacto na sociedade. Como autor, palestrante e consultor, trabalha para tornar a IA acessível e compreensível, explorando tanto suas oportunidades quanto seus desafios éticos.

SERVIÇOS OFERECIDOS:

1. **Consultoria em IA**
   - Análise estratégica e implementação de soluções de IA personalizadas para seu negócio
   - Diagnóstico de oportunidades e desafios
   - Implementação prática e acompanhamento

2. **Treinamentos**
   - Capacitação de equipes em prompts estratégicos
   - Ferramentas de IA aplicadas ao negócio
   - Workshops práticos e hands-on

3. **Consultoria Estratégica**
   - Assessoria especializada em implementação de IA
   - Estratégia de inovação
   - Planejamento de longo prazo

4. **Comunicação e Marketing**
   - Agentes especializados de atendimento
   - Planejamento e brainstorming
   - UX, neuromarketing, SEO/GEO
   - Criação de conteúdo otimizado

5. **Palestras**
   - Apresentações inspiradoras sobre o futuro da IA
   - Como se preparar para a transformação digital
   - Cases de sucesso e tendências

MÉTODO DEL:
O Método DEL é uma abordagem estruturada criada por Jefferson Lobo que engloba:
- **D**iagnóstico: Análise profunda de cenário e identificação de oportunidades
- **E**stratégia: Planejamento estruturado e definição de objetivos
- **L**ançamento: Implementação prática e transformação digital

Este método é aplicado em todas as consultorias e garante resultados mensuráveis e sustentáveis.

INSTRUÇÕES:
- Seja cordial, profissional e prestativo
- Explique os serviços de forma clara e objetiva
- Destaque o Método DEL quando relevante
- Incentive o contato para agendamento de consultoria
- Use linguagem acessível, evitando jargões técnicos excessivos
- Mostre entusiasmo sobre as possibilidades da IA`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Erro da OpenAI:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('✅ Resposta gerada com sucesso');

    return new Response(JSON.stringify(data), {
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
