# `@casaboard/ha`

Home Assistant connection helpers, React provider, and entity hooks used by
CasaBoard — published for reuse in other React apps.

## Install

```bash
npm install @casaboard/ha home-assistant-js-websocket
# peer: react, react-dom (^18 or ^19)
```

## Quick start

```tsx
import {
  HAProvider,
  useHA,
  useEntity,
  createLocalStorageTokenStore,
} from "@casaboard/ha";

const tokenStore = createLocalStorageTokenStore();

export function App() {
  return (
    <HAProvider
      haInstance={{ hass_url: "http://homeassistant.local:8123" }}
      tokenStore={tokenStore}
    >
      <Dashboard />
    </HAProvider>
  );
}

function Dashboard() {
  const { connected } = useHA();
  const light = useEntity("light.living_room");
  return (
    <p>
      {connected ? "Connected" : "Connecting…"} — {light?.state}
    </p>
  );
}
```

## What’s included

- **Connection** — `connect`, `reauthenticate`, long-lived token probe, OAuth
  callback completion, URL normalization, typed connection errors
- **React** — `HAProvider`, `useHA`, `useEntity`, `useEntities`, `useEntityHistory`
- **Camera helpers** — HLS/MJPEG URL builders and capability checks
- **Token stores** — `createLocalStorageTokenStore` (bring your own for servers)

## Auth notes

Prefer a [long-lived access token](https://www.home-assistant.io/docs/authentication/)
for headless / kiosk clients. OAuth (`getAuth` via `reauthenticate` /
`completeOAuthCallback`) needs a browser redirect back to your app.

## Publishing (maintainers)

CI uses [npm Trusted Publishing](https://docs.npmjs.com/trusted-publishers/)
(OIDC) — no long-lived `NPM_TOKEN`.

**One-time bootstrap** (package must exist before Trusted Publisher can be set):

```bash
cd packages/ha
npm run build
npm publish --access public   # enter your npm 2FA OTP when prompted
```

Then on npmjs.com → `@casaboard/ha` → **Settings** → **Trusted Publisher**:

- Provider: **GitHub Actions**
- Repository owner: `element-software`
- Repository name: `CasaBoard`
- Workflow filename: `publish-ha.yml` (filename only)
- Allowed action: **`npm publish`**

**Afterwards**, push a version tag:

```bash
git tag ha-v0.1.1
git push origin ha-v0.1.1
```

That runs `.github/workflows/publish-ha.yml` and publishes via OIDC.
