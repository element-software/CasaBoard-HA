import {
  createConnection,
  createLongLivedTokenAuth,
  type AuthData,
} from "home-assistant-js-websocket";
import {
  classifyConnectionError,
  type HAConnectionFailure,
} from "./errors";
import { normalizeHassUrl } from "./normalizeUrl";

export type TestLongLivedTokenResult =
  | { ok: true; hassUrl: string; auth: AuthData }
  | { ok: false; failure: HAConnectionFailure };

const LONG_LIVED_TTL_MS = 10 * 365 * 24 * 60 * 60 * 1000;

/**
 * Probe a Home Assistant instance with a long-lived access token.
 * Opens a websocket, then closes it — does not leave a live connection.
 */
export async function testLongLivedTokenConnection(
  rawUrl: string,
  rawToken: string
): Promise<TestLongLivedTokenResult> {
  const normalized = normalizeHassUrl(rawUrl);
  if (!normalized.ok) {
    return { ok: false, failure: normalized.failure };
  }

  const token = rawToken.trim();
  if (!token) {
    return {
      ok: false,
      failure: {
        code: "invalid_auth",
        message:
          "Enter a long-lived access token. Create one in Home Assistant → Profile → Long-lived access tokens.",
      },
    };
  }

  try {
    const auth = createLongLivedTokenAuth(normalized.url, token);
    const connection = await createConnection({ auth });
    connection.close();

    const data: AuthData = {
      hassUrl: normalized.url,
      clientId: "",
      expires: Date.now() + LONG_LIVED_TTL_MS,
      expires_in: Math.floor(LONG_LIVED_TTL_MS / 1000),
      refresh_token: "",
      access_token: token,
    };

    return { ok: true, hassUrl: normalized.url, auth: data };
  } catch (err) {
    return { ok: false, failure: classifyConnectionError(err) };
  }
}
