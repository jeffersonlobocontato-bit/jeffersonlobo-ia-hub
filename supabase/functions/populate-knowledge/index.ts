import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { KNOWLEDGE_DOCUMENTS } from '../_shared/knowledge-content.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Split text into chunks
function splitIntoChunks(text: string, maxChunkSize: number = 1000): string[] {
  const paragraphs = text.split('\n\n').filter(p => p.trim().length > 0);
  const chunks: string[] = [];
  let currentChunk = '';

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize && currentChunk.length > 0) {
      chunks.push(currentChunk.trim());
      currentChunk = paragraph;
    } else {
      currentChunk += (currentChunk ? '\n\n' : '') + paragraph;
    }
  }

  if (currentChunk.trim().length > 0) {
    chunks.push(currentChunk.trim());
  }

  return chunks;
}

async function generateEmbedding(text: string, apiKey: string): Promise<number[]> {
  const response = await fetch('https://api.openai.com/v1/embeddings', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text,
    }),
  });

  if (!response.ok) {
    throw new Error(`Erro ao gerar embedding: ${response.status}`);
  }

  const data = await response.json();
  return data.data[0].embedding;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY não configurada');
    }

    // Só admin pode repopular a base — essa operação apaga tudo, gera
    // dezenas de chamadas de embedding (custo) e é destrutiva.
    const authHeader = req.headers.get('Authorization') ?? '';
    const callerClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user } } = await callerClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: isAdmin } = await callerClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('📚 Iniciando população da base de conhecimento');

    // Clear existing knowledge base
    await supabase.from('knowledge_base').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    console.log('🗑️ Base de conhecimento limpa');

    // Knowledge documents — fonte única em _shared/knowledge-content.ts
    const documents = KNOWLEDGE_DOCUMENTS;

    let processed = 0;
    const total = documents.length;

    for (const doc of documents) {
      console.log(`📄 Processando: ${doc.titulo}`);
      
      const chunks = splitIntoChunks(doc.conteudo, 800);
      
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const titulo = chunks.length > 1 ? `${doc.titulo} - Parte ${i + 1}` : doc.titulo;
        
        try {
          const embedding = await generateEmbedding(chunk, LOVABLE_API_KEY);
          
          const { error: insertError } = await supabase
            .from('knowledge_base')
            .insert({
              titulo,
              conteudo: chunk,
              fonte: doc.fonte,
              categoria: doc.categoria,
              embedding,
              metadata: { chunk_index: i, total_chunks: chunks.length }
            });

          if (insertError) {
            console.error(`❌ Erro ao inserir ${titulo}:`, insertError);
          } else {
            processed++;
          }
        } catch (error) {
          console.error(`❌ Erro ao processar ${titulo}:`, error);
        }

        // Delay to avoid rate limits
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`✅ Base de conhecimento populada: ${processed} chunks de ${total} documentos`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: `${processed} chunks processados de ${total} documentos` 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('❌ Erro em populate-knowledge:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Erro desconhecido' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
