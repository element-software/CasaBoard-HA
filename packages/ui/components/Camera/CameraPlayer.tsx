"use client";

import type { Ref } from "react";
import Icon from "@mdi/react";
import { mdiCamera, mdiVolumeHigh, mdiVolumeOff } from "@mdi/js";
import { Button } from "@heroui/react";
import type { CameraStreamMode } from "./useCameraStream";

export interface CameraPlayerProps {
  name: string;
  showName?: boolean;
  mode: CameraStreamMode;
  mjpegUrl: string | null;
  posterUrl: string | null;
  error: string | null;
  showConnecting: boolean;
  muted: boolean;
  canToggleAudio: boolean;
  onToggleMute?: () => void;
  containerRef?: Ref<HTMLDivElement>;
  videoRef?: Ref<HTMLVideoElement>;
  className?: string;
  videoClassName?: string;
  objectFit?: "cover" | "contain";
}

function isVideoMode(mode: CameraStreamMode): boolean {
  return mode === "hls" || mode === "webrtc";
}

export function CameraPlayer({
  name,
  showName = true,
  mode,
  mjpegUrl,
  posterUrl,
  error,
  showConnecting,
  muted,
  canToggleAudio,
  onToggleMute,
  containerRef,
  videoRef,
  className = "",
  videoClassName = "",
  objectFit = "cover",
}: CameraPlayerProps) {
  const fitClass = objectFit === "contain" ? "object-contain" : "object-cover";

  return (
    <div ref={containerRef} className={`relative h-full w-full bg-black ${className}`}>
      <video
        ref={videoRef}
        className={
          isVideoMode(mode)
            ? `absolute inset-0 h-full w-full ${fitClass} ${videoClassName}`
            : "hidden"
        }
        playsInline
        autoPlay
        muted={muted}
        poster={posterUrl ?? undefined}
        controls={false}
      />

      {mode === "mjpeg" && mjpegUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={mjpegUrl}
          alt={name}
          className={`absolute inset-0 h-full w-full ${fitClass}`}
          draggable={false}
        />
      )}

      {showConnecting && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-white/70">
          {posterUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={posterUrl}
              alt=""
              className={`absolute inset-0 h-full w-full ${fitClass} opacity-60`}
              draggable={false}
            />
          ) : null}
          <span className="relative z-10 text-sm">Connecting…</span>
        </div>
      )}

      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-black/70 p-4 text-center text-red-300">
          <Icon path={mdiCamera} className="h-8 w-8 opacity-70" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/70 to-transparent p-3">
        {showName ? (
          <span className="truncate text-sm font-medium text-white drop-shadow">
            {name}
          </span>
        ) : (
          <span />
        )}
        {canToggleAudio && (
          <Button
            isIconOnly
            size="sm"
            variant="flat"
            className="pointer-events-auto bg-black/40 text-white"
            aria-label={muted ? "Unmute camera audio" : "Mute camera audio"}
            onPress={onToggleMute}
          >
            <Icon
              path={muted ? mdiVolumeOff : mdiVolumeHigh}
              className="h-5 w-5"
            />
          </Button>
        )}
      </div>
    </div>
  );
}
