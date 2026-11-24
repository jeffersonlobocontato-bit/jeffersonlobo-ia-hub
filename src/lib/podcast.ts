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

// ---------------------------------------------------------------------------
// Séries (tabela podcast_series): dentro de uma série, a ordem é episode_number.
// ---------------------------------------------------------------------------

export interface SerieMinima {
  id: string;
  title: string;
  position?: number | null;
}

interface EpisodioComSerie extends EpisodioMinimo {
  series_id?: string | null;
  published_date: string;
}

export interface GrupoDeEpisodios<T, S extends SerieMinima = SerieMinima> {
  serie: S | null;
  episodios: T[];
}

/**
 * Agrupa para exibição/escuta: cada série (por position, depois título) com seus
 * episódios em ordem de número; no fim, os episódios sem série, do mais novo ao
 * mais antigo. Séries sem episódio ficam de fora.
 */
export function agruparPorSerie<T extends EpisodioComSerie, S extends SerieMinima>(
  episodios: T[],
  series: S[],
): GrupoDeEpisodios<T, S>[] {
  const ordenadas = [...series].sort(
    (a, b) => (a.position ?? 0) - (b.position ?? 0) || a.title.localeCompare(b.title, 'pt-BR'),
  );
  const grupos: GrupoDeEpisodios<T, S>[] = [];
  for (const serie of ordenadas) {
    const eps = episodios
      .filter((e) => e.series_id === serie.id)
      .sort(
        (a, b) =>
          (a.episode_number ?? Number.MAX_SAFE_INTEGER) - (b.episode_number ?? Number.MAX_SAFE_INTEGER) ||
          a.published_date.localeCompare(b.published_date),
      );
    if (eps.length) grupos.push({ serie, episodios: eps });
  }
  const conhecidas = new Set(ordenadas.map((s) => s.id));
  const avulsos = episodios
    .filter((e) => !e.series_id || !conhecidas.has(e.series_id))
    .sort((a, b) => b.published_date.localeCompare(a.published_date));
  if (avulsos.length) grupos.push({ serie: null, episodios: avulsos });
  return grupos;
}

/** Ordem de escuta: as séries em sequência (1, 2, 3...) e depois os avulsos. */
export function ordemDeEscuta<T extends EpisodioComSerie>(episodios: T[], series: SerieMinima[]): T[] {
  return agruparPorSerie(episodios, series).flatMap((g) => g.episodios);
}

/** Próximo episódio na ordem de escuta (volta ao começo no fim). */
export function proximoEpisodio<T extends EpisodioComSerie>(atual: T, episodios: T[], series: SerieMinima[]): T | undefined {
  const ordem = ordemDeEscuta(episodios, series);
  if (ordem.length < 2) return undefined;
  const i = ordem.findIndex((e) => e.id === atual.id);
  return ordem[(i + 1) % ordem.length];
}
