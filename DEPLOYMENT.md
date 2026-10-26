# Deployment

The website is a static Vite build published to Cloudflare Pages. GitHub profile and pinned repository metadata are fetched from GitHub GraphQL during each build and bundled with the site. A repository README is fetched from GitHub's public REST API only when its project dialog opens; the browser keeps it for a week and revalidates expired content in the background. Recent Hashnode posts are fetched from the public RSS feed at `blog.rakha.dev/rss.xml` for the Writing section. Shortlinks are repository content.

## Pages

Set `GITHUB_ACCESS_TOKEN` in the Pages build environment with public repository read access. `npm run build` runs `scripts/fetch-github.ts` first, then generates static redirects and the Hashnode writing index. A failed or missing GitHub token stops the build instead of shipping old pinned data. Deploy `dist` with `npm run deploy:pages`.

## Weekly content refresh

`worker/cron` runs weekly. Configure the secrets in the `personal-website-cron` Worker:

```sh
npx wrangler secret put CF_API_TOKEN --config worker/cron/wrangler.toml
npx wrangler secret put GITHUB_ACCESS_TOKEN --config worker/cron/wrangler.toml
```

The Cloudflare API token needs permission to create a Pages deployment for the `personal-website` project. The GitHub token needs public profile and repository read access. Deploy the cron Worker with `npm run deploy:cron`.

The Worker queries up to six current pinned repositories and compares their identity, descriptions, links, homepage URLs, and last-updated timestamps with `/data/github.json`. It also compares the current Hashnode RSS entries with `/data/hashnode.json`. It skips the Pages deployment only when both snapshots are unchanged; otherwise, it requests a production deployment that fetches fresh GitHub metadata and Hashnode posts.
