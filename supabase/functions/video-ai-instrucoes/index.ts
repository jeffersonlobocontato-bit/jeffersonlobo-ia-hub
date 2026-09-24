// "Modo automático" nº 2 do Editor de Vídeo: o admin escreve em português o
// que quer ("legenda estilo manchete, filtro vintage mais forte, tira a
// trilha sonora") e essa função traduz isso num patch de config, usando o
// mesmo AI Gateway do Lovable que o chat-uivo-lobo já usa.
//
// Só mexe numa lista fechada de campos (via function calling) — nunca URLs,
// nunca texto livre de conteúdo (título, legenda de exemplo etc.), só os
// toggles/ajustes de estilo. Isso evita a IA "inventar" um campo que não
// existe ou reescrever conteúdo que o usuário não pediu pra mudar.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FERRAMENTA = {
  type: 'function',
  function: {
    name: 'aplicar_patch_edicao',
    description: 'Aplica os ajustes de configuração do vídeo que a instrução do usuário pediu. Só preencha os campos que a instrução realmente pediu pra mudar — deixe os outros de fora (não envie null nem o valor atual).',
    parameters: {
      type: 'object',
      properties: {
        paleta: { type: 'string', enum: ['ambar', 'ciano', 'sage'], description: 'Paleta de cor geral do vídeo' },
        mostrarZonasSeguras: { type: 'boolean', description: 'Mostrar as zonas seguras (área coberta pela interface do Reels/TikTok) no palco' },
        legendaEstilo: { type: 'string', enum: ['karaoke', 'frase', 'manchete'], description: 'Estilo visual da legenda sincronizada' },
        filtroVintageAtivo: { type: 'boolean', description: 'Ligar/desligar o filtro vintage (grão + tom quente + vinheta)' },
        filtroVintageIntensidade: { type: 'number', minimum: 0, maximum: 100, description: 'Intensidade do filtro vintage, 0 a 100' },
        overlayFundoAtivo: { type: 'boolean', description: 'Ligar/desligar a imagem de referência atrás de quem fala' },
        trilhaSonoraAtiva: { type: 'boolean', description: 'Ligar/desligar a música de fundo' },
        trilhaSonoraVolume: { type: 'number', minimum: 0, maximum: 100, description: 'Volume da trilha sonora, 0 a 100' },
        trilhaSonoraFadeInSegundos: { type: 'number', minimum: 0, maximum: 5, description: 'Fade de entrada da trilha, em segundos' },
        trilhaSonoraFadeOutSegundos: { type: 'number', minimum: 0, maximum: 5, description: 'Fade de saída da trilha, em segundos' },
        resumo: { type: 'string', description: 'Frase curta em português explicando o que foi ajustado (ou, se nada da instrução mapeou pra um campo conhecido, explicando isso educadamente)' },
      },
      required: ['resumo'],
    },
  },
};

const SYSTEM_PROMPT = `Você traduz uma instrução em português de um editor de vídeo (Admin do site jeffersonlobo.tech) em ajustes de configuração, chamando SEMPRE a ferramenta aplicar_patch_edicao.

Regras:
- Só preencha os campos que a instrução pediu pra mudar. Não invente ajustes que não foram pedidos.
- Você só pode mexer nos campos que a ferramenta define — não existe nenhum outro campo (nada de "headline com contorno", "zoom automático" ou "tela dividida": esses recursos ainda não existem neste editor).
- Se a instrução pedir algo que não tem campo correspondente, ignore esse pedido específico e diga isso no resumo, com bom humor mas honestidade — não finja que aplicou.
- resumo é sempre obrigatório, mesmo se nada foi aplicado.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

  try {
    if (!LOVABLE_API_KEY) throw new Error('LOVABLE_API_KEY não configurada');

    const authHeader = req.headers.get('Authorization') ?? '';
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const { data: isAdmin } = await callerClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { instrucao, resumoAtual } = await req.json();
    if (!instrucao || typeof instrucao !== 'string' || instrucao.length > 500) {
      throw new Error('instrucao é obrigatória (texto, até 500 caracteres)');
    }

    const contextoAtual = resumoAtual && typeof resumoAtual === 'object'
      ? `Estado atual da configuração (JSON): ${JSON.stringify(resumoAtual).slice(0, 1000)}`
      : 'Estado atual não informado.';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `${contextoAtual}\n\nInstrução do usuário: "${instrucao}"` },
        ],
        tools: [FERRAMENTA],
        tool_choice: { type: 'function', function: { name: 'aplicar_patch_edicao' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ ok: false, error: 'Limite de requisições atingido. Tente de novo em instantes.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ ok: false, error: 'Créditos insuficientes no AI Gateway.' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
      const errText = await response.text();
      throw new Error(`AI Gateway falhou (${response.status}): ${errText.slice(0, 500)}`);
    }

    const data = await response.json();
    const chamada = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!chamada?.function?.arguments) throw new Error('A IA não devolveu um ajuste válido — tente reformular a instrução.');

    const patch = JSON.parse(chamada.function.arguments);
    return new Response(JSON.stringify({ ok: true, patch }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('video-ai-instrucoes falhou', message);
    return new Response(JSON.stringify({ ok: false, error: message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
