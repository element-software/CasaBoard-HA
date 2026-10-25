# `apps/public` — CasaBoard marketing & docs site

Next.js App Router site for [casaboard.dev](https://casaboard.dev): product messaging, docs, privacy/security/terms, and contact.

Not part of the Docker image — `apps/app` is what you self-host.

## Positioning

- Local-only, privacy-first, no tracking, no account
- Free, open source, MIT licensed: [github.com/element-software/CasaBoard-HA](https://github.com/element-software/CasaBoard-HA)
- Install via Docker Compose (app) and optionally HACS (HA integration)

## Dev

From the monorepo root:

```bash
npm run dev --workspace=public
```

Open [http://localhost:3001](http://localhost:3001).
