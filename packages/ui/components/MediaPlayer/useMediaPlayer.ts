"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { joinHassUrl, useHA } from "@casaboard/ha";
import { useDebouncedSlider } from "@repo/hooks/useDebounce";

/** Home Assistant MediaPlayerEntityFeature bits */
const SUPPORT_PAUSE = 1;
const SUPPORT_SEEK = 2;
const SUPPORT_VOLUME_SET = 4;
const SUPPORT_VOLUME_MUTE = 8;
const SUPPORT_PREVIOUS_TRACK = 16;
const SUPPORT_NEXT_TRACK = 32;
const SUPPORT_TURN_ON = 128;
const SUPPORT_TURN_OFF = 256;
const SUPPORT_VOLUME_STEP = 1024;
const SUPPORT_SELECT_SOURCE = 2048;
const SUPPORT_STOP = 4096;
const SUPPORT_PLAY = 16384;
const SUPPORT_SHUFFLE_SET = 32768;
const SUPPORT_SELECT_SOUND_MODE = 65536;
const SUPPORT_REPEAT_SET = 262144;

const ACTIVE_STATES = new Set([
  "playing",
  "paused",
  "buffering",
  "on",
]);

export type MediaRepeatMode = "off" | "all" | "one";

function supportsFeature(entity: any, bit: number): boolean {
  const features = entity?.attributes?.supported_features ?? 0;
  return (features & bit) === bit;
}

function formatStateLabel(state: string | undefined): string {
  if (!state) return "Unknown";
  switch (state) {
    case "playing":
      return "Playing";
    case "paused":
      return "Paused";
    case "buffering":
      return "Buffering";
    case "idle":
      return "Idle";
    case "off":
      return "Off";
    case "standby":
      return "Standby";
    case "unavailable":
      return "Unavailable";
    default:
      return state.charAt(0).toUpperCase() + state.slice(1);
  }
}

export function formatMediaTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
  const total = Math.floor(seconds);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) {
    return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  return `${m}:${String(s).padStart(2, "0")}`;
}

/** Live media position accounting for media_position_updated_at while playing. */
export function getMediaPosition(entity: any, nowMs = Date.now()): number {
  const pos = entity?.attributes?.media_position;
  if (typeof pos !== "number") return 0;
  const updated = entity?.attributes?.media_position_updated_at;
  if (!updated || entity?.state !== "playing") return Math.max(0, pos);
  const updatedMs = new Date(updated).getTime();
  if (Number.isNaN(updatedMs)) return Math.max(0, pos);
  return Math.max(0, pos + (nowMs - updatedMs) / 1000);
}

export function resolveMediaArtworkUrl(
  hassUrl: string | null,
  entity: any,
  accessToken?: string | null
): string | null {
  const raw =
    entity?.attributes?.entity_picture ||
    entity?.attributes?.media_image_url ||
    null;
  if (!raw || typeof raw !== "string") return null;
  if (raw.startsWith("data:")) return raw;
  if (!hassUrl) {
    if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;
    return null;
  }
  const url = joinHassUrl(hassUrl, raw);
  if (accessToken && url.includes("/api/") && !/[?&](?:token|auth)=/.test(url)) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}auth=${encodeURIComponent(accessToken)}`;
  }
  return url;
}

export function useMediaPlayer(entity: any, entityId: string) {
  const { hassUrl, auth } = useHA();
  const state = entity?.state as string | undefined;
  const isActive = ACTIVE_STATES.has(state ?? "");
  const isPlaying = state === "playing" || state === "buffering";
  const isOff = state === "off" || state === "standby";

  const volumeLevel =
    typeof entity?.attributes?.volume_level === "number"
      ? entity.attributes.volume_level
      : 0;
  const volumePercentage = Math.round(volumeLevel * 100);
  const isMuted = !!entity?.attributes?.is_volume_muted;

  const duration =
    typeof entity?.attributes?.media_duration === "number"
      ? entity.attributes.media_duration
      : 0;

  const [livePosition, setLivePosition] = useState(0);

  useEffect(() => {
    const tick = () => setLivePosition(getMediaPosition(entity));
    tick();
    if (state !== "playing") return;
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [
    entity,
    state,
    entity?.attributes?.media_position,
    entity?.attributes?.media_position_updated_at,
  ]);

  const sourceList: string[] = Array.isArray(entity?.attributes?.source_list)
    ? entity.attributes.source_list
    : [];
  const currentSource =
    typeof entity?.attributes?.source === "string"
      ? entity.attributes.source
      : "";

  const soundModeList: string[] = Array.isArray(
    entity?.attributes?.sound_mode_list
  )
    ? entity.attributes.sound_mode_list
    : [];
  const currentSoundMode =
    typeof entity?.attributes?.sound_mode === "string"
      ? entity.attributes.sound_mode
      : "";

  const shuffle = !!entity?.attributes?.shuffle;
  const repeat = (entity?.attributes?.repeat as MediaRepeatMode) || "off";

  const canPlay = supportsFeature(entity, SUPPORT_PLAY);
  const canPause = supportsFeature(entity, SUPPORT_PAUSE);
  const canPlayPause = canPlay || canPause;
  const canVolumeSet = supportsFeature(entity, SUPPORT_VOLUME_SET);
  const canVolumeStep = supportsFeature(entity, SUPPORT_VOLUME_STEP);
  const canMute = supportsFeature(entity, SUPPORT_VOLUME_MUTE);
  const canTurnOn = supportsFeature(entity, SUPPORT_TURN_ON);
  const canTurnOff = supportsFeature(entity, SUPPORT_TURN_OFF);
  const canPower = true;
  const canSeek =
    supportsFeature(entity, SUPPORT_SEEK) && duration > 0;
  const canPrevious = supportsFeature(entity, SUPPORT_PREVIOUS_TRACK);
  const canNext = supportsFeature(entity, SUPPORT_NEXT_TRACK);
  const canStop = supportsFeature(entity, SUPPORT_STOP);
  const canSelectSource =
    supportsFeature(entity, SUPPORT_SELECT_SOURCE) && sourceList.length > 0;
  const canSelectSoundMode =
    supportsFeature(entity, SUPPORT_SELECT_SOUND_MODE) &&
    soundModeList.length > 0;
  const canShuffle = supportsFeature(entity, SUPPORT_SHUFFLE_SET);
  const canRepeat = supportsFeature(entity, SUPPORT_REPEAT_SET);

  const name =
    entity?.attributes?.friendly_name || entity?.entity_id || entityId;

  const mediaTitle =
    (entity?.attributes?.media_title as string | undefined) || "";
  const mediaArtist =
    (entity?.attributes?.media_artist as string | undefined) || "";
  const appName = (entity?.attributes?.app_name as string | undefined) || "";

  const nowPlaying = useMemo(() => {
    if (mediaTitle && mediaArtist) return `${mediaTitle} · ${mediaArtist}`;
    if (mediaTitle) return mediaTitle;
    if (appName) return appName;
    return formatStateLabel(state);
  }, [mediaTitle, mediaArtist, appName, state]);

  const artworkUrl = useMemo(
    () => resolveMediaArtworkUrl(hassUrl, entity, auth?.accessToken),
    [hassUrl, entity, auth?.accessToken]
  );

  const handlePower = useCallback(() => {
    if (!entity) return;
    if (isOff || state === "idle") {
      if (canTurnOn) entity.turn_on?.();
      else entity.toggle?.();
    } else if (canTurnOff) {
      entity.turn_off?.();
    } else {
      entity.toggle?.();
    }
  }, [entity, isOff, state, canTurnOn, canTurnOff]);

  const handlePlayPause = useCallback(() => {
    if (!entity) return;
    if (isPlaying && canPause) {
      entity.media_pause?.();
    } else if (!isPlaying && canPlay) {
      entity.media_play?.();
    } else {
      entity.media_play_pause?.();
    }
  }, [entity, isPlaying, canPause, canPlay]);

  const handleStop = useCallback(() => {
    entity?.media_stop?.();
  }, [entity]);

  const handlePrevious = useCallback(() => {
    entity?.media_previous_track?.();
  }, [entity]);

  const handleNext = useCallback(() => {
    entity?.media_next_track?.();
  }, [entity]);

  const setVolumeImmediate = useCallback(
    (percent: number) => {
      const level = Math.max(0, Math.min(100, percent)) / 100;
      entity?.volume_set?.({ volume_level: level });
    },
    [entity]
  );

  const debouncedSetVolume = useDebouncedSlider(setVolumeImmediate, 150);

  const handleVolumeChange = useCallback(
    (percent: number) => {
      debouncedSetVolume(percent);
    },
    [debouncedSetVolume]
  );

  const handleVolumeUp = useCallback(() => {
    entity?.volume_up?.();
  }, [entity]);

  const handleVolumeDown = useCallback(() => {
    entity?.volume_down?.();
  }, [entity]);

  const handleMuteToggle = useCallback(() => {
    entity?.volume_mute?.({ is_volume_muted: !isMuted });
  }, [entity, isMuted]);

  const handleSeek = useCallback(
    (seconds: number) => {
      const clamped = Math.max(0, Math.min(duration || seconds, seconds));
      setLivePosition(clamped);
      entity?.media_seek?.({ seek_position: clamped });
    },
    [entity, duration]
  );

  const handleSelectSource = useCallback(
    (source: string) => {
      if (!source) return;
      entity?.select_source?.({ source });
    },
    [entity]
  );

  const handleSelectSoundMode = useCallback(
    (soundMode: string) => {
      if (!soundMode) return;
      entity?.select_sound_mode?.({ sound_mode: soundMode });
    },
    [entity]
  );

  const handleShuffleToggle = useCallback(() => {
    entity?.shuffle_set?.({ shuffle: !shuffle });
  }, [entity, shuffle]);

  const handleRepeatCycle = useCallback(() => {
    const order: MediaRepeatMode[] = ["off", "all", "one"];
    const idx = order.indexOf(repeat);
    const next = order[(idx + 1) % order.length] ?? "off";
    entity?.repeat_set?.({ repeat: next });
  }, [entity, repeat]);

  return {
    name,
    nowPlaying,
    mediaTitle,
    mediaArtist,
    appName,
    stateLabel: formatStateLabel(state),
    artworkUrl,
    isActive,
    isPlaying,
    isOff,
    isMuted,
    volumePercentage,
    duration,
    position: livePosition,
    sourceList,
    currentSource,
    soundModeList,
    currentSoundMode,
    shuffle,
    repeat,
    canPlayPause,
    canVolumeSet,
    canVolumeStep,
    canMute,
    canPower,
    canSeek,
    canPrevious,
    canNext,
    canStop,
    canSelectSource,
    canSelectSoundMode,
    canShuffle,
    canRepeat,
    handlePower,
    handlePlayPause,
    handleStop,
    handlePrevious,
    handleNext,
    handleVolumeChange,
    handleVolumeUp,
    handleVolumeDown,
    handleMuteToggle,
    handleSeek,
    handleSelectSource,
    handleSelectSoundMode,
    handleShuffleToggle,
    handleRepeatCycle,
  };
}

export type MediaPlayerController = ReturnType<typeof useMediaPlayer>;
