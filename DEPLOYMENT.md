# Deployment

Each "ask" lives at `askout.elijah.com/<the-date>` (e.g. `/hoco`), all served
from this one repo on GitHub Pages. Two things need doing once, by hand,
since they require access to accounts this environment doesn't have.

## 1. Turn on GitHub Pages (GitHub Actions source)

In the repo on GitHub: **Settings → Pages → Build and deployment → Source**,
set it to **GitHub Actions**. That's it — `.github/workflows/deploy.yml`
handles the rest on every push to `main`.

## 2. Point the domain at GitHub Pages (Cloudflare)

In the Cloudflare dashboard, in the `elijah.com` zone's **DNS** tab, add:

| Type  | Name     | Content              | Proxy status |
| ----- | -------- | --------------------- | ------------ |
| CNAME | `askout` | `lijkott.github.io`   | DNS only (grey cloud) — see note below |

Leave it **DNS only** until GitHub finishes issuing the HTTPS certificate for
the domain (check **Settings → Pages** on the repo — it'll show a green
"Enforce HTTPS" checkbox once ready, usually within a few minutes to an
hour). Only switch the record to **Proxied** (orange cloud) after that; if
Cloudflare proxies it before GitHub has verified the domain, cert issuance
fails.

Once "Enforce HTTPS" is available, turn it on.

## Adding another site later

1. `npm create vite@latest sites/<name> -- --template react`
2. In `sites/<name>/vite.config.js`, set `base: '/<name>/'` and
   `build.outDir: '../../dist/<name>'` (copy `sites/hoco/vite.config.js`).
3. Push to `main` — the workflow builds every workspace under `sites/*` and
   the root landing page (`dist/index.html`) picks up the new link
   automatically.
