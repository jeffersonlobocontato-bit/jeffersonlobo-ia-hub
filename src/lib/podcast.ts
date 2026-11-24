// Regras comuns do podcast, usadas pelo site (src/) e pelo build
// (scripts/generate-sitemap.ts, que gera as páginas de compartilhamento).
// Mantenha este arquivo sem dependências de React/Vite para o build importar.

export const SITE_URL = 'https://jeffersonlobo.tech';

/** Nome do canal, igual ao título da seção de podcast do site. Vai no topo do card de compartilhamento. */
export const PODCAST_NOME = 'O Código Lobo';

interface EpisodioMinimo {
  id: string;
  title: string;
  episode_number?: number | null;
}

export function slugify(text: string): string {
  return (text || '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80)
    .replace(/-$/, '');
}

/**
 * Endereço do episódio: o título em forma de slug. Se dois episódios tiverem o
 * mesmo título, o mais novo da lista mantém o slug limpo e os outros ganham o
 * número do episódio (ou o começo do id) no fim — a lista precisa vir sempre na
 * mesma ordem (published_date desc) no site e no build.
 */
export function slugsDosEpisodios<T extends EpisodioMinimo>(episodios: T[]): Map<string, T> {
  const porSlug = new Map<string, T>();
  for (const ep of episodios) {
    let slug = slugify(ep.title) || ep.id.slice(0, 8);
    if (porSlug.has(slug)) slug = `${slug}-${ep.episode_number ?? ep.id.slice(0, 8)}`;
    porSlug.set(slug, ep);
  }
  return porSlug;
}

export function slugDoEpisodio<T extends EpisodioMinimo>(episodios: T[], ep: T): string {
  for (const [slug, e] of slugsDosEpisodios(episodios)) if (e.id === ep.id) return slug;
  return slugify(ep.title);
}

/** Página real do episódio (SPA). */
export const urlDoEpisodio = (slug: string) => `${SITE_URL}/podcast/${slug}`;

/**
 * Link de compartilhamento: arquivo estático gerado no build com og:image = card
 * do episódio (WhatsApp/LinkedIn não executam JS). Redireciona para /podcast/:slug.
 */
export const linkDeCompartilhamento = (slug: string) => `${SITE_URL}/episodio/${slug}.html`;

/** Versão para quebrar o cache de prévia do WhatsApp/LinkedIn quando o conteúdo muda. */
export function versaoDeCompartilhamento(valor?: string | null): string {
  return (valor || '').replace(/\D/g, '').slice(0, 12);
}
