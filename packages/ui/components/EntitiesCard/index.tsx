"use client";
import classNames from "classnames";
import Icon from "@mdi/react";
import { mdiOpenInNew, mdiPower } from "@mdi/js";
import { useCallback, useState } from "react";
import Popup from "../Popup";
import { Entity } from "@repo/types/shared";
import EntityCard from "./EntityCard";
import { useHA } from "@casaboard/ha";

interface EntitiesCardProps {
  title: string;
  entities: Entity[];
  colspan?: number;
  columns?: number;
  showAllOn?: boolean;
  showTitles?: boolean;
  disableClick?: boolean;
  openTab?: boolean;
  children?: React.ReactNode;
  showLastChanged?: boolean;
}

const EntitiesCard = ({
  title,
  entities,
  colspan,
  columns = 4,
  openTab = false,
  showAllOn = false,
  showTitles = true,
  disableClick = false,
  showLastChanged = false,
  children,
}: EntitiesCardProps) => {
  const [allOn, setAllOn] = useState(false);
  const [open, setOpen] = useState(false);

  const { connection } = useHA();

  const toggleLighting = useCallback(
    async (entityIds: string[]) => {
      if (!connection) return;
      await connection.sendMessagePromise({
        type: "call_service",
        domain: "light",
        service: allOn ? "turn_off" : "turn_on",
        service_data: { entity_id: entityIds },
      });
      setAllOn(!allOn);
    },
    [allOn, connection]
  );

  const normalizedCols = columns < 1 || columns > 10 ? 4 : columns;

  return (
    <div
      className={classNames("flex h-full w-full flex-col gap-3", {
        "sm:col-span-2": colspan === 2,
        "sm:col-span-3": colspan === 3,
        "sm:col-span-4": colspan === 4,
      })}
    >
      {title && (
        <div className="flex w-full flex-row items-center justify-between gap-3">
          <div className="inline-flex min-w-0 items-center">
            <h2 className="truncate text-2xl font-bold tracking-tight text-theme-text">
              {title}
            </h2>
            {openTab && (
              <div className="inline-flex shrink-0" onClick={() => setOpen(true)}>
                <Icon
                  path={mdiOpenInNew}
                  className="ml-3 h-6 w-6 text-theme-primary"
                  aria-hidden="true"
                />
                <Popup
                  open={open}
                  setOpen={setOpen}
                  className="h-full w-screen bg-theme-background"
                >
                  <div className="mb-4 w-full text-center text-2xl font-medium text-theme-text">
                    {title}
                  </div>
                  {children}
                </Popup>
              </div>
            )}
          </div>
          {showAllOn && (
            <button
              type="button"
              onClick={
                disableClick
                  ? undefined
                  : () =>
                      toggleLighting(
                        (entities || []).map((entity) => entity.id as string)
                      )
              }
              className="shrink-0"
              aria-label={allOn ? "Turn all off" : "Turn all on"}
            >
              <Icon
                path={mdiPower}
                className={classNames("h-10 w-10 rounded-full p-2", {
                  "text-theme-text-secondary": allOn,
                  "bg-theme-secondary text-theme-text": !allOn,
                })}
                style={
                  allOn
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
        {(entities || []).map((entity, index) => (
          <EntityCard
            key={entity.id ? `${entity.id}-${index}` : `entity-${index}`}
            entityId={entity.id}
            icon={entity.icon}
            showTitle={showTitles}
            showLastChanged={showLastChanged}
            disableClick={disableClick}
          />
        ))}
      </div>
    </div>
  );
};

export default EntitiesCard;
