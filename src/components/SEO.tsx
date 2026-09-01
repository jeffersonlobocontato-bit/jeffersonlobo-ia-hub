import { Helmet } from "react-helmet-async";

export const SITE_URL = "https://jeffersonlobo.tech";
const SITE_NAME = "Jefferson Lobo";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-default.png`;

interface SEOProps {
  title: string;
  description: string;
  path: string;
  noindex?: boolean;
  ogImage?: string;
  ogType?: "website" | "article" | "profile";
}

export const SEO = ({
  title,
  description,
  path,
  noindex = false,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
}: SEOProps) => {
  const url = `${SITE_URL}${path}`;
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
      <meta property="og:image" content={ogImage} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:image" content={ogImage} />
    </Helmet>
  );
};
