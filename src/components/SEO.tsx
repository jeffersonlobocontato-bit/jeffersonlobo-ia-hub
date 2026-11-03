import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { SITE_URL, DEFAULT_OG_IMAGE, canonicalUrl, cleanLd } from "@/lib/seo";

export { SITE_URL };
const SITE_NAME = "Jefferson Lobo";

interface SEOProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string | null;
  ogType?: "website" | "article" | "profile";
  /** JSON-LD da página (soma ao global do index.html). */
  jsonLd?: object | object[] | null;
}

// Tags estáticas do index.html (fallback para robôs sem JS) que a página
// substitui. Sem remover, o navegador fica com duas og:image/og:url.
const STATIC_SELECTORS = [
  'meta[property="og:title"]',
  'meta[property="og:description"]',
  'meta[property="og:url"]',
  'meta[property="og:image"]',
  'meta[property="og:type"]',
  'meta[name="twitter:title"]',
  'meta[name="twitter:description"]',
  'meta[name="twitter:url"]',
  'meta[name="twitter:image"]',
  'link[rel="canonical"]',
];

export const SEO = ({
  title,
  description,
  path,
  noindex = false,
  ogImage,
  ogType = "website",
  jsonLd,
}: SEOProps) => {
  const url = canonicalUrl(path);
  const image = ogImage || DEFAULT_OG_IMAGE;
  const blocks = (Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [])
    .map((b) => cleanLd(b))
    .filter(Boolean);

  useEffect(() => {
    STATIC_SELECTORS.forEach((sel) =>
      document.head
        .querySelectorAll(`${sel}:not([data-rh])`)
        .forEach((el) => el.remove()),
    );
  }, []);

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {noindex && <meta name="robots" content="noindex,nofollow" />}

      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content={ogType} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:image" content={image} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:image" content={image} />
      {blocks.map((b, i) => (
        <script key={i} type="application/ld+json">{JSON.stringify(b)}</script>
      ))}
    </Helmet>
  );
};
