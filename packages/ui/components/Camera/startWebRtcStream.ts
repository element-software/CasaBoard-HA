import type { Connection } from "home-assistant-js-websocket";
import {
  addWebRtcCandidate,
  getWebRtcClientConfiguration,
  subscribeWebRtcOffer,
  type WebRtcOfferEvent,
} from "@casaboard/ha";

const WEBRTC_START_TIMEOUT_MS = 20_000;

export interface WebRtcStreamHandle {
  peerConnection: RTCPeerConnection;
  remoteStream: MediaStream;
  attach: (video: HTMLVideoElement) => void;
  destroy: () => void;
}

/**
 * Negotiate a WebRTC camera stream via Home Assistant signaling and resolve
 * once the first media track is available for playback.
 */
export async function startWebRtcStream(
  connection: Connection,
  entityId: string,
  options?: { signal?: AbortSignal }
): Promise<WebRtcStreamHandle> {
  const signal = options?.signal;
  if (typeof RTCPeerConnection === "undefined") {
    throw new Error("WebRTC is not supported in this browser");
  }
  if (signal?.aborted) {
    throw new Error("WebRTC start cancelled");
  }

  const clientConfig = await getWebRtcClientConfiguration(connection, entityId);
  if (signal?.aborted) {
    throw new Error("WebRTC start cancelled");
  }

  const peerConnection = new RTCPeerConnection(clientConfig.configuration);
  const remoteStream = new MediaStream();
  const pendingLocalCandidates: RTCIceCandidate[] = [];
  let sessionId: string | undefined;
  let unsub: (() => void) | undefined;
  let settled = false;

  const destroy = () => {
    unsub?.();
    unsub = undefined;
    sessionId = undefined;
    pendingLocalCandidates.length = 0;
    remoteStream.getTracks().forEach((track) => track.stop());
    peerConnection.onnegotiationneeded = null;
    peerConnection.onicecandidate = null;
    peerConnection.oniceconnectionstatechange = null;
    peerConnection.ontrack = null;
    if (peerConnection.signalingState !== "closed") {
      peerConnection.close();
    }
  };

  return new Promise<WebRtcStreamHandle>((resolve, reject) => {
    const settle = (fn: () => void) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      signal?.removeEventListener("abort", onAbort);
      fn();
    };

    const fail = (message: string) => {
      settle(() => {
        destroy();
        reject(new Error(message));
      });
    };

    const onAbort = () => fail("WebRTC start cancelled");
    signal?.addEventListener("abort", onAbort, { once: true });

    const timeoutId = window.setTimeout(() => {
      fail("WebRTC connection timed out");
    }, WEBRTC_START_TIMEOUT_MS);

    if (clientConfig.dataChannel) {
      // Some cameras (e.g. Nest) require a data channel to establish a stream.
      peerConnection.createDataChannel(clientConfig.dataChannel);
    }

    peerConnection.ontrack = (event) => {
      remoteStream.addTrack(event.track);
      // Match Lovelace: only treat the session as ready once a video track
      // exists. Resolving on the first (often audio) track leaves a black tile.
      if (remoteStream.getVideoTracks().length === 0) return;
      settle(() => {
        resolve({
          peerConnection,
          remoteStream,
          attach: (video: HTMLVideoElement) => {
            video.srcObject = remoteStream;
            void video.play().catch(() => {});
          },
          destroy,
        });
      });
    };

    peerConnection.oniceconnectionstatechange = () => {
      if (peerConnection.iceConnectionState === "failed") {
        peerConnection.restartIce();
      }
    };

    peerConnection.onicecandidate = (event) => {
      if (!event.candidate?.candidate) return;
      if (sessionId) {
        void addWebRtcCandidate(
          connection,
          entityId,
          sessionId,
          event.candidate.toJSON()
        ).catch(() => {});
      } else {
        pendingLocalCandidates.push(event.candidate);
      }
    };

    const handleOfferEvent = (event: WebRtcOfferEvent) => {
      if (signal?.aborted) return;

      if (event.type === "session") {
        sessionId = event.session_id;
        for (const candidate of pendingLocalCandidates.splice(0)) {
          void addWebRtcCandidate(
            connection,
            entityId,
            event.session_id,
            candidate.toJSON()
          ).catch(() => {});
        }
        return;
      }

      if (event.type === "answer") {
        if (
          !peerConnection.signalingState ||
          peerConnection.signalingState === "stable" ||
          peerConnection.signalingState === "closed"
        ) {
          return;
        }
        void peerConnection
          .setRemoteDescription({
            type: "answer",
            sdp: event.answer,
          })
          .catch((err: unknown) => {
            fail(
              err instanceof Error
                ? err.message
                : "Failed to connect WebRTC stream"
            );
          });
        return;
      }

      if (event.type === "candidate") {
        const init =
          event.candidate.sdpMid || event.candidate.sdpMLineIndex != null
            ? event.candidate
            : { candidate: event.candidate.candidate, sdpMid: "0" };
        void peerConnection.addIceCandidate(init).catch(() => {});
        return;
      }

      if (event.type === "error") {
        fail(event.message || "WebRTC offer failed");
      }
    };

    peerConnection.onnegotiationneeded = () => {
      void (async () => {
        try {
          const offer = await peerConnection.createOffer({
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,
          });
          if (signal?.aborted) return;
          await peerConnection.setLocalDescription(offer);
          if (signal?.aborted) return;

          // Embed any ICE candidates gathered during setLocalDescription (HA frontend pattern).
          let candidates = "";
          for (const candidate of pendingLocalCandidates.splice(0)) {
            candidates += `a=${candidate.candidate}\r\n`;
          }

          const offerSdp = `${offer.sdp ?? ""}${candidates}`;
          unsub = await subscribeWebRtcOffer(
            connection,
            entityId,
            offerSdp,
            handleOfferEvent
          );
        } catch (err) {
          fail(
            err instanceof Error ? err.message : "Failed to start WebRTC stream"
          );
        }
      })();
    };

    peerConnection.addTransceiver("audio", { direction: "recvonly" });
    peerConnection.addTransceiver("video", { direction: "recvonly" });
  });
}
