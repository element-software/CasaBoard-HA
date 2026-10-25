"use client";

import Icon from "@mdi/react";
import {
  mdiPause,
  mdiPlay,
  mdiPower,
  mdiRepeat,
  mdiRepeatOff,
  mdiRepeatOnce,
  mdiShuffle,
  mdiShuffleDisabled,
  mdiSkipNext,
  mdiSkipPrevious,
  mdiStop,
  mdiTelevisionPlay,
  mdiVolumeHigh,
  mdiVolumeMinus,
  mdiVolumeMute,
  mdiVolumePlus,
} from "@mdi/js";
import Popup from "../Popup";
import { Slider } from "../RangeSlider/RangeSlider";
import {
  formatMediaTime,
  type MediaPlayerController,
  type MediaRepeatMode,
} from "./useMediaPlayer";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  media: MediaPlayerController;
  entityId: string;
};

function repeatIcon(repeat: MediaRepeatMode): string {
  if (repeat === "one") return mdiRepeatOnce;
  if (repeat === "all") return mdiRepeat;
  return mdiRepeatOff;
}

function repeatLabel(repeat: MediaRepeatMode): string {
  if (repeat === "one") return "Repeat one";
  if (repeat === "all") return "Repeat all";
  return "Repeat off";
}

export function MediaPlayerControlModal({
  open,
  setOpen,
  media,
  entityId,
}: Props) {
  const subtitle = media.mediaTitle
    ? [media.mediaTitle, media.mediaArtist || media.appName]
        .filter(Boolean)
        .join(" · ")
    : media.stateLabel;

  return (
    <Popup
      open={open}
      setOpen={setOpen}
      className="bg-theme-surface text-theme-text max-w-lg"
    >
      <div className="media-player-modal flex flex-col gap-5 pr-8">
        <div className="flex items-start gap-3">
          <div className="media-player-modal__art-wrap">
            {media.artworkUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={media.artworkUrl}
                alt=""
                className="media-player-modal__art"
                draggable={false}
              />
            ) : (
              <div className="media-player-modal__art-fallback" aria-hidden>
                <Icon path={mdiTelevisionPlay} className="h-8 w-8 opacity-40" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1 pt-0.5">
            <h2 className="truncate text-lg font-semibold">{media.name}</h2>
            <p className="truncate text-sm text-theme-text-secondary">
              {subtitle || entityId}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {media.canPower && (
            <button
              type="button"
              className="media-player-modal__btn"
              aria-label={media.isOff ? "Turn on" : "Turn off"}
              onClick={media.handlePower}
            >
              <Icon path={mdiPower} className="h-5 w-5" />
            </button>
          )}
          {media.canPrevious && (
            <button
              type="button"
              className="media-player-modal__btn"
              aria-label="Previous"
              onClick={media.handlePrevious}
              disabled={media.isOff}
            >
              <Icon path={mdiSkipPrevious} className="h-6 w-6" />
            </button>
          )}
          {media.canPlayPause && (
            <button
              type="button"
              className="media-player-modal__btn media-player-modal__btn--primary"
              aria-label={media.isPlaying ? "Pause" : "Play"}
              onClick={media.handlePlayPause}
              disabled={media.isOff}
            >
              <Icon
                path={media.isPlaying ? mdiPause : mdiPlay}
                className="h-7 w-7"
              />
            </button>
          )}
          {media.canStop && (
            <button
              type="button"
              className="media-player-modal__btn"
              aria-label="Stop"
              onClick={media.handleStop}
              disabled={media.isOff}
            >
              <Icon path={mdiStop} className="h-5 w-5" />
            </button>
          )}
          {media.canNext && (
            <button
              type="button"
              className="media-player-modal__btn"
              aria-label="Next"
              onClick={media.handleNext}
              disabled={media.isOff}
            >
              <Icon path={mdiSkipNext} className="h-6 w-6" />
            </button>
          )}
          {media.canShuffle && (
            <button
              type="button"
              className={`media-player-modal__btn ${media.shuffle ? "media-player-modal__btn--active" : ""}`}
              aria-label={media.shuffle ? "Shuffle on" : "Shuffle off"}
              aria-pressed={media.shuffle}
              onClick={media.handleShuffleToggle}
              disabled={media.isOff}
            >
              <Icon
                path={media.shuffle ? mdiShuffle : mdiShuffleDisabled}
                className="h-5 w-5"
              />
            </button>
          )}
          {media.canRepeat && (
            <button
              type="button"
              className={`media-player-modal__btn ${media.repeat !== "off" ? "media-player-modal__btn--active" : ""}`}
              aria-label={repeatLabel(media.repeat)}
              onClick={media.handleRepeatCycle}
              disabled={media.isOff}
            >
              <Icon path={repeatIcon(media.repeat)} className="h-5 w-5" />
            </button>
          )}
        </div>

        {media.canSeek && (
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
              Progress
            </span>
            <Slider
              min={0}
              max={Math.max(1, Math.floor(media.duration))}
              step={1}
              value={Math.min(
                Math.floor(media.position),
                Math.floor(media.duration) || 0
              )}
              onChange={media.handleSeek}
              disabled={media.isOff}
            />
            <div className="flex justify-between text-xs text-theme-text-muted">
              <span>{formatMediaTime(media.position)}</span>
              <span>{formatMediaTime(media.duration)}</span>
            </div>
          </label>
        )}

        {(media.canVolumeSet || media.canVolumeStep || media.canMute) && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
              Volume
            </span>
            <div className="flex items-center gap-2">
              {media.canMute && (
                <button
                  type="button"
                  className="media-player-modal__btn"
                  aria-label={media.isMuted ? "Unmute" : "Mute"}
                  onClick={media.handleMuteToggle}
                  disabled={media.isOff}
                >
                  <Icon
                    path={media.isMuted ? mdiVolumeMute : mdiVolumeHigh}
                    className="h-5 w-5"
                  />
                </button>
              )}
              {media.canVolumeSet ? (
                <>
                  <Slider
                    min={0}
                    max={100}
                    step={1}
                    value={media.volumePercentage}
                    onChange={media.handleVolumeChange}
                    disabled={media.isOff}
                  />
                  <span className="w-10 shrink-0 text-right text-xs font-semibold text-theme-text-muted">
                    {media.volumePercentage}%
                  </span>
                </>
              ) : media.canVolumeStep ? (
                <>
                  <button
                    type="button"
                    className="media-player-modal__btn"
                    aria-label="Volume down"
                    onClick={media.handleVolumeDown}
                    disabled={media.isOff}
                  >
                    <Icon path={mdiVolumeMinus} className="h-5 w-5" />
                  </button>
                  <button
                    type="button"
                    className="media-player-modal__btn"
                    aria-label="Volume up"
                    onClick={media.handleVolumeUp}
                    disabled={media.isOff}
                  >
                    <Icon path={mdiVolumePlus} className="h-5 w-5" />
                  </button>
                </>
              ) : null}
            </div>
          </div>
        )}

        {media.canSelectSource && (
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
              Source
            </span>
            <select
              className="media-player-modal__select"
              value={media.currentSource}
              onChange={(e) => media.handleSelectSource(e.target.value)}
              disabled={media.isOff}
            >
              {!media.currentSource && (
                <option value="">Select source…</option>
              )}
              {media.sourceList.map((source) => (
                <option key={source} value={source}>
                  {source}
                </option>
              ))}
            </select>
          </label>
        )}

        {media.canSelectSoundMode && (
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
              Sound mode
            </span>
            <select
              className="media-player-modal__select"
              value={media.currentSoundMode}
              onChange={(e) => media.handleSelectSoundMode(e.target.value)}
              disabled={media.isOff}
            >
              {!media.currentSoundMode && (
                <option value="">Select sound mode…</option>
              )}
              {media.soundModeList.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </Popup>
  );
}
