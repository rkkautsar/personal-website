# Rakha Kanz Kautsar — personal website

A mobile-first, dark-only portfolio built with React, Vite, Tailwind CSS, and Radix UI. The site is mostly static and deployed on Cloudflare Pages.

## Local development

```sh
npm ci
npm run dev
```

`npm run dev` and `npm run build` fetch the current profile, pinned repositories, and each README from GitHub GraphQL. Both require a public-read GitHub token in `GITHUB_ACCESS_TOKEN` (put it in `.env` locally). The generated GitHub data files are build outputs and are not checked in; the build fails if the live GraphQL refresh fails.

## Content

- `shortlinks.json` is the source of truth for `/l/:slug` links. The build generates Cloudflare Pages redirects from it.
- Posts live in `src/posts/*.mdx` with metadata in `src/blog/metadata.ts`. The build renders static HTML under `/blog/<slug>/`, including metadata, a sitemap, and build-time syntax highlighting. For the full blog preview, run `npm run build`, `npm run d1:local:migrate` once, and `npm run preview`. This uses a local D1 database; the Vite development server serves the portfolio only.
- Interactive demos are adapted from `public/demos/` into `src/blog/demos/` and loaded when they approach the viewport. Update both copies when changing a demo.
- GitHub profile, the current pinned repositories, and their README content are fetched by `scripts/fetch-github.ts` at dev-server start and build time. The site does not use a checked-in GitHub snapshot.

## Weekly refresh

The Cloudflare cron Worker compares the current GitHub profile and all pinned repositories with the most recently deployed GraphQL snapshot. It requests a Pages deployment only when those pinned items or profile fields change. Set `CF_API_TOKEN` and `GITHUB_ACCESS_TOKEN` as Worker secrets; see [DEPLOYMENT.md](DEPLOYMENT.md).

## Cart performance demo

Standalone static demos and the prefetch timeline are published from `public/demos/cart-performance/`. For Hashnode Widgets, embed the standalone `rendering-demo.html` or `cache-demo.html` directly. Each file contains the demo and does not load another iframe. Set the widget iframe height explicitly; `100%` does not auto-size to the framed content. The two HTML files are the public embed entry points; `index.html` is only a combined local preview. These assets do not use Pages Functions.

## Discussion

Discussion uses a Pages Function and D1; browser-local delete tokens protect guest comments, and Turnstile verifies comment submissions. The local preview uses its own database and Cloudflare test keys; it never accesses production data. Likes are debounced and limited to 10 per browser and article, and comment submissions are limited to two per minute in the browser. Clearing browser storage resets these limits and loses access to guest delete tokens.
