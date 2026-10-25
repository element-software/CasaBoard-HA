import {
  getAuth,
  type AuthData,
  type LoadTokensFunc,
} from "home-assistant-js-websocket";
import type { HAConnection } from "../types";
import type { HATokenStore } from "./tokenStore";
import { readIngressPrefixFromBrowser } from "./browserHassUrl";
import { throwConnectionFailure } from "./errors";

export type OAuthCallbackProps = {
  haInstance: HAConnection;
  tokenStore: HATokenStore;
  redirectUrl?: string;
};

/**
 * Resolve the OAuth redirect URL for the current browser origin.
 * Prefer this over a configured APP_ORIGIN so client_id / redirect_uri match.
 * Includes Home Assistant ingress prefix when the app runs as an HA add-on.
 */
export function oauthRedirectUrl(path: string): string {
  if (typeof window === "undefined") {
    return path.startsWith("/") ? path : `/${path}`;
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  const prefix = readIngressPrefixFromBrowser();
  return `${window.location.origin}${prefix}${normalized}`;
}

/**
 * Finish a Home Assistant OAuth return (`?auth_callback=1&code=…&state=…`).
 * Must run before the query string is stripped — getAuth reads location.search.
 * Also awaits token persistence (getAuth does not await async saveTokens).
 */
export async function completeOAuthCallback({
  haInstance,
  tokenStore,
  redirectUrl,
}: OAuthCallbackProps): Promise<AuthData> {
  const saveTokens = tokenStore.saveTokens(haInstance.hass_url);

  try {
    const auth = await getAuth({
      hassUrl: haInstance.hass_url,
      saveTokens,
      // Don't fall back to a redirect loop if the callback params are missing —
      // load null so a bad return URL surfaces as an error instead.
      loadTokens: (async () => null) as LoadTokensFunc,
      ...(redirectUrl ? { redirectUrl } : {}),
    });

    await Promise.resolve(saveTokens(auth.data));
    return auth.data;
  } catch (err) {
    throwConnectionFailure(err);
  }
}

/**
 * True when the current page URL is an HA OAuth return.
 */
export function isOAuthCallbackUrl(
  search: string | { get(name: string): string | null }
): boolean {
  if (typeof search === "string") {
    const q = new URLSearchParams(
      search.startsWith("?") ? search.slice(1) : search
    );
    return q.has("auth_callback");
  }
  return Boolean(search.get("auth_callback"));
}
