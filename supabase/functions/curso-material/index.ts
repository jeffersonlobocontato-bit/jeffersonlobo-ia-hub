// Entrega dos materiais do curso. PDF sai com marca d'água (e-mail do aluno
// em cada página); os outros arquivos (instalador .zip) saem por URL assinada.
// Todo download fica registrado em curso_downloads.
//
// POST { curso, caminho }  (caminho dentro do bucket privado `cursos`)
// verify_jwt = true: só aluno logado. Conferimos o acesso com o próprio token
// do aluno (tem_acesso_curso) e lemos o arquivo com a service role.
import { createClient } from 'npm:@supabase/supabase-js@2';
import * as pdfLib from 'npm:pdf-lib@1.17.1';
import { carimbarPdf } from '../_shared/cursos/marca-dagua.ts';
import { CATALOGO } from '../_shared/cursos/catalogo.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Expose-Headers': 'content-disposition',
};
const json = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json(405, { erro: 'use POST' });

  const auth = req.headers.get('Authorization') ?? '';
  const url = Deno.env.get('SUPABASE_URL')!;
  const doAluno = createClient(url, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
  const { data: u } = await doAluno.auth.getUser();
  const user = u?.user;
  if (!user?.email) return json(401, { erro: 'faça login' });

  // deno-lint-ignore no-explicit-any
  let corpo: any;
  try {
    corpo = await req.json();
  } catch {
    return json(400, { erro: 'JSON inválido' });
  }
  const curso = String(corpo?.curso ?? '');
  const caminho = String(corpo?.caminho ?? '');
  if (!CATALOGO[curso] || !caminho.startsWith(`${curso}/`) || caminho.includes('..') || caminho.length > 300) {
    return json(400, { erro: 'material inválido' });
  }

  const { data: temAcesso } = await doAluno.rpc('tem_acesso_curso', { _curso: curso });
  if (!temAcesso) return json(403, { erro: 'sem acesso a este curso' });

  const servico = createClient(url, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
  const nome = caminho.split('/').pop() ?? 'material';
  const ehPdf = nome.toLowerCase().endsWith('.pdf');

  const registrar = (marca: boolean) =>
    servico.from('curso_downloads').insert({ user_id: user.id, email: user.email!.toLowerCase(), curso_slug: curso, caminho, marca_dagua: marca });

  if (!ehPdf) {
    const { data, error } = await servico.storage.from('cursos').createSignedUrl(caminho, 3600, { download: nome });
    if (error || !data?.signedUrl) return json(404, { erro: 'material ainda não disponível' });
    await registrar(false);
    return json(200, { url: data.signedUrl });
  }

  const { data: arquivo, error } = await servico.storage.from('cursos').download(caminho);
  if (error || !arquivo) return json(404, { erro: 'material ainda não disponível' });

  try {
    const { data: acesso } = await servico.from('curso_acessos').select('nome').eq('email', user.email.toLowerCase()).eq('curso_slug', curso).maybeSingle();
    const carimbado = await carimbarPdf(pdfLib, new Uint8Array(await arquivo.arrayBuffer()), {
      email: user.email.toLowerCase(),
      nome: acesso?.nome ?? null,
      curso: CATALOGO[curso].nome,
    });
    await registrar(true);
    return new Response(carimbado, {
      status: 200,
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${nome.replace(/"/g, '')}"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (e) {
    console.error('curso-material', e);
    return json(500, { erro: 'não consegui preparar o PDF agora' });
  }
});
