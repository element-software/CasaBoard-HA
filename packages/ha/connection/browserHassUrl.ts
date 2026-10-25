/** Same cookie HA Ingress middleware sets (`packages/lib/ingress/path.ts`). */
export const INGRESS_PATH_COOKIE = "casaboard-ingress-path";

export type BrowserLocationLike = {
  origin: string;
  pathname: string;
  cookie?: string;
};

export function currentBrowserLocation(): BrowserLocationLike | null {
  if (typeof window === "undefined") return null;
  const cookie = typeof document === "undefined" ? "" : document.cookie;
  return {
    origin: window.location.origin,
    pathname: window.location.pathname,
    cookie,
  };
}

/**
 * Ingress path prefix for the current browser page (`/api/hassio_ingress/<token>`).
 * Cookie is preferred; pathname is the fallback when the cookie is missing.
 */
export function readIngressPrefixFromBrowser(
  location: BrowserLocationLike | null = currentBrowserLocation()
): string {
  if (!location) return "";

  const cookie = location.cookie ?? "";
  const match = cookie.match(
    new RegExp(`(?:^|;\\s*)${INGRESS_PATH_COOKIE}=([^;]*)`)
  );
  if (match?.[1]) {
    try {
      const decoded = decodeURIComponent(match[1]).trim();
      if (decoded && decoded !== "/") {
        return decoded.endsWith("/") ? decoded.slice(0, -1) : decoded;
      }
    } catch {
      // malformed cookie — fall through to the pathname
    }
  }

  const pathMatch = location.pathname.match(/^(\/api\/hassio_ingress\/[^/]+)/);
  return pathMatch?.[1] ?? "";
}

/**
 * Browser-facing Home Assistant base URL.
 * Under HA Ingress the page origin *is* HA, so use that instead of a stored
 * LAN `http://` URL (which would be mixed content on HTTPS Ingress).
 */
export function resolveBrowserHassUrl(
  storedUrl: string,
  location: BrowserLocationLike | null = currentBrowserLocation()
): string {
  if (!location) return storedUrl;
  if (readIngressPrefixFromBrowser(location)) {
    return location.origin;
  }
  return storedUrl;
}

function isHaMediaPath(pathname: string): boolean {
  return pathname.startsWith("/api/") || pathname.startsWith("/local/");
}

/**
 * Rewrite an absolute `http://` HA API/media URL onto `browserHassUrl`.
 * Leaves third-party camera IPs and already-HTTPS URLs unchanged.
 */
export function rewriteHassMediaUrl(url: string, browserHassUrl: string): string {
  if (!url.startsWith("http://") && !url.startsWith("https://")) {
    return url;
  }

  let parsed: URL;
  let base: URL;
  try {
    parsed = new URL(url);
    base = new URL(browserHassUrl);
  } catch {
    return url;
  }

  if (parsed.protocol !== "http:") return url;
  if (!isHaMediaPath(parsed.pathname)) return url;

  parsed.protocol = base.protocol;
  parsed.hostname = base.hostname;
  parsed.port = base.port;
  return parsed.toString();
}

/** Point the websocket at `hassUrl` without persisting the change. */
export function alignAuthHassUrl<T extends { data: { hassUrl: string } }>(
  auth: T,
  hassUrl: string
): T {
  const normalized = hassUrl.replace(/\/$/, "");
  if (auth.data.hassUrl !== normalized) {
    auth.data.hassUrl = normalized;
  }
  return auth;
}
