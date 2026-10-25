import type { Auth, LoadTokensFunc, SaveTokensFunc } from "home-assistant-js-websocket";
import {
  getAuth,
  createConnection,
  createLongLivedTokenAuth,
  ERR_HASS_HOST_REQUIRED,
  ERR_INVALID_AUTH,
} from "home-assistant-js-websocket";
import type { ConnectResult, EntityDomain, EntityId, HAConnection } from "../types";
import type { HATokenStore } from "./tokenStore";
import { alignAuthHassUrl } from "./browserHassUrl";
import {
  classifyConnectionError,
  haConnectionFailure,
  throwConnectionFailure,
} from "./errors";

export type { HATokenStore } from "./tokenStore";
export { createLocalStorageTokenStore } from "./tokenStore";
export {
  classifyConnectionError,
  haConnectionFailure,
  HAConnectionError,
  throwConnectionFailure,
  type HAConnectionFailure,
  type HAConnectionFailureCode,
} from "./errors";
export { normalizeHassUrl, type NormalizeHassUrlResult } from "./normalizeUrl";
export {
  testLongLivedTokenConnection,
  type TestLongLivedTokenResult,
} from "./testConnection";
export {
  completeOAuthCallback,
  isOAuthCallbackUrl,
  oauthRedirectUrl,
} from "./oauth";
export {
  alignAuthHassUrl,
  readIngressPrefixFromBrowser,
  resolveBrowserHassUrl,
  rewriteHassMediaUrl,
} from "./browserHassUrl";
export type { BrowserLocationLike } from "./browserHassUrl";

export interface HAConnectProps {
  haInstance: HAConnection;
  /** Required: how to persist HA OAuth / long-lived tokens. */
  tokenStore: HATokenStore;
  /** OAuth redirect target after Home Assistant auth. */
  redirectUrl?: string;
}

function normalizeNameToSlug(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_\.]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^_|_$/g, "");
}

function buildEntityId(name: string, domain: EntityDomain): EntityId {
  const normalizedDomain = String(domain).trim().toLowerCase();
  const normalizedName = normalizeNameToSlug(name);
  if (normalizedName.includes(".")) {
    return normalizedName as EntityId;
  }
  return `${normalizedDomain}.${normalizedName}`;
}

export async function getEntity(
  name: string,
  domain: EntityDomain,
  connection: import("home-assistant-js-websocket").Connection
): Promise<any> {
  const entityId = buildEntityId(name, domain);
  const states = (await connection.sendMessagePromise({
    type: "get_states",
  })) as Array<{
    entity_id: string;
    [key: string]: any;
  }>;
  return states.find((s) => s.entity_id === entityId) ?? null;
}

function buildAuthOptions(
  haInstance: HAConnection,
  tokenStore: HATokenStore,
  redirectUrl?: string
) {
  const saveTokens: SaveTokensFunc = tokenStore.saveTokens(haInstance.hass_url);
  const loadTokens: LoadTokensFunc = tokenStore.loadTokens;
  return {
    hassUrl: haInstance.hass_url,
    saveTokens,
    loadTokens,
    ...(redirectUrl ? { redirectUrl } : {}),
  };
}

export async function connect({
  haInstance,
  tokenStore,
  redirectUrl,
}: HAConnectProps): Promise<ConnectResult> {
  let auth: Auth | undefined;
  let connection: import("home-assistant-js-websocket").Connection | undefined;

  const stored = (await Promise.resolve(tokenStore.loadTokens())) ?? null;
  const longLivedToken = stored?.access_token;
  const connectUrl = haInstance.hass_url;
  if (longLivedToken && !stored?.refresh_token) {
    auth = createLongLivedTokenAuth(connectUrl, longLivedToken);
    alignAuthHassUrl(auth, connectUrl);
    connection = await createConnection({ auth });
    return { connection, auth };
  }

  // Reuse stored OAuth tokens (matched on their hassUrl), then point the
  // websocket at connectUrl. First-run with no tokens authorizes at connectUrl.
  const tokenHassUrl = stored?.hassUrl || connectUrl;
  const getAuthOptions = buildAuthOptions(
    { hass_url: tokenHassUrl },
    tokenStore,
    redirectUrl
  );

  try {
    auth = await getAuth(getAuthOptions);
  } catch (err) {
    if (err === ERR_INVALID_AUTH || err === ERR_HASS_HOST_REQUIRED) {
      try {
        auth = await getAuth(getAuthOptions);
      } catch (err2) {
        throwConnectionFailure(err2);
      }
    } else {
      throwConnectionFailure(err);
    }
  }

  try {
    if (!auth) throwConnectionFailure(haConnectionFailure("unknown"));
    alignAuthHassUrl(auth, connectUrl);
    connection = await createConnection({ auth });
  } catch (err) {
    throwConnectionFailure(err);
  }

  return { connection, auth };
}

/**
 * Re-authenticates the Home Assistant connection.
 * Forces a fresh OAuth flow instead of reusing the stored token.
 */
export async function reauthenticate({
  haInstance,
  tokenStore,
  redirectUrl,
}: HAConnectProps): Promise<void> {
  const getAuthOptions = {
    ...buildAuthOptions(haInstance, tokenStore, redirectUrl),
    loadTokens: (async () => null) as LoadTokensFunc,
  };

  try {
    await getAuth(getAuthOptions);
  } catch (err) {
    throwConnectionFailure(err);
  }
}
