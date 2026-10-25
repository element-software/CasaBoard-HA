"use client";

import { useCallback, useState, type SyntheticEvent } from "react";
import { useEntity } from "@casaboard/ha";
import { Skeleton } from "@heroui/react";
import Icon from "@mdi/react";
import {
  mdiPause,
  mdiPlay,
  mdiPower,
  mdiTelevisionPlay,
  mdiVolumeHigh,
  mdiVolumeMinus,
  mdiVolumeMute,
  mdiVolumePlus,
} from "@mdi/js";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";
import { useEntityPress } from "@repo/hooks";
import { CardShell } from "../Shared/Card";
import { Slider } from "../RangeSlider/RangeSlider";
import { MediaPlayerControlModal } from "./MediaPlayerControlModal";
import { useMediaPlayer } from "./useMediaPlayer";

interface MediaPlayerProps {
  entityId: string;
  [key: string]: unknown;
}

function stopPressPropagation(e: SyntheticEvent): void {
  e.stopPropagation();
}

export const MediaPlayer = ({ entityId }: MediaPlayerProps) => {
  const entity = useEntity(entityId);
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);
  const media = useMediaPlayer(entity, entityId);
  const [modalOpen, setModalOpen] = useState(false);

  const openModal = useCallback(() => setModalOpen(true), []);
  const handleCardTap = useCallback(() => {
    if (media.canPlayPause && !media.isOff) {
      media.handlePlayPause();
    } else {
      media.handlePower();
    }
  }, [media]);

  const pressHandlers = useEntityPress({
    onTap: handleCardTap,
    onLongPress: openModal,
    enabled: isEntityReady && !!entity,
  });

  if (!entityId) {
    return (
      <div className="media-player-empty flex min-h-[12rem] flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-theme-border p-6 text-center text-theme-text-muted">
        <Icon path={mdiTelevisionPlay} className="h-12 w-12 opacity-40" />
        Configure Media Player Entity
      </div>
    );
  }

  return (
    <>
      <MediaPlayerControlModal
        open={modalOpen}
        setOpen={setModalOpen}
        media={media}
        entityId={entityId}
      />
      <Skeleton
        isLoaded={isLoaded}
        className="flex h-full w-full flex-col rounded-xl"
        classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
      >
        {showNotAvailable ? (
          <CardShell status="unavailable" domain="media_player">
            <div className="media-player-card media-player-card--unavailable">
              <div className="media-player-card__body">
                <Icon
                  path={mdiTelevisionPlay}
                  className="h-10 w-10 text-theme-text-muted"
                />
                <div className="min-w-0">
                  <h3 className="truncate text-sm font-semibold text-theme-text-muted">
                    {entityId}
                  </h3>
                  <p className="text-xs text-theme-text-muted">Unavailable</p>
                </div>
              </div>
            </div>
          </CardShell>
        ) : isEntityReady ? (
          <CardShell
            key={entity!.entity_id || entityId}
            interactive
            status={media.isActive ? "on" : "off"}
            domain="media_player"
            {...pressHandlers}
          >
            <div
              className="media-player-card"
              data-has-art={media.artworkUrl ? "true" : "false"}
            >
              {media.artworkUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={media.artworkUrl}
                  alt=""
                  className="media-player-card__art"
                  draggable={false}
                />
              ) : (
                <div className="media-player-card__art-fallback" aria-hidden>
                  <Icon path={mdiTelevisionPlay} className="h-14 w-14 opacity-30" />
                </div>
              )}
              <div className="media-player-card__scrim" aria-hidden />
              <div className="media-player-card__content">
                <div className="media-player-card__meta">
                  <h3 className="media-player-card__title">{media.name}</h3>
                  <p className="media-player-card__subtitle">{media.nowPlaying}</p>
                </div>

                <div
                  className="media-player-card__controls"
                  onPointerDown={stopPressPropagation}
                  onPointerUp={stopPressPropagation}
                  onClick={stopPressPropagation}
                >
                  {media.canPower && (
                    <button
                      type="button"
                      className="media-player-card__btn"
                      aria-label={media.isOff ? "Turn on" : "Turn off"}
                      onClick={media.handlePower}
                    >
                      <Icon path={mdiPower} className="h-5 w-5" />
                    </button>
                  )}

                  {media.canPlayPause && (
                    <button
                      type="button"
                      className="media-player-card__btn media-player-card__btn--primary"
                      aria-label={media.isPlaying ? "Pause" : "Play"}
                      onClick={media.handlePlayPause}
                      disabled={media.isOff}
                    >
                      <Icon
                        path={media.isPlaying ? mdiPause : mdiPlay}
                        className="h-6 w-6"
                      />
                    </button>
                  )}

                  {media.canMute && (
                    <button
                      type="button"
                      className="media-player-card__btn"
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
                    <div className="media-player-card__volume">
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={media.volumePercentage}
                        onChange={media.handleVolumeChange}
                        disabled={media.isOff}
                      />
                      <span className="media-player-card__volume-label">
                        {media.volumePercentage}%
                      </span>
                    </div>
                  ) : media.canVolumeStep ? (
                    <div className="media-player-card__volume-step">
                      <button
                        type="button"
                        className="media-player-card__btn"
                        aria-label="Volume down"
                        onClick={media.handleVolumeDown}
                        disabled={media.isOff}
                      >
                        <Icon path={mdiVolumeMinus} className="h-5 w-5" />
                      </button>
                      <button
                        type="button"
                        className="media-player-card__btn"
                        aria-label="Volume up"
                        onClick={media.handleVolumeUp}
                        disabled={media.isOff}
                      >
                        <Icon path={mdiVolumePlus} className="h-5 w-5" />
                      </button>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </CardShell>
        ) : (
          <div className="min-h-[12rem] rounded-xl opacity-0" />
        )}
      </Skeleton>
    </>
  );
};
