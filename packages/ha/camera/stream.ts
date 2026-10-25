import type { Auth, Connection, UnsubscribeFunc } from "home-assistant-js-websocket";
import { rewriteHassMediaUrl } from "../connection/browserHassUrl";

/** Matches Home Assistant `StreamType` values from `camera/capabilities`. */
export type CameraStreamType = "hls" | "web_rtc";

export interface CameraCapabilities {
  frontend_stream_types?: CameraStreamType[];
}

/** CameraEntityFeature.STREAM bit from Home Assistant. */
export const CAMERA_FEATURE_STREAM = 2;

export type WebRtcOfferEvent =
  | { type: "session"; session_id: string }
  | { type: "answer"; answer: string }
  | { type: "candidate"; candidate: RTCIceCandidateInit }
  | { type: "error"; code: string; message: string };

export interface WebRtcClientConfiguration {
  configuration: RTCConfiguration;
  dataChannel?: string;
}

export function joinHassUrl(hassUrl: string, path: string): string {
  const base = hassUrl.replace(/\/$/, "");
  if (path.startsWith("http://") || path.startsWith("https://")) {
    return rewriteHassMediaUrl(path, base);
  }
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized}`;
}

export async function ensureFreshAccessToken(auth: Auth): Promise<string> {
  if (auth.expired) {
    await auth.refreshAccessToken();
  }
  return auth.accessToken;
}

export async function getCameraCapabilities(
  connection: Connection,
  entityId: string
): Promise<CameraCapabilities> {
  return connection.sendMessagePromise({
    type: "camera/capabilities",
    entity_id: entityId,
  }) as Promise<CameraCapabilities>;
}

export function cameraSupportsHls(
  capabilities: CameraCapabilities | null | undefined,
  supportedFeatures?: number
): boolean {
  // Prefer explicit capabilities when present (WebRTC-only cameras omit HLS).
  if (capabilities?.frontend_stream_types) {
    return capabilities.frontend_stream_types.includes("hls");
  }
  if (
    typeof supportedFeatures === "number" &&
    (supportedFeatures & CAMERA_FEATURE_STREAM) === CAMERA_FEATURE_STREAM
  ) {
    return true;
  }
  return false;
}

export function cameraSupportsWebRtc(
  capabilities: CameraCapabilities | null | undefined
): boolean {
  return Boolean(capabilities?.frontend_stream_types?.includes("web_rtc"));
}

/**
 * Request an HLS playlist URL from Home Assistant's stream integration.
 * Returns a path (or absolute URL) that must be fetched with the access token.
 */
export async function getCameraHlsUrl(
  connection: Connection,
  hassUrl: string,
  entityId: string
): Promise<string> {
  const result = (await connection.sendMessagePromise({
    type: "camera/stream",
    entity_id: entityId,
    format: "hls",
  })) as { url: string };
  return joinHassUrl(hassUrl, result.url);
}

export async function getWebRtcClientConfiguration(
  connection: Connection,
  entityId: string
): Promise<WebRtcClientConfiguration> {
  return connection.sendMessagePromise({
    type: "camera/webrtc/get_client_config",
    entity_id: entityId,
  }) as Promise<WebRtcClientConfiguration>;
}

/**
 * Start async WebRTC signaling. Events (session, answer, candidates, errors)
 * arrive via the subscription callback. Unsubscribing closes the HA session.
 */
export function subscribeWebRtcOffer(
  connection: Connection,
  entityId: string,
  offer: string,
  callback: (event: WebRtcOfferEvent) => void
): Promise<UnsubscribeFunc> {
  return connection.subscribeMessage<WebRtcOfferEvent>(
    callback,
    {
      type: "camera/webrtc/offer",
      entity_id: entityId,
      offer,
    },
    // Offers are one-shot; replaying the same SDP after reconnect is invalid.
    { resubscribe: false }
  );
}

export async function addWebRtcCandidate(
  connection: Connection,
  entityId: string,
  sessionId: string,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await connection.sendMessagePromise({
    type: "camera/webrtc/candidate",
    entity_id: entityId,
    session_id: sessionId,
    candidate,
  });
}

/**
 * Build an MJPEG proxy URL. `token` must be the camera entity's
 * `attributes.access_token` (same as Lovelace), not the user OAuth token.
 */
export function getCameraMjpegUrl(
  hassUrl: string,
  entityId: string,
  token: string
): string {
  const url = new URL(
    joinHassUrl(hassUrl, `/api/camera_proxy_stream/${entityId}`)
  );
  url.searchParams.set("token", token);
  return url.toString();
}

/**
 * Build a still-image proxy URL. `token` must be the camera entity's
 * `attributes.access_token` (same as Lovelace), not the user OAuth token.
 */
export function getCameraPosterUrl(
  hassUrl: string,
  entityId: string,
  token: string
): string {
  const url = new URL(joinHassUrl(hassUrl, `/api/camera_proxy/${entityId}`));
  url.searchParams.set("token", token);
  return url.toString();
}
