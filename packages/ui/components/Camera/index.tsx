"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Icon from "@mdi/react";
import { mdiCamera } from "@mdi/js";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  Skeleton,
} from "@heroui/react";
import { useEntity } from "@casaboard/ha";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";
import { CardShell } from "../Shared/Card";
import { CameraPlayer } from "./CameraPlayer";
import { useCameraStream } from "./useCameraStream";

export interface CameraProps {
  entityId: string;
  audioEnabled?: boolean;
  showName?: boolean;
  /** Fill the parent (for CCTV grid cells) instead of using a fixed min-height. */
  fill?: boolean;
  [key: string]: unknown;
}

export const Camera = ({
  entityId,
  audioEnabled = false,
  showName = true,
  fill = false,
}: CameraProps) => {
  const entity = useEntity(entityId);
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);
  const [muted, setMuted] = useState(true);
  const [expanded, setExpanded] = useState(false);
  const videoNodeRef = useRef<HTMLVideoElement | null>(null);

  const supportedFeatures =
    typeof entity?.attributes?.supported_features === "number"
      ? entity.attributes.supported_features
      : undefined;

  const entityAccessToken =
    typeof entity?.attributes?.access_token === "string"
      ? entity.attributes.access_token
      : null;

  // One live stream for card + modal; video remount reattaches without renegotiating.
  const stream = useCameraStream({
    entityId,
    enabled: isEntityReady,
    supportedFeatures,
    entityAccessToken,
    forceVisible: expanded,
  });

  const showConnecting =
    isEntityReady &&
    !stream.error &&
    (stream.loading || (stream.mode === "idle" && stream.isVisible));

  const canToggleAudio =
    audioEnabled && (stream.mode === "hls" || stream.mode === "webrtc");

  useEffect(() => {
    const video = videoNodeRef.current;
    if (!video) return;
    video.muted = muted || !audioEnabled;
  }, [muted, audioEnabled, stream.mode, expanded]);

  useEffect(() => {
    if (!audioEnabled) setMuted(true);
  }, [audioEnabled]);

  const setVideoRef = useCallback(
    (node: HTMLVideoElement | null) => {
      videoNodeRef.current = node;
      stream.videoRef(node);
    },
    [stream.videoRef]
  );

  const sizeClass = fill ? "h-full min-h-0" : "min-h-[160px]";

  if (!entityId) {
    return (
      <div
        className={
          fill
            ? "flex h-full w-full flex-col items-center justify-center gap-1 bg-neutral-950 text-white/35"
            : "p-4 border-2 border-dashed border-theme-border rounded-xl text-center text-theme-text-muted"
        }
      >
        <Icon
          path={mdiCamera}
          className={fill ? "h-6 w-6 opacity-40" : "h-12 w-12 mx-auto mb-2 opacity-40"}
        />
        {!fill && <span>Configure Camera Entity</span>}
      </div>
    );
  }

  const name =
    entity?.attributes?.friendly_name || entityId.replace(/^camera\./, "");

  const player = (
    <CameraPlayer
      name={name}
      showName={showName && !expanded}
      mode={stream.mode}
      mjpegUrl={stream.mjpegUrl}
      posterUrl={stream.posterUrl}
      error={stream.error}
      showConnecting={
        expanded
          ? !stream.error && (stream.loading || stream.mode === "idle")
          : showConnecting
      }
      muted={muted || !audioEnabled}
      canToggleAudio={canToggleAudio}
      onToggleMute={() => setMuted((m) => !m)}
      videoRef={setVideoRef}
      objectFit={expanded ? "contain" : "cover"}
    />
  );

  return (
    <>
      <Skeleton
        isLoaded={isLoaded}
        className={`flex h-full w-full flex-col ${fill ? "" : "rounded-xl"}`}
        classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
      >
        {showNotAvailable ? (
          <CardShell status="unavailable" className={`relative bg-black ${sizeClass}`}>
            <div
              className={`flex h-full flex-col items-center justify-center gap-1 p-2 text-theme-text-muted ${sizeClass}`}
            >
              <Icon path={mdiCamera} className="h-6 w-6 opacity-50" />
              {!fill && <span className="text-sm">{entityId}</span>}
              <span className="text-xs">Unavailable</span>
            </div>
          </CardShell>
        ) : (
          <CardShell
            status="on"
            domain="camera"
            interactive
            className={`relative bg-black ${sizeClass}`}
            onClick={(e) => {
              if ((e.target as HTMLElement).closest("button")) return;
              setExpanded(true);
            }}
          >
            {/* Keep observer target on the card so expand/collapse doesn't reset visibility. */}
            <div
              ref={stream.containerRef}
              className={`relative h-full w-full ${sizeClass}`}
            >
              {expanded ? (
                <div className={`relative h-full w-full bg-black ${sizeClass}`}>
                  {stream.posterUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={stream.posterUrl}
                      alt={name}
                      className="absolute inset-0 h-full w-full object-cover opacity-80"
                      draggable={false}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-white/50 text-sm">
                      Expanded
                    </div>
                  )}
                  {showName && (
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-3">
                      <span className="truncate text-sm font-medium text-white drop-shadow">
                        {name}
                      </span>
                    </div>
                  )}
                </div>
              ) : (
                player
              )}
            </div>
          </CardShell>
        )}
      </Skeleton>

      <Modal
        isOpen={expanded}
        onClose={() => setExpanded(false)}
        size="5xl"
        backdrop="blur"
        classNames={{
          base: "bg-black text-white max-w-[min(96vw,1200px)]",
          body: "p-0",
          header: "border-b border-white/10",
          closeButton: "text-white hover:bg-white/10",
        }}
      >
        <ModalContent>
          <ModalHeader className="flex items-center gap-2 text-base font-medium">
            <Icon path={mdiCamera} className="h-5 w-5 opacity-80" />
            {name}
          </ModalHeader>
          <ModalBody>
            <div className="relative aspect-video w-full max-h-[80vh] bg-black">
              {expanded ? player : null}
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default Camera;
