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
- The build fetches recent Hashnode posts from its public RSS feed (`blog.rakha.dev/rss.xml` by default; override with `HASHNODE_RSS_URL`) for the Writing section. Each entry links directly to its Hashnode post.
- GitHub profile, the current pinned repositories, and their README content are fetched by `scripts/fetch-github.ts` at dev-server start and build time. The site does not use a checked-in GitHub snapshot.

## Weekly refresh

The Cloudflare cron Worker compares the current GitHub profile and all pinned repositories with the most recently deployed GraphQL snapshot. It requests a Pages deployment only when those pinned items or profile fields change. Set `CF_API_TOKEN` and `GITHUB_ACCESS_TOKEN` as Worker secrets; see [DEPLOYMENT.md](DEPLOYMENT.md).
