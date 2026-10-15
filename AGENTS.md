# Project architecture
- Define the site's single theme through semantic global CSS tokens and shared UI components so presentation changes do not alter business logic.
- Keep the Academy's scoped stylesheet and components independent of global presentation changes so its reference pages remain visually stable.
- Keep generated sitemap/share files, tracking, SEO and backend logic outside presentation refactors so integrations remain unchanged.