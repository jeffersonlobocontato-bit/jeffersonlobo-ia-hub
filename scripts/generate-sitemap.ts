// Runs before `vite dev` and `vite build` (predev/prebuild hooks); writes public/sitemap.xml.
// Pulls blog posts from Supabase to include /blog/:slug URLs.
import { writeFileSync } from "fs";
import { resolve } from "path";

const BASE_URL = "https://jeffersonlobo.tech";
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

const today = new Date().toISOString().slice(0, 10);

async function fetchBlogPosts(): Promise<SitemapEntry[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,updated_at,date&active=eq.true&order=date.desc`,
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
    const rows = (await res.json()) as Array<{ slug: string; updated_at: string; date: string }>;
    return rows
      .filter((r) => r.slug)
      .map((r) => ({
        path: `/blog/${r.slug}`,
        lastmod: (r.updated_at || r.date || today).slice(0, 10),
        changefreq: "monthly" as const,
        priority: "0.7",
      }));
  } catch (e) {
    console.warn("sitemap: blog fetch error", e);
    return [];
  }
}

async function main() {
  const blogPosts = await fetchBlogPosts();

  const entries: SitemapEntry[] = [
    { path: "/", lastmod: today, changefreq: "weekly", priority: "1.0" },
    { path: "/blog", lastmod: today, changefreq: "weekly", priority: "0.9" },
    { path: "/teste-ia", lastmod: today, changefreq: "monthly", priority: "0.8" },
    { path: "/politica-privacidade", lastmod: today, changefreq: "yearly", priority: "0.3" },
    ...blogPosts,
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
  console.log(`sitemap.xml written (${entries.length} entries, ${blogPosts.length} blog posts)`);
}

main();
