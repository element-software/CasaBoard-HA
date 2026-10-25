# CasaBoard Roadmap

Status snapshot as of 2026-07-24. Not scheduled — picked up after the dashboard
builder and theming are done.

## 1. Standalone / Docker cleanup

Mostly in place already:
- `Dockerfile` + `docker-compose.yml` build and run `apps/app` standalone, data bind-mounted to `./data`.
- README already states no-account/no-cloud/no-login.

Done (2026-07-24):
- Flattened `(authenticated)` route group → `(header)`, `(immersive)`, `dashboard` live directly under `apps/app/app/`.
- Removed dead SaaS-era `Profile` type (`packages/types/user.ts`), Login/billing breadcrumb leftovers, Stripe env in `apps/public`, and stale Supabase/auth docs.
- Confirmed `apps/public` has no package or import dependency on `apps/app` (shared `@repo/*` only; Docker builds only `apps/app`).

## 2. HACS install

Done (2026-07-24), evolved from a JS-only plugin to a full HA **integration**:
- `custom_components/casaboard` — config flow, online/pages/HA-connection sensors, `casaboard.refresh` service.
- CasaBoard app exposes `/api/health` for the coordinator to poll.
- Root `hacs.json` + `.github/workflows/validate-hacs.yml` (layout check, `hacs/action` category `integration`, hassfest).

Remaining for end-user install: repo must be **public**; merge so GitHub detects `LICENSE` on default branch; then drop `hacsjson` / `license` from the workflow ignore list. Brands assets needed only if submitting to the HACS default store.

## 3. Static publish (removed)

Removed (2026-07-26):
- Dropped static export to HA `/local/`, `apps/viewer`, publish settings, and draft/publish UI.
- Pages are served only from the CasaBoard app at `/dashboard/[slug]`.

## 4. First-run onboarding

Done (2026-07-24):
- First-run detection via `hasValidHAConnection()` (requires `hass_url` + access token in `ha-connection.json`).
- Guided wizard at `/onboarding` (immersive) — URL + long-lived token (primary) or OAuth (“Sign in with HA”).
- Typed connection failures in `@casaboard/ha` (`invalid_url`, `unreachable`, `invalid_auth`, `ssl`, `https_to_http`, …) with clear per-type copy; retry without reload.
- Setup shell, dashboard preview, and immersive editors redirect to `/onboarding` until configured; disconnect returns there.
- Settings remain at `/setup/ha-config` after first run (same connection helpers).

## 5. Publish `@casaboard/ha` as a standalone npm package

Done (2026-07-24):
- Package renamed `@repo/ha` → `@casaboard/ha` (no longer `private`).
- Inlined `HAConnection` (dropped `@repo/types` runtime/type dependency).
- `tsup` build emits ESM + CJS + `.d.ts` into `dist/` (workspace still resolves source `.ts` for monorepo DX; `publishConfig` swaps consumers to `dist/`).
- `packages/ha/README.md` + MIT `LICENSE` copy for the tarball.
- Publish workflow: `.github/workflows/publish-ha.yml` on `ha-v*` tags (or workflow_dispatch). Needs repo secret `NPM_TOKEN` for the `@casaboard` npm scope.

## 6. Strip repo history

Done (2026-07-25):
- Squashed to a single fresh initial commit (orphan branch) and force-pushed
  rewritten `main` on `element-software/CasaBoard` (later republished as
  `element-software/CasaBoard-HA` with a single clean commit).
- Deleted stale remote branches that still pointed at pre-rewrite history.
- Local runtime data (`apps/app/data/**`, `data/`) kept untracked; rotate any
  credentials that ever appeared in the old history (they are not revoked by a
  rewrite alone).

## 7. Marketing site (`apps/public`) refresh

Done (2026-07-24):
- Messaging aligned to local-only / privacy-first / no tracking / no account.
- Open source on public GitHub (`element-software/CasaBoard-HA`), MIT licensed, free to use.
- Install paths called out: Docker Compose for the app, HACS for the HA integration/sidebar panel.
- Tracking decision: **ripped out entirely** — no `AnalyticsWrapper`, no cookie consent, no GA/Vercel Analytics. Docs and legal pages match that stance.
- Nav/footer/hero/CTA/docs/contact/terms point at the real GitHub repo; footer no longer claims “All rights reserved.”

---

**Sequencing note:** items 1–7 are complete as of 2026-07-25. Further work is
outside this snapshot (dashboard builder / theming polish, HACS default-store
submission, npm publish of `@casaboard/ha` once `NPM_TOKEN` is set).
