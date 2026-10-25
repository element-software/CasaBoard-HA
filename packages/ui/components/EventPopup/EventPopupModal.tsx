"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiCamera, mdiCameraOff } from "@mdi/js";
import { Modal, ModalBody, ModalContent, ModalHeader } from "@heroui/react";
import { useEntity } from "@casaboard/ha";
import type { EventPopupRule } from "@repo/types/eventPopup";
import { CameraPlayer } from "../Camera/CameraPlayer";
import { useCameraStream } from "../Camera/useCameraStream";

/** How often the snapshot fallback refreshes when live streaming fails. */
const SNAPSHOT_REFRESH_MS = 5000;

export interface EventPopupModalProps {
  rule: EventPopupRule;
  firedAt: number;
  onClose: () => void;
}

function withCacheBust(url: string, tick: number): string {
  const next = new URL(url);
  next.searchParams.set("_", String(tick));
  return next.toString();
}

/** Shrinking bar for the auto-close timeout; remount (key) to restart. */
function CountdownBar({ seconds }: { seconds: number }) {
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => setStarted(true));
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div className="h-0.5 w-full bg-white/10">
      <div
        className="h-full bg-white/60"
        style={{
          width: started ? "0%" : "100%",
          transition: started ? `width ${seconds}s linear` : "none",
        }}
      />
    </div>
  );
}

export function EventPopupModal({ rule, firedAt, onClose }: EventPopupModalProps) {
  const camera = useEntity(rule.cameraEntityId);
  const cameraUnavailable = !camera || camera.state === "unavailable";
  const [muted, setMuted] = useState(true);
  const [snapshotTick, setSnapshotTick] = useState(0);
  const videoNodeRef = useRef<HTMLVideoElement | null>(null);

  const supportedFeatures =
    typeof camera?.attributes?.supported_features === "number"
      ? camera.attributes.supported_features
      : undefined;

  const entityAccessToken =
    typeof camera?.attributes?.access_token === "string"
      ? camera.attributes.access_token
      : null;

  const stream = useCameraStream({
    entityId: rule.cameraEntityId,
    enabled: !cameraUnavailable,
    supportedFeatures,
    entityAccessToken,
    forceVisible: true,
  });

  const allowAudio = Boolean(rule.allowAudio);
  const canToggleAudio =
    allowAudio && (stream.mode === "hls" || stream.mode === "webrtc");
  const showSnapshotFallback = Boolean(stream.error && stream.posterUrl);

  useEffect(() => {
    const video = videoNodeRef.current;
    if (video) video.muted = muted || !allowAudio;
  }, [muted, allowAudio, stream.mode]);

  useEffect(() => {
    if (!showSnapshotFallback) return;
    const id = window.setInterval(
      () => setSnapshotTick((t) => t + 1),
      SNAPSHOT_REFRESH_MS
    );
    return () => window.clearInterval(id);
  }, [showSnapshotFallback]);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoNodeRef.current = node;
      stream.videoRef(node);
    },
    [stream.videoRef]
  );

  const cameraName =
    camera?.attributes?.friendly_name ||
    rule.cameraEntityId.replace(/^camera\./, "");
  const title = rule.name?.trim() || cameraName;
  const autoCloseSeconds = Math.max(0, Number(rule.autoCloseSeconds) || 0);

  let media;
  if (cameraUnavailable) {
    media = (
      <div className="flex h-full flex-col items-center justify-center gap-2 text-white/50">
        <Icon path={mdiCameraOff} className="h-10 w-10" />
        <span className="text-sm">Camera unavailable</span>
      </div>
    );
  } else if (showSnapshotFallback && stream.posterUrl) {
    media = (
      <>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={withCacheBust(stream.posterUrl, snapshotTick)}
          alt={cameraName}
          className="absolute inset-0 h-full w-full object-contain"
          draggable={false}
        />
        <div className="absolute left-3 top-3 rounded-md bg-black/60 px-2 py-1 text-xs text-white/80">
          Live stream unavailable — showing snapshot
        </div>
      </>
    );
  } else {
    media = (
      <CameraPlayer
        name={cameraName}
        showName={false}
        mode={stream.mode}
        mjpegUrl={stream.mjpegUrl}
        posterUrl={stream.posterUrl}
        error={stream.error}
        showConnecting={
          !stream.error && (stream.loading || stream.mode === "idle")
        }
        muted={muted || !allowAudio}
        canToggleAudio={canToggleAudio}
        onToggleMute={() => setMuted((m) => !m)}
        videoRef={setVideoRef}
        objectFit="contain"
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={onClose}
      size="5xl"
      backdrop="blur"
      placement="center"
      classNames={{
        base: "bg-black text-white max-w-[min(96vw,1200px)] overflow-hidden",
        body: "p-0",
        header: "border-b border-white/10",
        closeButton: "text-white/80 hover:bg-white/10",
      }}
    >
      <ModalContent>
        <ModalHeader className="flex items-center gap-2 text-base font-medium">
          <Icon path={mdiCamera} className="h-5 w-5 opacity-80" />
          {title}
        </ModalHeader>
        <ModalBody>
          <div
            ref={stream.containerRef}
            className="relative aspect-video w-full max-h-[80vh] bg-black"
          >
            {media}
          </div>
          {autoCloseSeconds > 0 && (
            <CountdownBar key={firedAt} seconds={autoCloseSeconds} />
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
