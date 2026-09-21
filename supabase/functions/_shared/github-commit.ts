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
    let sha: string | undefined;
    const existing = await fetch(`${apiUrl}?ref=${GITHUB_BRANCH}`, { headers });
    if (existing.status === 200) {
      const data = await existing.json();
      sha = data.sha;
    } else if (existing.status !== 404) {
      const errText = await existing.text();
      return { ok: false, reason: `GET falhou (${existing.status}): ${errText.slice(0, 300)}` };
    }

    const res = await fetch(apiUrl, {
      method: 'PUT',
      headers,
      body: JSON.stringify({
        message: commitMessage,
        content: toBase64Utf8(content),
        branch: GITHUB_BRANCH,
        ...(sha ? { sha } : {}),
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      return { ok: false, reason: `PUT falhou (${res.status}): ${errText.slice(0, 300)}` };
    }
    return { ok: true };
  } catch (e) {
    return { ok: false, reason: e instanceof Error ? e.message : String(e) };
  }
}
