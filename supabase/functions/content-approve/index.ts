// Aprova/rejeita um post do pipeline direto de um link — pensado para ser aberto do
// celular, a partir do link que vem na notificação do Telegram, sem precisar logar no
// admin. Protegido por um token assinado (ver _shared/approval-token.ts), não por login,
// então a página confirma a ação com uma tela simples em vez de devolver JSON.
import { createClient } from 'npm:@supabase/supabase-js@2';
import { verifyApprovalToken } from '../_shared/approval-token.ts';

function page(title: string, message: string, ok: boolean): Response {
  const html = `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title}</title>
<style>
  body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;background:#14231f;color:#efe9dd;font-family:ui-sans-serif,system-ui,sans-serif;padding:24px;text-align:center;}
  .card{max-width:420px;}
  h1{font-size:1.5rem;margin:0 0 12px;color:${ok ? '#e7a45c' : '#e57373'};}
  p{color:#b9c7c2;line-height:1.5;}
</style></head>
<body><div class="card"><h1>${ok ? '✅' : '⚠️'} ${title}</h1><p>${message}</p></div></body></html>`;
  return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const postId = url.searchParams.get('post');
  const action = url.searchParams.get('action');
  const token = url.searchParams.get('token');

  if (!postId || (action !== 'approve' && action !== 'reject') || !token) {
    return page('Link inválido', 'Faltam parâmetros no link. Aprove pelo painel admin.', false);
  }

  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const supabase = createClient(Deno.env.get('SUPABASE_URL')!, serviceKey);

  const valid = await verifyApprovalToken(serviceKey, postId, action, token);
  if (!valid) {
    return page('Link inválido', 'Esse link não é válido — aprove pelo painel admin.', false);
  }

  const { data: post, error } = await supabase.from('blog_posts').select('id, title, status').eq('id', postId).single();
  if (error || !post) {
    return page('Não encontrado', 'Esse rascunho não existe mais.', false);
  }

  if (post.status === 'published') {
    return page('Já publicado', `"${post.title}" já foi ao ar — nada a fazer.`, true);
  }
  if (post.status === 'approved' && action === 'approve') {
    return page('Já aprovado', `"${post.title}" já estava aprovado. Vai ao ar às 10h.`, true);
  }
  if (post.status === 'rejected' && action === 'reject') {
    return page('Já rejeitado', `"${post.title}" já estava marcado como rejeitado.`, true);
  }

  const newStatus = action === 'approve' ? 'approved' : 'rejected';
  const { error: updateErr } = await supabase
    .from('blog_posts')
    .update({ status: newStatus, active: false })
    .eq('id', postId);
  if (updateErr) {
    return page('Erro', `Não consegui atualizar: ${updateErr.message}`, false);
  }

  return action === 'approve'
    ? page('Aprovado', `"${post.title}" foi aprovado. Vai ao ar automaticamente às 10h (ou já, se passou do horário).`, true)
    : page('Rejeitado', `"${post.title}" foi marcado como rejeitado e não vai ser publicado.`, true);
});
