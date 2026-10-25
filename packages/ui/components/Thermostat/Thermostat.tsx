"use client";
import { useEntity } from "@casaboard/ha";
import { mdiPlus, mdiMinus, mdiThermostat } from "@mdi/js";
import Icon from "@mdi/react";
import { useCallback, useState, type SyntheticEvent } from "react";
import { Skeleton } from "@heroui/react";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";
import { ThermostatControlModal } from "./ThermostatControlModal";
import { formatTemp, useThermostatController } from "./useThermostat";

export type ThermostatOrientation = "horizontal" | "vertical";

interface ThermostatProps {
  entityId: string;
  /** Compact row for sidebars; stacked layout for main grids. */
  orientation?: ThermostatOrientation;
}

function stopPressPropagation(e: SyntheticEvent): void {
  e.stopPropagation();
}

export const Thermostat = ({
  entityId,
  orientation = "horizontal",
}: ThermostatProps) => {
  const entity = useEntity(entityId);
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);
  const thermostat = useThermostatController(entity, entityId);
  const [modalOpen, setModalOpen] = useState(false);
  const openModal = useCallback(() => setModalOpen(true), []);
  const orientationClass =
    orientation === "vertical" ? "thermostat-hk--vertical" : "thermostat-hk--horizontal";

  const currentTempLabel = formatTemp(thermostat.currentTemp);
  const targetTempLabel = formatTemp(thermostat.targetTemp);

  if (!entityId) {
    return (
      <div className={`thermostat-hk ${orientationClass} thermostat-hk--empty`}>
        <Icon path={mdiThermostat} className="h-8 w-8 opacity-40" />
        <span>Configure Thermostat Entity</span>
      </div>
    );
  }

  return (
    <>
      <ThermostatControlModal open={modalOpen} setOpen={setModalOpen} thermostat={thermostat} />
      <Skeleton
        isLoaded={isLoaded}
        className="flex h-full w-full flex-col rounded-[1.75rem]"
        classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
      >
        {showNotAvailable ? (
          <div className={`thermostat-hk ${orientationClass} thermostat-hk--unavailable`}>
            <div className="thermostat-hk__icon" aria-hidden>
              <Icon path={mdiThermostat} className="h-6 w-6" />
            </div>
            <div className="thermostat-hk__labels">
              <div className="thermostat-hk__title">{entityId}</div>
              <div className="thermostat-hk__status">Unavailable</div>
            </div>
          </div>
        ) : isEntityReady ? (
          <div
            className={`thermostat-hk ${orientationClass} thermostat-hk--interactive`}
            role="button"
            tabIndex={0}
            onClick={openModal}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") openModal();
            }}
          >
            <div className="thermostat-hk__icon" aria-hidden>
              {/* Concentric ring mark matching HomeKit climate glyph */}
              <span className="thermostat-hk__ring" />
            </div>

            <div className="thermostat-hk__labels">
              <div className="thermostat-hk__title">
                {entity.attributes?.friendly_name || "Thermostat"}
              </div>
              <div className="thermostat-hk__status">{thermostat.modeLabel}</div>
              {(currentTempLabel != null || targetTempLabel != null) && (
                <div className="thermostat-hk__temps">
                  {currentTempLabel != null && (
                    <span className="thermostat-hk__temp">
                      <span className="thermostat-hk__temp-label">Now</span>
                      {currentTempLabel}°
                    </span>
                  )}
                  {currentTempLabel != null && targetTempLabel != null && (
                    <span className="thermostat-hk__temp-sep" aria-hidden>
                      ·
                    </span>
                  )}
                  {targetTempLabel != null && (
                    <span className="thermostat-hk__temp thermostat-hk__temp--target">
                      <span className="thermostat-hk__temp-label">Set</span>
                      {targetTempLabel}°
                    </span>
                  )}
                </div>
              )}
            </div>

            <div
              className="thermostat-hk__controls"
              onClick={stopPressPropagation}
              onPointerDown={stopPressPropagation}
            >
              {orientation === "vertical" ? (
                <>
                  <button
                    type="button"
                    className="thermostat-hk__btn"
                    onClick={() => thermostat.adjustTemp(-thermostat.step)}
                    aria-label="Decrease target temperature"
                  >
                    <Icon path={mdiMinus} className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="thermostat-hk__btn"
                    onClick={() => thermostat.adjustTemp(thermostat.step)}
                    aria-label="Increase target temperature"
                  >
                    <Icon path={mdiPlus} className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <button
                    type="button"
                    className="thermostat-hk__btn"
                    onClick={() => thermostat.adjustTemp(thermostat.step)}
                    aria-label="Increase target temperature"
                  >
                    <Icon path={mdiPlus} className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    className="thermostat-hk__btn"
                    onClick={() => thermostat.adjustTemp(-thermostat.step)}
                    aria-label="Decrease target temperature"
                  >
                    <Icon path={mdiMinus} className="h-4 w-4" />
                  </button>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className={`thermostat-hk ${orientationClass} opacity-0`} />
        )}
      </Skeleton>
    </>
  );
};
