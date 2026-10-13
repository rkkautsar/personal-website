# Production deployment — October 14, 2026 (Asia/Singapore)

The user authorized deployment and deletion of the previously exposed credential.

- Worker: `personal-website-worker`, initially deployed version `471b55e2-e84a-4476-8e4a-cbf74fa7bb08`. Deleting the secret may create a subsequent Worker version.
- Route: `rakha.dev/api/admin/*`.
- Pages production deployment: `da49d152-a54c-4d9d-8a4b-ad460ca456b1` on production branch `master`.
- Deployment URL: https://da49d152.personal-website-7dt.pages.dev
- Canonical website: https://rakha.dev
- Access team: https://rkkautsar.cloudflareaccess.com
- Access audience: `d4651dd180626c2294a8d2b6765eca49bb13e0a69a084298b291f0483a322641`.
- Authorized admin email: `rkkautsar@gmail.com`.

## Verification

Cloudflare API inspection confirmed the active Worker's bindings contain `LINKS` and the four Access settings, with **no `API_SECRET` binding**. The actual previously exposed bearer value was sent in negative live tests (never logged); POST and DELETE both returned 401 on legacy `/api/links` and `/api/admin/links` routes. DELETE probes used a uniquely named nonexistent path.

The public homepage returned 200. Unauthenticated `/dashboard` and `/api/admin/links` requests redirected to the configured Access team login. Public GET `/api/links` returned 200, and a public shortlink returned 301. The canonical homepage loaded `/assets/index-DItTjy8j.js`, containing same-origin admin callers and no exposed credential.

Prior local validation passed eight authentication tests, frontend and Worker type checks, production bundling, and Worker dry-run bundling. The production frontend was rebuilt from the checked-in profile data, without a live GitHub profile refresh.

An interactive login and authorized create/delete smoke test remain for the user at https://rakha.dev/dashboard. No live user session was available to this agent; no successful live admin mutation is claimed.

## Remaining source and historical deployment considerations

Git-driven Pages builds must include the source changes in this commit. This repository includes a cron Worker that requests deployments from `master`; keep the authentication fix on that production branch to prevent restoration of the old frontend. The new production Worker rejects the old credential even if an old frontend is served.

The secret deletion and negative requests verify the active production Worker. The credential remains in Git history and may exist in old bundles or historical Worker versions. Do not roll back to the vulnerable Worker; review historical/staging deployments and revoke any reuse of the value in other services separately.
