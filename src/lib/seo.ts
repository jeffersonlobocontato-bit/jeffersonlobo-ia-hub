import { CURSO_ILHA, loteAtual } from "@/content/cursos/ilha";

export const SITE_URL = "https://jeffersonlobo.tech";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

export const PERSON_LD = {
  "@type": "Person",
  "@id": `${SITE_URL}/#person`,
  name: "Jefferson Lobo",
  url: SITE_URL,
};

/** Canonical absoluto: sem query/hash e sem barra final (exceto a home). */
export function canonicalUrl(path: string): string {
  let p = (path || "/").split(/[?#]/)[0].trim();
  if (/^https?:\/\//.test(p)) p = new URL(p).pathname;
  if (!p.startsWith("/")) p = `/${p}`;
  p = p.replace(/\/{2,}/g, "/");
  if (p.length > 1) p = p.replace(/\/+$/, "");
  return p === "/" ? `${SITE_URL}/` : `${SITE_URL}${p}`;
}

/** Corta no limite sem quebrar palavra. */
export function clip(text: string, max: number): string {
  const t = (text || "").replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const i = cut.lastIndexOf(" ");
  return `${(i > max * 0.6 ? cut.slice(0, i) : cut).replace(/[\s,.;:—–-]+$/, "")}…`;
}

/** Remove recursivamente undefined, null, strings vazias, arrays/objetos vazios. */
export function cleanLd<T>(value: T): T {
  const walk = (v: any): any => {
    if (Array.isArray(v)) {
      const arr = v.map(walk).filter((x) => x !== undefined);
      return arr.length ? arr : undefined;
    }
    if (v && typeof v === "object") {
      const out: Record<string, any> = {};
      for (const [k, val] of Object.entries(v)) {
        const w = walk(val);
        if (w !== undefined) out[k] = w;
      }
      return Object.keys(out).length ? out : undefined;
    }
    if (v === null || v === undefined) return undefined;
    if (typeof v === "string" && !v.trim()) return undefined;
    return v;
  };
  return walk(value);
}

/**
 * Course da Ilha. Preço e validade vêm de CURSO_ILHA/loteAtual: no Lote 1 o
 * priceValidUntil é o fim do lote; depois dele o preço vira o do Lote 2, que
 * não tem data de fim, então o campo sai (nunca fica uma data vencida).
 */
export function ilhaCourseLd(agora = Date.now()) {
  const lote = loteAtual(CURSO_ILHA, agora);
  const url = canonicalUrl(CURSO_ILHA.vitrine.pagina);
  return cleanLd({
    "@context": "https://schema.org",
    "@type": "Course",
    name: CURSO_ILHA.nome,
    description: CURSO_ILHA.descricao,
    url,
    image: `${SITE_URL}/cursos-ilha/og.jpg`,
    inLanguage: "pt-BR",
    provider: {
      "@type": "Organization",
      name: "Academia jeffersonlobo.tech",
      url: `${SITE_URL}/cursos`,
    },
    offers: {
      "@type": "Offer",
      price: lote.preco.toFixed(2),
      priceCurrency: "BRL",
      priceValidUntil: lote.lote === 1 ? CURSO_ILHA.precos.fimLote1 : undefined,
      availability: "https://schema.org/InStock",
      category: "Paid",
      url,
    },
  });
}
