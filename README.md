# CasaBoard

[![HACS](https://img.shields.io/badge/HACS-Custom-41BDF5.svg?style=for-the-badge)](https://github.com/hacs/integration)
[![GitHub release](https://img.shields.io/github/v/release/element-software/CasaBoard-HA?style=for-the-badge&include_prereleases)](https://github.com/element-software/CasaBoard-HA/releases)
[![HA](https://img.shields.io/badge/Home%20Assistant-%3E%3D%202024.6-41BDF5.svg?style=for-the-badge&logo=home-assistant&logoColor=white)](https://www.home-assistant.io/)
[![License](https://img.shields.io/github/license/element-software/CasaBoard-HA?style=for-the-badge)](https://github.com/element-software/CasaBoard-HA/blob/main/LICENSE)
[![Website](https://img.shields.io/badge/Website-casaboard.dev-8B5CF6.svg?style=for-the-badge)](https://casaboard.dev)

![CasaBoard icon](https://casaboard.dev/brand/icon.png)

**Open-source, self-hosted dashboard builder for Home Assistant.**

Drag-and-drop editing. On **Home Assistant OS**, install CasaBoard as an App with Ingress and Updates. **Docker Compose** remains a fallback. Optional HACS integration for health sensors — **no account, no cloud, no login**.

![CasaBoard — local-only Home Assistant dashboards](https://casaboard.dev/brand/hero.png)

## What you get

| Piece | What it does |
| --- | --- |
| **CasaBoard App (HAOS)** | Install from a custom Supervisor repo; open via **Ingress**; update from HA **Updates**; optional **kiosk port** for wall tablets |
| **CasaBoard app (Compose)** | Self-hosted editor + live dashboards (Docker fallback) |
| **HACS integration** | Health sensors + `casaboard.refresh` (optional; no sidebar panel) |

Your layouts and Home Assistant credentials stay on **your** machine. Nothing phones home.

## Requirements

- Home Assistant OS or Supervised (recommended) **or** Docker Compose on any host
- A running [Home Assistant](https://www.home-assistant.io/) instance (**2024.6+** for the optional HACS integration)
- [Docker](https://docs.docker.com/get-docker/) + Docker Compose (fallback install)
- Optional: [HACS](https://hacs.xyz/) for health sensors

## Install on Home Assistant OS (recommended)

1. **Settings → Apps** (called **Add-ons** on older HA) → store → ⋮ → **Repositories**
2. Add: `https://github.com/element-software/CasaBoard-HA`
3. Install **CasaBoard**, start it, then **Open Web UI** (Ingress)
4. Connect to Home Assistant inside CasaBoard on first launch

Updates appear under **Settings → System → Updates**. No official store submission is required — this uses Supervisor’s custom repository flow.

See [`casaboard/DOCS.md`](casaboard/DOCS.md) for App-specific notes.

**Wall tablets / kiosk:** set an optional direct port under **Settings → Apps → CasaBoard → Configuration → Network**, restart, then open `http://<ha-ip>:<port>/dashboard/<page-slug>`. Compose: `http://<host-ip>:3000/dashboard/<page-slug>`. Full-screen, no HA sidebar. See [Kiosk / wall tablets](casaboard/DOCS.md#kiosk--wall-tablets).

## Quick start (Docker Compose fallback)

```bash
git clone https://github.com/element-software/CasaBoard-HA.git
cd CasaBoard-HA
docker compose pull
docker compose up -d
```

Open [http://localhost:3000](http://localhost:3000) (or `http://<host-ip>:3000`).

On first launch you connect to Home Assistant (URL + long-lived access token, or HA sign-in). After that, create a page and build in the drag-and-drop editor.

Dashboard data lives in `./data` (bind-mounted into the container) — back that directory up.

Check for newer releases under **Setup → Import / Export → Updates** in the app.

> Full walkthrough: [casaboard.dev/docs](https://casaboard.dev/docs)

## Releasing

Every push to `main` triggers a release. The bump is inferred from conventional commits since the last tag (`feat` → minor, `BREAKING CHANGE` / `type!:` → major, otherwise patch). The workflow builds and pushes the multi-arch image to GHCR, bumps `casaboard/config.yaml`, prepends `casaboard/CHANGELOG.md` (shown on the HA Apps changelog tab), tags `vX.Y.Z`, and creates the GitHub Release.

For a forced bump, use Actions → **Release** → **Run workflow** and pick patch/minor/major (or leave **auto**). Home Assistant installs see the update within a few hours (or immediately via **Check for updates**); Compose installs pick it up on `docker compose pull`.

## Install the HACS integration (optional sensors)

The integration does **not** replace the CasaBoard app. On HAOS, use the App **Ingress** UI; use HACS when you want health sensors against a direct HTTP URL (typical for Compose).

### 1. Add the repository in HACS

1. HACS → **Integrations** → ⋮ → **Custom repositories**
2. Repository: `https://github.com/element-software/CasaBoard-HA`
3. Category: **Integration**
4. Download **CasaBoard**, then **restart Home Assistant**

### 2. Add the integration

[![Open your Home Assistant instance and start setting up CasaBoard.](https://my.home-assistant.io/badges/config_flow_start.svg)](https://my.home-assistant.io/redirect/config_flow_start/?domain=casaboard)

Or: **Settings → Devices & services → Add integration → CasaBoard**

Enter the base URL of your CasaBoard app, for example:

- `http://homeassistant.local:3000`
- `http://casaboard:3000` (same Docker network as HA)
- `http://192.168.x.x:3000`

### What the integration provides

| Entity / feature | Meaning |
| --- | --- |
| `binary_sensor.casaboard_online` | CasaBoard `/api/health` is reachable |
| `sensor.casaboard_pages` | Total pages |
| `sensor.casaboard_ha_connection` | `connected` / `disconnected` (stored HA credentials in the app) |
| `casaboard.refresh` | Service to re-poll health (optional `entry_id`) |

On HAOS, open CasaBoard from the **App → Open Web UI** (Ingress), not a HACS sidebar panel.

### Manual install (without HACS)

Copy `custom_components/casaboard` into `<config>/custom_components/casaboard`, restart Home Assistant, then add the integration from the UI.

## Viewing dashboards

Open any page in the CasaBoard app at `/dashboard/<slug>` (for example `http://<host>:3000/dashboard/upstairs`). Wall tablets and bookmarks should point at that URL.

## Environment variables

| Variable | Default (Docker) | Purpose |
| --- | --- | --- |
| `DATA_DIR` | `/data` | JSON store (`pages`, sidebars, themes, HA connection) |
| `PORT` | `3000` | HTTP port |
| `CASABOARD_VERSION` | `dev` (image tag at build) | Reported in `/api/health` and update checks |

## Privacy

No analytics or tracking in the app or the marketing site. No cookie consent banner — there is nothing to consent to. Your Home Assistant credentials and dashboard JSON never leave the server you run.

## Support

- Docs: [casaboard.dev/docs](https://casaboard.dev/docs)
- Issues: [GitHub Issues](https://github.com/element-software/CasaBoard-HA/issues)
- Email: [support@casaboard.dev](mailto:support@casaboard.dev)

---

## Development

Requirements: Node 18+, npm 10+. From the repo root:

```bash
npm install
npm run dev
```

- App: [http://localhost:3000](http://localhost:3000)
- Public site: [http://localhost:3001](http://localhost:3001)

```bash
npm run build        # all apps/packages
npm run lint
npm run check-types
```

### Repository layout

| Path | Role |
| --- | --- |
| `apps/app` | Dashboard builder (Next.js) — what the Docker image runs |
| `apps/public` | Documentation / marketing site ([casaboard.dev](https://casaboard.dev)) |
| `packages/ui` | Shared UI (HeroUI, icons, Puck editor) |
| `packages/lib` | Actions, services, flat-JSON persistence |
| `packages/ha` | Home Assistant websocket helpers (`@casaboard/ha`) |
| `custom_components/casaboard` | HACS integration (health sensors); brand assets in `brand/` |

## License

MIT © CasaBoard
