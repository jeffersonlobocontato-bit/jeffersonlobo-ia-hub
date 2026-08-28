// Token assinado (HMAC-SHA256) para os links de aprovar/rejeitar direto do Telegram,
// sem precisar abrir o painel admin. Usa a service_role key do projeto como segredo —
// só as Edge Functions (server-side) têm acesso a ela, nunca é exposta ao navegador.
// Sem expiração: o link some de relevância assim que o post é aprovado/rejeitado/publicado
// (a verificação sempre confere o estado atual do post, não só o token).

async function hmac(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message));
  return Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .slice(0, 32);
}

export async function signApprovalToken(secret: string, postId: string, action: 'approve' | 'reject'): Promise<string> {
  return hmac(secret, `${postId}:${action}`);
}

export async function verifyApprovalToken(
  secret: string,
  postId: string,
  action: 'approve' | 'reject',
  token: string,
): Promise<boolean> {
  const expected = await hmac(secret, `${postId}:${action}`);
  return expected === token;
}
