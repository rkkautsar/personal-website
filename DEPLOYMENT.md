# Deployment

The website is a static Vite build published to Cloudflare Pages. GitHub profile and pinned repository metadata are fetched from GitHub GraphQL during each build and bundled with the site. A repository README is fetched from GitHub's public REST API only when its project dialog opens; the browser keeps it for a week and revalidates expired content in the background. Blog posts are authored as local MDX and rendered into static HTML during the build. Shortlinks are repository content.

## Pages

Set `GITHUB_ACCESS_TOKEN` in the Pages build environment with public repository read access. `npm run build` runs `scripts/fetch-github.ts` first, then generates static article pages, a sitemap, and redirects. A failed or missing GitHub token stops the build instead of shipping old pinned data. Deploy `dist` with `npm run deploy:pages`.

## Weekly content refresh

`worker/cron` runs weekly. Configure the secrets in the `personal-website-cron` Worker:

```sh
npx wrangler secret put CF_API_TOKEN --config worker/cron/wrangler.toml
npx wrangler secret put GITHUB_ACCESS_TOKEN --config worker/cron/wrangler.toml
```

The Cloudflare API token needs permission to create a Pages deployment for the `personal-website` project. The GitHub token needs public profile and repository read access. Deploy the cron Worker with `npm run deploy:cron`.

The Worker queries up to six current pinned repositories and compares their identity, descriptions, links, homepage URLs, and last-updated timestamps with `/data/github.json`. It skips deployment when the GitHub snapshot is unchanged; otherwise, it requests a production deployment that fetches fresh GitHub metadata.

## Blog discussion

The production Pages binding `DB` points to the `personal-website-discussion` D1 database. The schema is in `migrations/`; apply future migrations with `npx wrangler d1 migrations apply personal-website-discussion --remote --config wrangler.d1.toml`. Pages must be redeployed after binding changes. The preview environment has no D1 binding; configure a separate database before using a deployed preview so it cannot write production data.

For local development, use `npm run d1:local:migrate` once and `npm run preview` after building. The local D1 configuration and Pages preview use the same local-only database ID. Guest deletion relies on a secret stored in the visitor’s browser, so clearing browser storage loses deletion access. The two-comment-per-minute limit and 10-like limit are browser-side and can be bypassed by clearing storage or using another browser. Comment submission requires Turnstile verification, with a managed widget and a secret configured in production; the local preview uses Cloudflare test keys and must never be bound to production.

The dashboard is at `/dashboard/`, with comment moderation at `/dashboard/comments`. It reuses the existing `/dashboard/*` Cloudflare Access application and fails closed unless that path remains protected and the production Pages environment has `ACCESS_TEAM_DOMAIN`, `ACCESS_AUD`, and `ACCESS_ADMIN_EMAIL` set. It verifies the Access JWT on every request, including alternate Pages URLs, and uses same-origin checks for deletion. Restrict the Access policy to the intended administrator. Do not deploy the moderation feature until the Access application, environment values, and authorized and unauthorized flows have been verified.
