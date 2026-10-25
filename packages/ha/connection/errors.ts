import {
  ERR_CANNOT_CONNECT,
  ERR_CONNECTION_LOST,
  ERR_HASS_HOST_REQUIRED,
  ERR_INVALID_AUTH,
  ERR_INVALID_AUTH_CALLBACK,
  ERR_INVALID_HTTPS_TO_HTTP,
} from "home-assistant-js-websocket";

/**
 * Typed connection failures for onboarding / settings UI.
 * Prefer these over raw Error messages so the UI can show a clear fix per case.
 */
export type HAConnectionFailureCode =
  | "invalid_url"
  | "unreachable"
  | "invalid_auth"
  | "ssl"
  | "https_to_http"
  | "host_required"
  | "unknown";

export type HAConnectionFailure = {
  code: HAConnectionFailureCode;
  /** Short, user-facing message for this failure type. */
  message: string;
  /** Original thrown value, when available. */
  cause?: unknown;
};

const MESSAGES: Record<HAConnectionFailureCode, string> = {
  invalid_url:
    "That doesn’t look like a valid Home Assistant URL. Use a host like homeassistant.local:8123 or a full http(s) URL.",
  unreachable:
    "CasaBoard can’t reach that Home Assistant instance. Check the URL, that HA is running, and that this device can reach it on the network.",
  invalid_auth:
    "Home Assistant rejected the credentials. The token may be wrong, revoked, or expired — create a new long-lived access token and try again.",
  ssl: "The TLS/SSL certificate for that URL couldn’t be verified. Use a trusted certificate, or connect over http:// on your local network.",
  https_to_http:
    "This page is served over HTTPS but Home Assistant is on HTTP. Browsers block that mix — set the HA URL to the HTTPS address you actually browse, or open CasaBoard over HTTP.",
  host_required: "Enter a Home Assistant URL before connecting.",
  unknown:
    "Something went wrong connecting to Home Assistant. Check the URL and credentials, then try again.",
};

export class HAConnectionError extends Error {
  readonly code: HAConnectionFailureCode;
  readonly cause?: unknown;

  constructor(code: HAConnectionFailureCode, cause?: unknown) {
    super(MESSAGES[code]);
    this.name = "HAConnectionError";
    this.code = code;
    this.cause = cause;
  }

  toFailure(): HAConnectionFailure {
    return { code: this.code, message: this.message, cause: this.cause };
  }
}

export function haConnectionFailure(
  code: HAConnectionFailureCode,
  cause?: unknown
): HAConnectionFailure {
  return { code, message: MESSAGES[code], cause };
}

function messageOf(err: unknown): string {
  if (typeof err === "string") return err;
  if (err instanceof Error) return err.message;
  if (err && typeof err === "object" && "message" in err) {
    const m = (err as { message?: unknown }).message;
    if (typeof m === "string") return m;
  }
  return String(err ?? "");
}

function isFailureShape(err: unknown): err is HAConnectionFailure {
  if (!err || typeof err !== "object" || !("code" in err)) return false;
  const code = (err as { code?: unknown }).code;
  return (
    code === "invalid_url" ||
    code === "unreachable" ||
    code === "invalid_auth" ||
    code === "ssl" ||
    code === "https_to_http" ||
    code === "host_required" ||
    code === "unknown"
  );
}

/**
 * Map library error codes, network failures, and SSL issues to typed failures.
 */
export function classifyConnectionError(err: unknown): HAConnectionFailure {
  if (err instanceof HAConnectionError) {
    return err.toFailure();
  }

  if (isFailureShape(err)) {
    return {
      code: err.code,
      message: typeof err.message === "string" ? err.message : MESSAGES[err.code],
      cause: "cause" in err ? err.cause : err,
    };
  }

  // home-assistant-js-websocket rejects with bare numeric error codes
  if (err === ERR_INVALID_AUTH || err === ERR_INVALID_AUTH_CALLBACK) {
    return haConnectionFailure("invalid_auth", err);
  }
  if (err === ERR_CANNOT_CONNECT || err === ERR_CONNECTION_LOST) {
    return haConnectionFailure("unreachable", err);
  }
  if (err === ERR_HASS_HOST_REQUIRED) {
    return haConnectionFailure("host_required", err);
  }
  if (err === ERR_INVALID_HTTPS_TO_HTTP) {
    return haConnectionFailure("https_to_http", err);
  }

  const msg = messageOf(err).toLowerCase();

  if (
    msg.includes("certificate") ||
    msg.includes("ssl") ||
    msg.includes("tls") ||
    msg.includes("cert ") ||
    msg.includes("unable to verify") ||
    msg.includes("self signed") ||
    msg.includes("self-signed")
  ) {
    return haConnectionFailure("ssl", err);
  }

  if (
    msg.includes("failed to fetch") ||
    msg.includes("networkerror") ||
    msg.includes("network error") ||
    msg.includes("econnrefused") ||
    msg.includes("enotfound") ||
    msg.includes("etimedout") ||
    msg.includes("ehostunreach") ||
    msg.includes("load failed") ||
    msg.includes("cannot connect") ||
    msg.includes("connection failed") ||
    msg.includes("err_cannot_connect")
  ) {
    return haConnectionFailure("unreachable", err);
  }

  if (
    msg.includes("invalid auth") ||
    msg.includes("auth failed") ||
    msg.includes("unauthorized") ||
    msg.includes("401") ||
    msg.includes("403")
  ) {
    return haConnectionFailure("invalid_auth", err);
  }

  if (msg.includes("https_to_http") || msg.includes("https to http")) {
    return haConnectionFailure("https_to_http", err);
  }

  if (msg.includes("invalid url") || msg.includes("invalid_url")) {
    return haConnectionFailure("invalid_url", err);
  }

  return haConnectionFailure("unknown", err);
}

/** Throw a typed Error so React error state / Error boundaries keep working. */
export function throwConnectionFailure(err: unknown): never {
  if (err instanceof HAConnectionError) throw err;
  const failure = classifyConnectionError(err);
  throw new HAConnectionError(failure.code, failure.cause ?? err);
}
