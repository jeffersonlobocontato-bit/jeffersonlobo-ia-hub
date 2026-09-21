// Commita (cria ou atualiza) um arquivo de texto no repositório via GitHub
// Contents API. Extraído de publish-noticia-html.ts pra ser reaproveitado
// também por publish-sitemap-llms.ts — mesma lógica, um lugar só.
const GITHUB_OWNER = 'jeffersonlobocontato-bit';
const GITHUB_REPO = 'jeffersonlobo-ia-hub';
const GITHUB_BRANCH = 'main';

function toBase64Utf8(input: string): string {
  const bytes = new TextEncoder().encode(input);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary);
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function getCurrentSha(
  apiUrl: string,
  headers: Record<string, string>,
): Promise<{ ok: true; sha?: string } | { ok: false; reason: string }> {
  // Cache-Control/Pragma: logo após um commit em outro arquivo, a Contents API
  // às vezes devolve por 1-2s o estado anterior do repositório (visto em
  // produção: dois commits sequenciais próprios entrando em 409 um com o
  // outro). Pedir explicitamente pra não usar cache reduz isso, e o retry em
  // commitFile cobre o resto.
  const existing = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, {
    headers: { ...headers, 'Cache-Control': 'no-cache', Pragma: 'no-cache' },
  });
  if (existing.status === 200) {
    const data = await existing.json();
    return { ok: true, sha: data.sha };
  }
  if (existing.status === 404) return { ok: true, sha: undefined };
  const errText = await existing.text();
  return { ok: false, reason: `GET falhou (${existing.status}): ${errText.slice(0, 300)}` };
}

/**
 * Cria ou atualiza `path` no repositório com `content` (texto UTF-8), via
 * GitHub Contents API. Não lança erro — quem chama decide se loga/notifica
 * em caso de falha (ex.: token ausente).
 */
export async function commitFile(
  path: string,
  content: string,
  commitMessage: string,
): Promise<{ ok: boolean; reason?: string }> {
  const token = Deno.env.get('GITHUB_TOKEN');
  if (!token) return { ok: false, reason: 'GITHUB_TOKEN ausente nos secrets do projeto' };

  const apiUrl = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'User-Agent': 'jeffersonlobo-content-pipeline',
  };

  try {
    // Até 3 tentativas: se o PUT vier 409 (sha desatualizado — normalmente
    // por causa do delay de propagação descrito em getCurrentSha), busca o
    // sha de novo e tenta de novo, com um pequeno respiro entre elas.
    for (let attempt = 1; attempt <= 3; attempt++) {
      const shaResult = await getCurrentSha(apiUrl, headers);
      if (!shaResult.ok) return shaResult;

      const res = await fetch(apiUrl, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: commitMessage,
          content: toBase64Utf8(content),
          branch: GITHUB_BRANCH,
          ...(shaResult.sha ? { sha: shaResult.sha } : {}),
        }),
      });

      if (res.ok) return { ok: true };

      const errText = await res.text();
      if (res.status !== 409 || attempt === 3) {
        return { ok: false, reason: `PUT falhou (${res.status}): ${errText.slice(0, 300)}` };
      }
      await sleep(700 * attempt);
    }
    return { ok: false, reason: 'PUT falhou: esgotou tentativas após 409 repetido' };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
