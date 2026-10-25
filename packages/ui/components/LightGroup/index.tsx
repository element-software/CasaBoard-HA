"use client";
import { useCallback } from "react";
import classNames from "classnames";
import Icon from "@mdi/react";
import { mdiLightbulbGroup, mdiPower } from "@mdi/js";
import { useEntitiesByIds, useHA } from "@casaboard/ha";
import { Light } from "../Light";

interface LightGroupProps {
  title?: string;
  entityIds: string[];
  columns?: number;
  showAllOn?: boolean;
  dimmer?: boolean;
  temperature?: boolean;
  color?: boolean;
  [key: string]: any;
}

export const LightGroup = ({
  title = "Light Group",
  entityIds = [],
  columns = 4,
  showAllOn = true,
  dimmer = true,
  temperature = false,
  color = false,
}: LightGroupProps) => {
  const { connection } = useHA();
  const entities = useEntitiesByIds(entityIds);

  const isOn = entityIds.some((id) => entities[id]?.state === "on");

  const toggleAll = useCallback(async () => {
    if (!connection || entityIds.length === 0) return;
    await connection.sendMessagePromise({
      type: "call_service",
      domain: "light",
      service: isOn ? "turn_off" : "turn_on",
      service_data: { entity_id: entityIds },
    });
  }, [connection, entityIds, isOn]);

  if (entityIds.length === 0) {
    return (
      <div className="p-4 border-2 border-dashed border-theme-border rounded-xl text-center text-theme-text-muted">
        <Icon path={mdiLightbulbGroup} className="h-12 w-12 mx-auto mb-2 opacity-40" />
        Configure Light Group
      </div>
    );
  }

  const normalizedCols = columns < 1 || columns > 10 ? 4 : columns;

  return (
    <div className="flex h-full w-full flex-col gap-3">
      {title && (
        <div className="flex w-full flex-row items-center justify-between gap-3">
          <h2 className="truncate text-2xl font-bold tracking-tight text-theme-text">
            {title}
          </h2>
          {showAllOn && (
            <button
              type="button"
              onClick={toggleAll}
              className="shrink-0"
              aria-label={isOn ? "Turn all off" : "Turn all on"}
            >
              <Icon
                path={mdiPower}
                className={classNames("h-10 w-10 rounded-full p-2", {
                  "text-theme-text-secondary": !isOn,
                  "bg-theme-secondary text-theme-text": isOn,
                })}
                style={
                  isOn
                    ? {
                        background: `linear-gradient(to left, var(--color-warning), var(--color-primary))`,
                      }
                    : undefined
                }
                aria-hidden="true"
              />
            </button>
          )}
        </div>
      )}
      <div
        className={classNames("grid w-full gap-3", {
          "grid-cols-1": normalizedCols === 1,
          "grid-cols-2": normalizedCols === 2,
          "grid-cols-3": normalizedCols === 3,
          "grid-cols-2 sm:grid-cols-3 md:grid-cols-4": normalizedCols === 4,
          "grid-cols-3 sm:grid-cols-4 md:grid-cols-5": normalizedCols === 5,
          "grid-cols-3 sm:grid-cols-4 md:grid-cols-6": normalizedCols === 6,
          "grid-cols-3 sm:grid-cols-5 md:grid-cols-7": normalizedCols === 7,
          "grid-cols-4 sm:grid-cols-6 md:grid-cols-8": normalizedCols === 8,
          "grid-cols-3 sm:grid-cols-6 md:grid-cols-9": normalizedCols === 9,
          "grid-cols-4 sm:grid-cols-7 md:grid-cols-10": normalizedCols === 10,
        })}
      >
        {entityIds.map((entityId) => (
          <Light
            key={entityId}
            entityId={entityId}
            dimmer={dimmer}
            temperature={temperature}
            color={color}
            tileLayout="tile"
          />
        ))}
      </div>
    </div>
  );
};
