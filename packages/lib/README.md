# `@repo/lib`

Local-first helpers shared by `apps/app` (and optionally `apps/public`).

## Actions

- `pageActions` – CRUD for dashboard pages stored under `DATA_DIR`
- `sidebarActions` – CRUD for sidebars
- `themeActions` – CRUD for themes
- `haConnectionActions` – read/write the single Home Assistant connection

## Services

- `configService` – builds the server dashboard config from stored pages
- `linkService` – cross-origin href helpers between `apps/app` and `apps/public`

## Other

- `store/` – JSON file persistence (`pages`, `sidebars`, `themes`, `haConnection`)
- `theme/` / `style/` – theme merge and dashboard style resolution
- `logger` – shared pino logger for server and client
