# Project architecture
- Define the site's single theme through semantic global CSS tokens and shared UI components so presentation changes do not alter business logic.
- Keep the Academy's scoped stylesheet and components independent of global presentation changes so its reference pages remain visually stable.
- Keep generated sitemap/share files, tracking, SEO and backend logic outside presentation refactors so integrations remain unchanged.
- Static public routes listed in `ROTAS_PRERENDER` (src/App.tsx) are pre-rendered post-build by `scripts/prerender.mjs` (Vite SSR of `src/entry-server.tsx`, no headless browser) into `dist/<route>/index.html`; failures fall back to SPA without failing the build. The home and date/DB-driven routes (/cursos, /blog) stay out because `dist/index.html` doubles as the SPA fallback and their content changes at runtime. Client mounts with createRoot after preloading the page module (no hydration).
