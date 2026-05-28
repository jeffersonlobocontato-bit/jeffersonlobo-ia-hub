// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pulls blog posts from Supabase to include /blog/:slug URLs.
import { mkdirSync, rmSync, writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://jeffersonlobo.tech";
const FALLBACK_IMAGE = "https://storage.googleapis.com/gpt-engineer-file-uploads/DHKdvSKyvqV4o5xAVHB85Nkclo92/social-images/social-1762353011645-aprenda-inteligencia-artificial-na-pratica.webp";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || "https://cgydeldzhnfyexphaheq.supabase.co";
const SUPABASE_KEY =
  process.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNneWRlbGR6aG5meWV4cGhhaGVxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzMzk1MzAsImV4cCI6MjA3NzkxNTUzMH0.l7Y3qaKUtqbrGVsUkvuQZnKzlKNjPWEiHFcJmt7CxNA";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

interface BlogPostRow {
  slug: string;
  title: string;
  subtitle?: string | null;
  excerpt?: string | null;
  cover_image?: string | null;
  cover_alt?: string | null;
  seo_description?: string | null;
  updated_at: string;
  date: string;
}

const today = new Date().toISOString().slice(0, 10);

function escapeHtml(value: string): string {
  return (value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function truncateText(value: string, max = 180): string {
  const text = (value || "").replace(/\s+/g, " ").trim();
  if (text.length <= max) return text;
  const cut = text.slice(0, max - 1);
  return `${cut.slice(0, cut.lastIndexOf(" ") || cut.length).trim()}…`;
}

function socialImageUrl(image?: string | null): string {
  if (!image) return FALLBACK_IMAGE;
  try {
    const url = new URL(image);
    if (url.pathname.includes("/storage/v1/object/public/")) {
      url.pathname = url.pathname.replace("/storage/v1/object/public/", "/storage/v1/render/image/public/");
      url.searchParams.set("width", "1200");
      url.searchParams.set("height", "630");
      url.searchParams.set("resize", "contain");
      url.searchParams.set("quality", "80");
      return url.toString();
    }
  } catch {
    return image;
  }
  return image;
}

function writeSharePages(posts: BlogPostRow[]) {
  const baseDir = resolve("public/share/blog");
  rmSync(baseDir, { recursive: true, force: true });
  mkdirSync(baseDir, { recursive: true });

  for (const post of posts.filter((p) => p.slug)) {
    const postUrl = `${BASE_URL}/blog/${post.slug}`;
    const shareUrl = `${BASE_URL}/share/blog/${post.slug}/index.html`;
    const title = escapeHtml(post.title);
    const description = escapeHtml(truncateText(post.seo_description || post.subtitle || post.excerpt || ""));
    const image = escapeHtml(socialImageUrl(post.cover_image));
    const imageAlt = escapeHtml(post.cover_alt || post.title);
    const dir = resolve(baseDir, post.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(resolve(dir, "index.html"), `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${title}</title>
<meta name="description" content="${description}" />
<link rel="canonical" href="${postUrl}" />
<meta property="og:type" content="article" />
<meta property="og:site_name" content="Jefferson Lobo" />
<meta property="og:url" content="${shareUrl}" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${description}" />
<meta property="og:image" content="${image}" />
<meta property="og:image:secure_url" content="${image}" />
<meta property="og:image:alt" content="${imageAlt}" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${description}" />
<meta name="twitter:image" content="${image}" />
<script>window.location.replace(${JSON.stringify(postUrl)});</script>
</head>
<body><a href="${postUrl}">${title}</a></body>
</html>`);
  }
}

async function fetchBlogPosts(): Promise<BlogPostRow[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,subtitle,excerpt,cover_image,cover_alt,seo_description,updated_at,date&active=eq.true&order=date.desc`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      },
    );
    if (!res.ok) {
      console.warn(`sitemap: blog fetch failed (${res.status})`);
      return [];
    }
    return (await res.json()) as BlogPostRow[];
  } catch (e) {
    console.warn("sitemap: blog fetch error", e);
    return [];
  }
}

async function main() {
  const blogPosts = await fetchBlogPosts();
  writeSharePages(blogPosts);

  const entries: SitemapEntry[] = [
    { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0" },
    { path: "/blog", lastmod: today, changefreq: "weekly", priority: "0.9" },
    { path: "/teste-ia", lastmod: today, changefreq: "monthly", priority: "0.8" },
    { path: "/politica-privacidade", lastmod: today, changefreq: "yearly", priority: "0.3" },
    ...blogPosts.filter((r) => r.slug).map((r) => ({
      path: `/blog/${r.slug}`,
      lastmod: (r.updated_at || r.date || today).slice(0, 10),
      changefreq: "monthly" as const,
      priority: "0.7",
    })),
  ];

  const urls = entries.map((e) =>
    [
      `  <url>`,
      `    <loc>${BASE_URL}${e.path}</loc>`,
      e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
      e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
      e.priority ? `    <priority>${e.priority}</priority>` : null,
      `  </url>`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  const xml = [
    `<?xml version="1.0" encoding="UTF-8"?>`,
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
    ...urls,
    `</urlset>`,
  ].join("\n");

  writeFileSync(resolve("public/sitemap.xml"), xml);
  console.log(`sitemap.xml and share pages written (${entries.length} entries, ${blogPosts.length} blog posts)`);
}

main();
