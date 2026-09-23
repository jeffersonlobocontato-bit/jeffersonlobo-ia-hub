// Transcreve a gravação de um projeto de vídeo (Editor de Vídeo, Admin) com
// a API de áudio da OpenAI (Whisper), pedindo o tempo de início/fim de cada
// palavra — é isso que permite a legenda karaokê sincronizada.
//
// Só admin pode chamar (mesmo padrão de populate-knowledge): custa por
// chamada e processa arquivo enviado pelo usuário, então confere o token do
// chamador e o papel antes de gastar a chamada à OpenAI.
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Limite da própria API de transcrição da OpenAI.
const TAMANHO_MAXIMO_BYTES = 25 * 1024 * 1024;

interface PalavraOpenAI {
  word: string;
  start: number;
  end: number;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
  const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
  const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

  try {
    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY não configurada nos secrets do projeto — é uma chave própria da OpenAI (a API de transcrição de áudio não passa pelo gateway do Lovable).');
    }

    // Só admin transcreve (chamada paga por uso).
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

    const { mediaUrl } = await req.json();
    if (!mediaUrl || typeof mediaUrl !== 'string') throw new Error('mediaUrl é obrigatório');

    // Só aceita mídia do próprio bucket do editor de vídeo — evita virar um
    // proxy de download/transcrição de qualquer URL arbitrária.
    const prefixoEsperado = `${supabaseUrl}/storage/v1/object/public/video-projects/`;
    if (!mediaUrl.startsWith(prefixoEsperado)) {
      throw new Error('mediaUrl precisa ser um arquivo do bucket video-projects');
    }

    const mediaRes = await fetch(mediaUrl);
    if (!mediaRes.ok) throw new Error(`Não consegui baixar a mídia (${mediaRes.status})`);
    // Confere o tamanho pelo header antes de baixar o corpo inteiro — falha
    // rápido num arquivo grande demais em vez de gastar banda/memória com um
    // download que ia ser descartado de qualquer jeito.
    const tamanhoAnunciado = Number(mediaRes.headers.get('content-length') || 0);
    if (tamanhoAnunciado > TAMANHO_MAXIMO_BYTES) {
      throw new Error(`Arquivo tem ${(tamanhoAnunciado / 1024 / 1024).toFixed(1)}MB — a transcrição só aceita até 25MB. Use um trecho mais curto ou exporte só o áudio.`);
    }
    const mediaBlob = await mediaRes.blob();
    if (mediaBlob.size > TAMANHO_MAXIMO_BYTES) {
      throw new Error(`Arquivo tem ${(mediaBlob.size / 1024 / 1024).toFixed(1)}MB — a transcrição só aceita até 25MB. Use um trecho mais curto ou exporte só o áudio.`);
    }

    const nomeArquivo = mediaUrl.split('/').pop() || 'gravacao.mp4';
    const form = new FormData();
    form.append('file', mediaBlob, nomeArquivo);
    form.append('model', 'whisper-1');
    form.append('language', 'pt');
    form.append('response_format', 'verbose_json');
    form.append('timestamp_granularities[]', 'word');

    const transcriptionRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${openAIApiKey}` },
      body: form,
    });
    if (!transcriptionRes.ok) {
      const errText = await transcriptionRes.text();
      throw new Error(`OpenAI (transcrição) falhou (${transcriptionRes.status}): ${errText.slice(0, 500)}`);
    }
    const data = await transcriptionRes.json();
    const palavrasOpenAI: PalavraOpenAI[] = Array.isArray(data.words) ? data.words : [];

    const palavras = palavrasOpenAI.map((w) => ({
      texto: w.word,
      inicio: w.start,
      fim: w.end,
    }));

    return new Response(
      JSON.stringify({ ok: true, textoCompleto: String(data.text || ''), palavras }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('transcribe-video falhou', message);
    return new Response(JSON.stringify({ ok: false, error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
