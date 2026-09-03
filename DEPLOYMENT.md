# Deployment

Each "ask" lives at `askout.elijahkott.com/<the-date>` (e.g. `/hoco`), all
served from this one repo on GitHub Pages.

**Live:** https://askout.elijahkott.com/hoco/

## Status

- **GitHub Pages** — on, source is GitHub Actions. `.github/workflows/deploy.yml`
  builds and deploys on every push to `main`.
- **Domain** — `askout.elijahkott.com` is already CNAMEd to `lijkott.github.io`
  in Cloudflare DNS, and GitHub has an approved HTTPS cert for it
  ("Enforce HTTPS" is on). Nothing left to configure here.

  (Note: the original draft of this doc assumed `askout.elijah.com`, per an
  early note in the repo's README — that domain isn't one this account
  controls. The DNS was actually already set up for `elijahkott.com`, which
  matches the GitHub account, so that's the real domain in use.)

## Adding another site later

1. `npm create vite@latest sites/<name> -- --template react`
2. In `sites/<name>/vite.config.js`, set `base: '/<name>/'` and
   `build.outDir: '../../dist/<name>'` (copy `sites/hoco/vite.config.js`).
3. Push to `main` — the workflow builds every workspace under `sites/*` and
   the root landing page (`dist/index.html`) picks up the new link
   automatically.
