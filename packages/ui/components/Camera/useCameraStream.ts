"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import type { Connection } from "home-assistant-js-websocket";
import {
  cameraSupportsHls,
  cameraSupportsWebRtc,
  ensureFreshAccessToken,
  getCameraCapabilities,
  getCameraHlsUrl,
  getCameraMjpegUrl,
  getCameraPosterUrl,
  useHA,
  type CameraCapabilities,
} from "@casaboard/ha";
import { clientLogger } from "@repo/lib";
import {
  startWebRtcStream,
  type WebRtcStreamHandle,
} from "./startWebRtcStream";

export type CameraStreamMode = "webrtc" | "hls" | "mjpeg" | "idle";

export interface UseCameraStreamOptions {
  entityId: string;
  enabled: boolean;
  supportedFeatures?: number;
  /**
   * Camera entity `attributes.access_token` for `/api/camera_proxy*` URLs.
   * Required for posters/MJPEG (Lovelace uses this, not the user OAuth token).
   */
  entityAccessToken?: string | null;
  /** Skip IntersectionObserver and treat the player as always on-screen (e.g. modal). */
  forceVisible?: boolean;
}

/** Keep streams warm briefly when scrolling away to avoid full renegotiation. */
const HIDE_TEARDOWN_MS = 2500;
const VIDEO_READY_TIMEOUT_MS = 2000;
/** How long to wait for WebRTC to produce decodeable frames before falling back. */
const WEBRTC_FRAME_TIMEOUT_MS = 5000;

async function waitForVideoElement(
  getVideo: () => HTMLVideoElement | null,
  signal: AbortSignal,
  timeoutMs = VIDEO_READY_TIMEOUT_MS
): Promise<HTMLVideoElement> {
  const started = Date.now();
  while (!signal.aborted) {
    const video = getVideo();
    if (video) return video;
    if (Date.now() - started > timeoutMs) {
      throw new Error("Video element not ready");
    }
    await new Promise<void>((resolve) => {
      requestAnimationFrame(() => resolve());
    });
  }
  throw new Error("Stream start cancelled");
}

/** Resolve once the element has real video frames, else reject. */
async function waitForVideoFrames(
  video: HTMLVideoElement,
  signal: AbortSignal,
  timeoutMs = WEBRTC_FRAME_TIMEOUT_MS
): Promise<void> {
  const started = Date.now();
  while (!signal.aborted) {
    if (video.videoWidth > 0 && video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
      return;
    }
    if (Date.now() - started > timeoutMs) {
      throw new Error("WebRTC produced no video frames");
    }
    await new Promise<void>((resolve) => {
      window.setTimeout(() => resolve(), 100);
    });
  }
  throw new Error("Stream start cancelled");
}

export function useCameraStream({
  entityId,
  enabled,
  supportedFeatures,
  entityAccessToken,
  forceVisible = false,
}: UseCameraStreamOptions) {
  const { connection, auth, hassUrl } = useHA();
  const [containerEl, setContainerEl] = useState<HTMLDivElement | null>(null);
  const videoElRef = useRef<HTMLVideoElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const webrtcRef = useRef<WebRtcStreamHandle | null>(null);
  const accessTokenRef = useRef<string | null>(null);
  const [isVisible, setIsVisible] = useState(forceVisible);
  const [mode, setMode] = useState<CameraStreamMode>("idle");
  const [mjpegUrl, setMjpegUrl] = useState<string | null>(null);
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const containerRef = useCallback((node: HTMLDivElement | null) => {
    setContainerEl(node);
  }, []);

  const attachActiveStream = useCallback((video: HTMLVideoElement) => {
    if (webrtcRef.current) {
      webrtcRef.current.attach(video);
      return;
    }
    if (hlsRef.current) {
      hlsRef.current.attachMedia(video);
      return;
    }
  }, []);

  const videoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoElRef.current = node;
      if (node) attachActiveStream(node);
    },
    [attachActiveStream]
  );

  const teardown = useCallback(() => {
    if (webrtcRef.current) {
      webrtcRef.current.destroy();
      webrtcRef.current = null;
    }
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    const video = videoElRef.current;
    if (video) {
      video.srcObject = null;
      video.removeAttribute("src");
      video.load();
    }
    setMjpegUrl(null);
    setMode("idle");
    setLoading(false);
  }, []);

  useEffect(() => {
    if (forceVisible) {
      setIsVisible(true);
      return;
    }
    if (!containerEl) return;

    let hideTimer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          if (hideTimer !== undefined) {
            window.clearTimeout(hideTimer);
            hideTimer = undefined;
          }
          setIsVisible(true);
          return;
        }
        if (hideTimer !== undefined) return;
        hideTimer = window.setTimeout(() => {
          hideTimer = undefined;
          setIsVisible(false);
        }, HIDE_TEARDOWN_MS);
      },
      { threshold: 0.05, rootMargin: "120px 0px" }
    );
    observer.observe(containerEl);
    return () => {
      if (hideTimer !== undefined) window.clearTimeout(hideTimer);
      observer.disconnect();
    };
  }, [containerEl, forceVisible]);

  const shouldStream = enabled && (forceVisible || isVisible);

  useEffect(() => {
    const abort = new AbortController();

    const proxyToken = entityAccessToken?.trim() || null;

    const startHls = async (
      conn: Connection,
      urlBase: string,
      bearerToken: string,
      video: HTMLVideoElement
    ) => {
      const playlistUrl = await getCameraHlsUrl(conn, urlBase, entityId);
      if (abort.signal.aborted) return;

      if (Hls.isSupported()) {
        const hls = new Hls({
          lowLatencyMode: true,
          maxBufferLength: 6,
          maxMaxBufferLength: 12,
          liveSyncDurationCount: 1,
          enableWorker: true,
          xhrSetup: (xhr) => {
            const latest = accessTokenRef.current ?? bearerToken;
            xhr.setRequestHeader("Authorization", `Bearer ${latest}`);
          },
        });
        hlsRef.current = hls;
        hls.loadSource(playlistUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          void video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (_event, data) => {
          if (!data.fatal || abort.signal.aborted) return;
          clientLogger.error("useCameraStream", "HLS fatal error", data);
          hls.destroy();
          hlsRef.current = null;
          if (proxyToken) {
            setMjpegUrl(getCameraMjpegUrl(urlBase, entityId, proxyToken));
            setMode("mjpeg");
          } else {
            setError("Camera stream failed");
            setMode("idle");
          }
        });
        setMode("hls");
        return;
      }

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        const nativeUrl = new URL(playlistUrl);
        nativeUrl.searchParams.set("token", bearerToken);
        video.src = nativeUrl.toString();
        void video.play().catch(() => {});
        setMode("hls");
        return;
      }

      if (proxyToken) {
        setMjpegUrl(getCameraMjpegUrl(urlBase, entityId, proxyToken));
        setMode("mjpeg");
        return;
      }
      throw new Error("No playable camera stream");
    };

    const start = async () => {
      if (!shouldStream || !entityId || !connection || !auth || !hassUrl) {
        teardown();
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const [bearerToken, caps] = await Promise.all([
          ensureFreshAccessToken(auth),
          getCameraCapabilities(connection, entityId).catch(
            () => null as CameraCapabilities | null
          ),
        ]);
        if (abort.signal.aborted) return;

        accessTokenRef.current = bearerToken;
        if (proxyToken) {
          setPosterUrl(getCameraPosterUrl(hassUrl, entityId, proxyToken));
        } else {
          setPosterUrl(null);
        }

        const video = await waitForVideoElement(
          () => videoElRef.current,
          abort.signal
        );
        if (abort.signal.aborted) return;

        const preferWebRtc = cameraSupportsWebRtc(caps);
        const canHls = cameraSupportsHls(caps, supportedFeatures);

        if (preferWebRtc) {
          try {
            const handle = await startWebRtcStream(connection, entityId, {
              signal: abort.signal,
            });
            if (abort.signal.aborted) {
              handle.destroy();
              return;
            }
            webrtcRef.current = handle;
            handle.attach(video);
            setMode("webrtc");
            // Lovelace races streams and checks hasVideo; we verify frames
            // and fall back if WebRTC connects without a decodeable picture.
            await waitForVideoFrames(video, abort.signal);
            if (abort.signal.aborted) return;
            return;
          } catch (err) {
            if (abort.signal.aborted) return;
            clientLogger.error(
              "useCameraStream",
              "WebRTC failed, falling back",
              err
            );
            if (webrtcRef.current) {
              webrtcRef.current.destroy();
              webrtcRef.current = null;
            }
            video.srcObject = null;
            setMode("idle");
          }
        }

        if (canHls) {
          await startHls(connection, hassUrl, bearerToken, video);
          return;
        }

        if (proxyToken) {
          setMjpegUrl(getCameraMjpegUrl(hassUrl, entityId, proxyToken));
          setMode("mjpeg");
          return;
        }

        throw new Error("No playable camera stream");
      } catch (err) {
        if (abort.signal.aborted) return;
        const message =
          err instanceof Error ? err.message : "Failed to start camera stream";
        clientLogger.error("useCameraStream", message, err);
        setError(message);
        teardown();
      } finally {
        if (!abort.signal.aborted) setLoading(false);
      }
    };

    void start();

    return () => {
      abort.abort();
      teardown();
    };
  }, [
    shouldStream,
    entityId,
    connection,
    auth,
    hassUrl,
    supportedFeatures,
    entityAccessToken,
    teardown,
  ]);

  // Refresh bearer token periodically for long-lived HLS segment fetches.
  useEffect(() => {
    if (!shouldStream || !auth || mode !== "hls") return;
    const id = window.setInterval(() => {
      void ensureFreshAccessToken(auth)
        .then((token) => {
          accessTokenRef.current = token;
        })
        .catch(() => {});
    }, 60_000);
    return () => window.clearInterval(id);
  }, [shouldStream, auth, mode]);

  return {
    containerRef,
    videoRef,
    mode,
    mjpegUrl,
    posterUrl,
    error,
    loading,
    isVisible: forceVisible || isVisible,
  };
}
