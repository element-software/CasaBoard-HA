import { haConnectionFailure, type HAConnectionFailure } from "./errors";

export type NormalizeHassUrlResult =
  | { ok: true; url: string }
  | { ok: false; failure: HAConnectionFailure };

/**
 * Normalize a user-entered Home Assistant URL.
 * - Trims whitespace and trailing slashes
 * - Defaults to http:// when no protocol is given
 * - Rejects empty / clearly invalid input
 */
export function normalizeHassUrl(input: string): NormalizeHassUrlResult {
  const trimmed = input.trim();
  if (!trimmed) {
    return { ok: false, failure: haConnectionFailure("host_required") };
  }

  let candidate = trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(candidate)) {
    candidate = `http://${candidate}`;
  }

  let parsed: URL;
  try {
    parsed = new URL(candidate);
  } catch {
    return { ok: false, failure: haConnectionFailure("invalid_url") };
  }

  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    return { ok: false, failure: haConnectionFailure("invalid_url") };
  }

  if (!parsed.hostname) {
    return { ok: false, failure: haConnectionFailure("invalid_url") };
  }

  // Drop trailing slash; keep port and path if the user supplied one
  const path = parsed.pathname === "/" ? "" : parsed.pathname.replace(/\/+$/, "");
  const url = `${parsed.protocol}//${parsed.host}${path}`;

  return { ok: true, url };
}
