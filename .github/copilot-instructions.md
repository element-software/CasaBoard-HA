# CasaBoard Copilot Instructions

## Project Overview

CasaBoard is an **open-source, self-hosted dashboard builder for Home Assistant**.
This is a **Turbo monorepo** with TypeScript/TSX apps and shared packages:

- **2 Next.js 15+ apps** (App Router) with React 19
- **Shared packages** for UI components, HA integration, utilities, types, and local persistence
- No account, no cloud auth, no multi-tenant SaaS layer — data lives as JSON under `DATA_DIR`

**Technology Stack:**

- **Runtime**: Node 18+ (tested with v20), npm 10+
- **Framework**: Next.js 15.5+ with Turbopack
- **UI**: HeroUI components, Tailwind CSS v4, Material & Hero Icons
- **Persistence**: Flat JSON files via `@repo/lib/store` (no database)
- **Page Builder**: Puck editor (@measured/puck)
- **Home Assistant**: home-assistant-js-websocket library
- **Build Tool**: Turbo (monorepo orchestration)
- **Languages**: TypeScript 5.9.2, React 19.1.0

## Repository Structure

### Apps (`/apps`)

- **`apps/app`** - Dashboard builder (port 3000); this is what the Docker image runs
  - Routes: `/(header)/setup/*`, `/(immersive)/setup/*`, `/dashboard/[page]`, `/api/pages`
  - Environment: optional `DATA_DIR`, `PORT`; HA connection stored in `DATA_DIR/ha-connection.json`
  - No auth middleware — local-only, no login gate
- **`apps/public`** - Documentation / project site (port 3001); not part of the Docker image
  - Optional `RESEND_API_KEY` for the contact form only
  - Must not depend on `apps/app` at build or runtime (shared `@repo/*` packages only)

### Packages (`/packages`)

- **`ui`** - Shared UI components (HeroUI, Puck, shared widgets)
  - Components: Clock, Light, Toggle, Switch, Alarm, Sidebars, GraphCard, EntityAutocomplete, Puck editor configs
- **`lib`** - Actions, services, JSON-file store, theme/style helpers, logging
  - Actions: pageActions, sidebarActions, themeActions, haConnectionActions
  - Services: configService, linkService (cross-origin hrefs between app and public)
- **`types`** - Shared TypeScript types (ha.ts, page.ts, sidebar.ts, theme.ts, style.ts, shared.ts)
- **`hooks`** - Shared React hooks (theme, pages, etc.)
- **`utils`** - Entity utilities (lights, binary sensors, icons, alarm, tools)
- **`ha`** - Home Assistant websocket integration
- **`tailwind-config`** - Shared Tailwind CSS v4 + PostCSS + theme config
- **`eslint-config`** - ESLint flat configs (base.js, next.js, react-internal.js)
- **`typescript-config`** - Shared TypeScript config (base.json)
- **`config`** - Miscellaneous config exports

### Configuration Files (Root)

- **`turbo.json`** - Turbo build orchestration, task dependencies
- **`package.json`** - Root workspace config, scripts, engines
- **`.npmrc`** - npm configuration (empty but present)
- **`.gitignore`** - Standard ignores: node_modules, .next, .turbo, .env\*, dist, build

## Build & Development Commands

### Installation

**ALWAYS run this first after cloning or when package.json changes:**

```bash
npm install
```

- **Time**: ~60 seconds
- **Output**: Installs ~742 packages
- **Note**: May show 1 high severity vulnerability (normal, requires review)

### Development Server

```bash
npm run dev
```

- **What it does**: Runs both apps concurrently via Turbo
- **Ports**: App at http://localhost:3000, Public at http://localhost:3001
- **Uses**: Turbopack (--turbopack flag) for faster dev builds
- **Persistent**: Runs indefinitely until stopped (Ctrl+C)

**Single app development:**

```bash
npm run dev --workspace=app      # App only (port 3000)
npm run dev --workspace=public   # Public only (port 3001)
```

### Building

```bash
npm run build
```

- **Time**: ~2-5 minutes (depends on network for Google Fonts)
- **Known Issue**: Fails if Google Fonts (fonts.googleapis.com) is unreachable
  - **Error**: `getaddrinfo ENOTFOUND fonts.googleapis.com`
  - **Cause**: Both apps use `next/font/google` to load Inter font in `app/layout.tsx`
  - **Workaround**: Ensure network access to fonts.googleapis.com, or comment out font imports for local builds
- **Output**: `.next/` directories in each app
- **Turbo behavior**: Builds packages first (^build dependency), then apps

### Linting

```bash
npm run lint
```

- **Known Issue**: Multiple packages lack `eslint.config.js` files
  - **Error**: `ESLint couldn't find an eslint.config.(js|mjs|cjs) file` for packages like `@repo/types`, `@repo/utils`, etc.
  - **Apps**: Both apps use `next lint` which works but may prompt for ESLint setup on first run if not configured
  - **app workspace**: Not yet configured - will interactively prompt for Strict/Base ESLint config on first lint
  - **public workspace**: Already configured and lints successfully (shows warnings about NODE_ENV, unused vars, etc.)
- **Workaround for full repo lint**: Expect failures in packages without eslint.config.js
- **Better approach**: Lint individual apps using `npm run lint --workspace=public` or `npm run lint --workspace=app`
- **Apps use**: ESLint via Next.js built-in linting (note: `next lint` is deprecated in Next.js 16)
- **Flag**: `--max-warnings 0` (zero tolerance for warnings)

### Type Checking

```bash
npm run check-types
```

- **Known Issue**: Some packages (e.g., `@repo/utils`) lack `tsconfig.json`
  - **Error**: TypeScript prints help text instead of type-checking
  - **Workaround**: Type checking works for apps and packages with tsconfig.json
- **What it does**: Runs `tsc --noEmit` across all packages via Turbo
- **Time**: ~10-30 seconds

### Formatting

```bash
npm run format
```

- **What it does**: Runs Prettier on all `**/*.{ts,tsx,md}` files
- **Uses**: Prettier ^3.6.2

## Environment Setup

### Optional for `apps/app`

- `DATA_DIR` – JSON data directory (defaults to `./data`; Docker uses `/data`)
- `PORT` – defaults to `3000`
- `NEXT_PUBLIC_APP_ORIGIN` / `NEXT_PUBLIC_PUBLIC_ORIGIN` – optional cross-app link origins

### Optional for `apps/public`

- `RESEND_API_KEY` – contact form email delivery

### Turbo Environment

- **Global env**: `RESEND_API_KEY` (declared in turbo.json but optional)
- **Detection**: Turbo watches `.env*` files (globalDependencies in turbo.json)

## Key Architectural Details

### Tailwind CSS v4 Setup

- **Shared config**: `packages/tailwind-config`
  - `globals.css` - Base styles
  - `theme.css` - Custom theme variables
  - `hero.ts` - HeroUI theme config
  - `postcss.config.js` - PostCSS setup for Tailwind v4
- **App integration**:
  - Each app has `app/globals.css` importing shared CSS
  - Each app has `postcss.config.js` re-exporting `@repo/tailwind-config/postcss`
  - `@source` globs in CSS include that app's files + `packages/ui`

### Auth model

- CasaBoard itself has **no user accounts and no auth middleware**
- Home Assistant OAuth / long-lived tokens live in `packages/ha` + `ha-connection.json`
- Do not reintroduce SaaS-era login, billing, or multi-tenant gates

### Puck Page Editor

- **Config location**: `packages/ui/components/puck/puck.config.tsx`
- **Components**: Custom components registered for drag-and-drop page building
- **Usage**: Import Puck config directly to keep server bundles clean

### Privacy

- Neither `apps/app` nor `apps/public` loads analytics or tracking scripts
- No cookie consent banner — there are no analytics cookies to consent to
- Do not reintroduce Vercel Analytics, Google Analytics, or similar without an explicit product decision

### Event Listener Setup (Development Hack)

- **File**: `apps/app/lib/event-listener-setup.js`
- **Purpose**: Prevent MaxListenersExceededWarning in development
- **Imported**: In `apps/app/next.config.js` at top
- **Sets**: `process.setMaxListeners(20)` in dev, 10 in prod

## Common Pitfalls & Workarounds

1. **Build fails with Google Fonts error**
   - **Symptom**: `getaddrinfo ENOTFOUND fonts.googleapis.com`
   - **Fix**: Ensure network allows fonts.googleapis.com, or temporarily comment out `import { Inter } from "next/font/google"` in `apps/app/app/layout.tsx` and `apps/public/app/layout.tsx`

2. **Lint fails for packages**
   - **Symptom**: `ESLint couldn't find an eslint.config.js file` in @repo/types, @repo/utils, etc.
   - **Current state**: Most packages don't have eslint configs; only `apps/public` has one
   - **Workaround**: Use `npm run lint --workspace=public` to lint only the public app
   - **For new packages**: Add `eslint.config.js` to each package
   - **Example**:
     ```js
     import { config } from "@repo/eslint-config/base";
     export default config;
     ```
   - **Note**: `apps/app` needs ESLint setup - will prompt interactively on first `npm run lint --workspace=app`

3. **Type checking fails for packages**
   - **Symptom**: TypeScript prints help text for packages without tsconfig.json
   - **Fix**: Add `tsconfig.json` to each package extending `@repo/typescript-config/base.json`
   - **Example**:
     ```json
     {
       "extends": "@repo/typescript-config/base.json",
       "compilerOptions": {},
       "include": ["**/*.ts", "**/*.tsx"],
       "exclude": ["node_modules"]
     }
     ```

4. **Dependency installation warnings**
   - **Symptom**: "1 high severity vulnerability" after `npm install`
   - **Action**: Run `npm audit` to review; may require dependency updates

5. **MaxListenersExceededWarning in development**
   - **Already handled**: `apps/app/lib/event-listener-setup.js` suppresses this
   - **If it still appears**: Check import in `next.config.js` is present

## Validation Steps Before Committing

1. **Install dependencies**: `npm install` (~60 seconds, installs ~742 packages)
2. **Type check**: `npm run check-types` (expect TypeScript help output from packages without tsconfig.json; some packages will fail)
3. **Lint**: `npm run lint` (expect failures from packages without eslint.config.js)
   - **Better**: `npm run lint --workspace=public` to lint successfully
   - **Note**: `apps/app` not yet configured for linting
4. **Build** (if network allows): `npm run build` (may fail if fonts.googleapis.com unreachable)
5. **Dev server**: `npm run dev` and verify both apps start on ports 3000 and 3001

## File Locations Reference

**Root files:**

- `package.json`, `turbo.json`, `.npmrc`, `.gitignore`, `README.md`

**App configs:**

- `apps/app/next.config.js`, `apps/app/tsconfig.json`, `apps/app/postcss.config.js`
  - **Note**: No eslint.config.js in apps/app (uses `next lint` which prompts for setup)
- `apps/public/next.config.js`, `apps/public/eslint.config.js`, `apps/public/tsconfig.json`, `apps/public/postcss.config.js`

**Package configs:**

- `packages/eslint-config/base.js`, `packages/eslint-config/next.js`
- `packages/typescript-config/base.json`
- `packages/tailwind-config/globals.css`, `packages/tailwind-config/hero.ts`, `packages/tailwind-config/postcss.config.js`

**Key source files:**

- `apps/app/app/layout.tsx` (root layout)
- `packages/ui/components/puck/puck.config.tsx` (Puck editor config)
- `packages/lib/index.ts` (exports actions, services, store helpers)
- `packages/ha/connection/index.ts` (Home Assistant connect / reauthenticate)

## Instructions for Agents

- **Trust these instructions** and only search the codebase if information here is incomplete or incorrect.
- **Always run `npm install`** before building or running commands.
- **Expect linting failures** in packages without eslint.config.js; focus on linting apps.
- **Expect type-checking issues** in packages without tsconfig.json; this is a known limitation.
- **Be aware of network dependencies** (Google Fonts) when building.
- **Use Turbo workspace filtering** for single-app development: `--workspace=app` or `--workspace=public`.
- **Do not assume Supabase, Stripe, login, or billing** — those are removed SaaS leftovers.
- **Consult the README and ROADMAP** for product positioning and remaining work.
