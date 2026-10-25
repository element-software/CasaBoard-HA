# Changelog

All notable changes to the CasaBoard Home Assistant App are documented here.

## [0.3.2] - 2026-10-25

- fix: publish the HA image as ghcr.io/element-software/casaboard-ha
- fix: share one CasaBoard-HA GitHub URL across the app

## [0.3.1] - 2026-10-23

- fix: stop HTTPS Ingress from marking CasaBoard as insecure

## [0.3.0] - 2026-10-22

- feat: add Home Assistant cleanup in Setup
- fix: use a house icon in the HA sidebar to match the CasaBoard logo

## [0.2.4] - 2026-10-19

- fix: stop dumping full dashboard JSON into Supervisor logs

## [0.2.3] - 2026-10-19

- fix: stop re-rendering the editor on every HA entity update

## [0.2.2] - 2026-10-19

- fix: make camera streams fall back like Lovelace
- Ship in-app About/Docs, fix ingress breadcrumbs, and align kiosk docs.

## [0.2.1] - 2026-10-19

- ci: auto-release on every push to main

## [0.2.0] - 2026-10-18

- Add an opt-in kiosk port for full-screen dashboards.

## [0.1.2] - 2026-10-18

- Fix Ingress returning Forbidden under Home Assistant.

## [0.1.1] - 2026-10-18

- Remove the leftover hacs-panel docs folder.
- Ship CasaBoard as a Home Assistant App with Ingress and one-click releases.
- Add per-page event-triggered camera popups (phase 1).
- Show a chevron on every sidebar nav item, not just Media.
- Open a full-gauge control modal when tapping the Thermostat card.
- Fix duplicate React keys in EntitiesCard when entity ids are empty or repeated.

## [0.1.0] - 2026-07-28

### Added

- Initial Home Assistant App packaging with Ingress
- Multi-arch image `ghcr.io/element-software/casaboard`
- Persistent `/data` for pages and HA connection
- Watchdog on `/api/health`
