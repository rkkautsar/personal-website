# Personal website

React/Vite frontend on Cloudflare Pages, with a Cloudflare Worker and KV for shortlinks.

```sh
npm ci
npm run dev
npm run lint
npm run check:worker
npm run test:auth
npm run build
```

`npm run build` runs a GitHub data fetch first and needs `GITHUB_ACCESS_TOKEN` (see `.env.example`). To build using the checked-in profile data without fetching: `npx tsc -b && npx vite build`.

## Admin authentication

Dashboard calls use same-origin `/api/admin/links` with the Cloudflare Access browser session. No credential belongs in frontend source, Vite variables, or local storage. The Worker verifies Access JWT signatures against the configured team's JWKS, issuer, audience, expiry and required identity claims. Only emails in `ADMIN_EMAILS` may administer links. Writes also require `Origin` to equal `ADMIN_ORIGIN`. Legacy POST `/api/links` and DELETE `/api/links/:path` are covered by the same check; the old bearer scheme is removed. OPTIONS cannot mutate data. Non-GET shortlink requests cannot increment counters.

Public GET `/api/links` and GET `/l/:path` retain their existing behavior. The public list includes destinations and hit counts by design; the admin alias requires authentication. Public frontend pages remain public. Dashboard UI is not the security boundary: every admin operation is enforced by the Worker, including requests to its direct workers.dev hostname.

See [Cloudflare's JWT validation guidance](https://developers.cloudflare.com/cloudflare-one/access-controls/applications/http-apps/authorization-cookie/validating-json/).

## Deployment setup

Use `https://rakha.dev` as the canonical dashboard host unless you intentionally choose another host. Required inputs: your Cloudflare Zero Trust team domain, Access application audience, authorized admin email address(es), and confirmation of the canonical host/zone.

1. In Zero Trust, create a self-hosted Access application with both `rakha.dev/dashboard` (and its descendants) and `rakha.dev/api/admin` (and its descendants) in the **same application**, so they share an audience and browser session. Use a narrow Allow policy for the intended admin emails. Enable an identity provider or email one-time PIN. Do not use Bypass, Everyone, or a service-token-only policy. Verify path coverage in the Access UI.
2. Configure the Worker's `ACCESS_TEAM_DOMAIN` as `https://YOUR-TEAM.cloudflareaccess.com` without a trailing slash; `ACCESS_AUD` from that Access application; `ADMIN_EMAILS` as comma-separated emails; and `ADMIN_ORIGIN` as exactly `https://rakha.dev`. These are configuration, not shared secrets. Missing values intentionally disable admin access (503). Configure them in `worker/wrangler.toml` `[vars]` or the deployment environment, and preserve them during future deploys.
3. Add a **top-level** Worker route for `rakha.dev/api/admin/*` in `worker/wrangler.toml` (above tables): `routes = [{ pattern = "rakha.dev/api/admin/*", zone_name = "rakha.dev" }]`. This routes dashboard API requests to this Worker while Pages serves the frontend. The host must be proxied through the Cloudflare zone. Keep existing public shortlink routes/bindings. Dashboard requests intentionally ignore `VITE_WORKER_URL`; that variable remains available for other public use.
4. Deploy the Worker with `npm run deploy:worker`, then build and deploy Pages with the existing commands. The deployment recorded in `DEPLOYMENT.md` used these commands. Visiting `/dashboard` starts the Access login flow; requests then carry `Cf-Access-Jwt-Assertion` inserted by Access. Reload `/dashboard` after session expiry. Authentication/network failures leave form data and the visible link list intact and show an error.
5. Verify an authorized account can add/delete and a non-admin account cannot; unauthenticated direct requests to both new and legacy mutation URLs must fail without changing KV. Confirm the public homepage, link list, and shortlink redirects still work. Check a forged assertion and the old bearer credential fail against the deployed Worker.

The pages.dev and preview hosts are not configured as alternate admin hosts. Public pages can remain accessible there; their same-origin admin requests have no Worker route and cannot mutate KV. Do not point admin fetches at a cross-origin Worker or ship a token to compensate. If another host needs admin access, configure Access and a same-origin route there deliberately and update origin authorization.

Local Vite alone cannot authenticate admin writes. Use an Access-protected staging host and isolated KV for an end-to-end admin session; unit tests use freshly generated signing keys with no live identity provider and no authentication bypass.

## Revoke the exposed credential and existing sessions

The previous `API_SECRET` was committed publicly and included in browser bundles. Treat it as compromised. Removing its code does **not** revoke the secret on already-deployed Workers, cached deployments, or any other service where it was reused.

After deploying and verifying JWT enforcement on every active Worker deployment, remove the obsolete Worker secret with `npx wrangler secret delete API_SECRET --config worker/wrangler.toml`. Review preview/staging deployments and rollbacks: remove or replace any deployment still accepting that secret. Rotate it wherever it was reused, review KV/link changes and available logs for unauthorized writes, and restore known-good data as needed. Replace old Pages bundles and prevent rollback to the vulnerable Worker. Git history still contains the leaked value; rewriting history alone cannot revoke it.

On October 14, 2026 (Asia/Singapore), the updated Worker and Pages frontend were deployed with user authorization. The obsolete `API_SECRET` binding was deleted and its absence was verified through the Cloudflare API. Live tests confirmed the exposed bearer credential receives 401 for POST and DELETE on both legacy and admin endpoints. This verifies revocation for the active production Worker; it does not establish revocation wherever the value was reused or in historical deployments. See `DEPLOYMENT.md`.

To revoke an admin, remove the email from `ADMIN_EMAILS` and redeploy (this rejects even still-valid tokens), remove it from the Access Allow policy, and revoke its Access sessions. For broader session revocation, use Access session controls; recreating an Access application changes its audience and requires updating `ACCESS_AUD`. Keep session duration appropriate for an admin tool.
