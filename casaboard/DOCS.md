# CasaBoard App

CasaBoard is a local-only dashboard builder for Home Assistant. This App runs the CasaBoard container under Supervisor with **Ingress** for the UI and **Updates** for new versions.

## Install

1. In Home Assistant go to **Settings → Add-ons → Add-on store** (Apps store).
2. Open the menu (⋮) → **Repositories**.
3. Add: `https://github.com/element-software/CasaBoard-HA`
4. Install **CasaBoard**, start it, then use **Open Web UI** (Ingress).

No official Community Store submission is required for this custom repository flow.

## First-run setup

Inside CasaBoard, connect to your Home Assistant instance (URL + long-lived token, or HA sign-in). Pages and connection data are stored in the App’s persistent `/data` volume and survive updates.

On HTTPS Ingress, CasaBoard talks to Home Assistant on the **same origin as the browser tab** (websocket, cameras, media). You can keep a LAN `http://` URL stored for the connection — it will not mark the tab insecure. Docker Compose installs that put **only** CasaBoard on HTTPS while HA stays on HTTP still need an `https://` Home Assistant URL (or a reverse proxy that exposes HA on the same origin).

## Kiosk / wall tablets

Ingress always shows the Home Assistant sidebar and header. For a full-bleed dashboard on a wall tablet (e.g. Fully Kiosk Browser), turn on the optional kiosk port.

1. **Settings → Apps → CasaBoard → Configuration → Network**: enter a host port (e.g. `3000`), save, then restart the App.
2. Find the page slug: it's the last part of the page's URL in CasaBoard (e.g. `kitchen`).
3. In Fully Kiosk Browser, set **Start URL** to `http://<ha-ip>:<port>/dashboard/<page-slug>` (use the port you set in step 1).
4. Optional, in Fully Kiosk: turn on **Fullscreen mode**, **Keep screen on** and **Reload on network reconnect**.

What the kiosk port serves:

| Path | On the kiosk port |
| --- | --- |
| `/dashboard/<page-slug>` | ✅ Served |
| Editor, setup, onboarding (`/`, `/setup/…`) | ❌ 403 Forbidden, so use Ingress |

> **Warning:** the kiosk port has no login. Anyone on your LAN can open dashboards on that port, and the dashboard gives their browser your Home Assistant access token. Only enable it on a trusted network. Clear the port to turn it off.

**Docker Compose:** installs are already served directly — open `http://<host-ip>:3000/dashboard/<page-slug>` in your kiosk browser (no Network port mapping needed).

Tips:

- Connect CasaBoard with a **long-lived access token**. OAuth re-authentication redirects to `/setup`, which the kiosk port blocks.
- A **403 Forbidden** on the tablet means the URL isn't a `/dashboard/…` page.
- A **page that won't load** usually means the port isn't set, or the App wasn't restarted after setting it.

## Updates

When a newer App version is published (each push to `main` on GitHub), Home Assistant shows it under **Settings → System → Updates**. Install from there — Supervisor pulls the new image from GHCR. Release notes appear on this App’s **Changelog** tab.

## HACS integration (optional)

The optional [HACS CasaBoard integration](https://github.com/element-software/CasaBoard-HA) exposes health sensors (`online`, pages count, HA connection). It does **not** register a sidebar iframe panel; on HAOS use this App’s Ingress for the UI.

Sensors need a plain HTTP base URL to your CasaBoard instance. The Ingress URL is not a stable poll target. Compose (or any direct URL) installs are the usual fit for sensors.

## Compose fallback

Non-HAOS hosts can run the same image with Docker Compose — see the [root README](https://github.com/element-software/CasaBoard-HA/blob/main/README.md).

## Support

- Issues: https://github.com/element-software/CasaBoard-HA/issues
- Site: https://casaboard.dev
