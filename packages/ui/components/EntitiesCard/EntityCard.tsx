"use client";

import { useCallback, type ReactNode } from "react";
import Icon from "@mdi/react";
import { mdiDevices } from "@mdi/js";
import EntityIcon from "../Shared/util/EntityIcon";
import { BinarySensorUtils } from "@repo/utils";
import { Skeleton } from "@heroui/react";
import { useEntity, useHA } from "@casaboard/ha";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";
import { CardShell } from "../Shared/Card";

interface EntityCardProps {
  entityId: string;
  icon?: string;
  showTitle?: boolean;
  showState?: boolean;
  showLastChanged?: boolean;
  disableClick?: boolean;
}

const TOGGLE_DOMAINS = new Set([
  "light",
  "switch",
  "fan",
  "input_boolean",
  "cover",
  "lock",
]);

function statusLabel(
  entity: { state?: unknown },
  domain: string
): string {
  const state = String(entity.state ?? "");

  if (domain === "binary_sensor") {
    const rendered = BinarySensorUtils.renderState(entity as any);
    if (rendered !== "Unknown") return rendered;
  }

  if (domain === "cover") {
    if (state === "open") return "Open";
    if (state === "closed") return "Closed";
    if (state === "opening") return "Opening";
    if (state === "closing") return "Closing";
  }

  if (domain === "lock") {
    if (state === "locked") return "Locked";
    if (state === "unlocked") return "Unlocked";
  }

  if (state === "on") return "On";
  if (state === "off") return "Off";
  if (state === "home") return "Home";
  if (state === "not_home") return "Away";
  if (state === "open") return "Open";
  if (state === "closed") return "Closed";

  return state || "Unknown";
}

function formatLastChanged(lastChanged: string): string {
  return new Date(lastChanged).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function EntityTileContent({
  icon,
  label,
  status,
  detail,
}: {
  icon: ReactNode;
  label?: ReactNode;
  status: ReactNode;
  detail?: ReactNode;
}) {
  return (
    <div className="flex h-full min-h-0 w-full flex-col">
      <div className="flex w-full items-center justify-between gap-2">
        <div className="icon-bubble shrink-0">{icon}</div>
        <div className="icon-bubble-secondary min-w-0 flex-1 text-right text-xs font-medium leading-snug">
          {status}
        </div>
      </div>
      {(label || detail) && (
        <div className="mt-auto flex min-w-0 flex-col gap-0.5">
          {label && (
            <h3 className="truncate text-sm font-semibold capitalize leading-tight">
              {label}
            </h3>
          )}
          {detail && (
            <div className="icon-bubble-secondary text-[10px] font-medium leading-snug break-words hyphens-none">
              {detail}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const EntityCard = ({
  entityId,
  showTitle = true,
  disableClick = false,
  showState = false,
  showLastChanged = false,
}: EntityCardProps) => {
  const { connection } = useHA();
  const entity = useEntity(entityId);
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);
  const domain = entityId?.split(".")[0] ?? "";
  const isOn =
    entity?.state === "on" ||
    entity?.state === "home" ||
    entity?.state === "open";
  const canToggle = !disableClick && TOGGLE_DOMAINS.has(domain);

  const handleToggle = useCallback(async () => {
    if (!canToggle || !connection || !entity) return;

    try {
      if (domain === "cover") {
        await connection.sendMessagePromise({
          type: "call_service",
          domain,
          service: entity.state === "open" ? "close_cover" : "open_cover",
          service_data: { entity_id: entity.entity_id },
        });
        return;
      }

      if (domain === "lock") {
        await connection.sendMessagePromise({
          type: "call_service",
          domain,
          service: entity.state === "unlocked" || entity.state === "on" ? "lock" : "unlock",
          service_data: { entity_id: entity.entity_id },
        });
        return;
      }

      await connection.sendMessagePromise({
        type: "call_service",
        domain,
        service: entity.state === "on" ? "turn_off" : "turn_on",
        service_data: { entity_id: entity.entity_id },
      });
    } catch {
      /* non-toggleable or failed call — tile still shows state */
    }
  }, [canToggle, connection, domain, entity]);

  if (!entityId) return null;

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="flex h-full w-full flex-col rounded-xl"
      classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
    >
      {showNotAvailable ? (
        <CardShell
          status="unavailable"
          domain={domain || undefined}
          tileLayout="tile"
          className="!p-3.5"
        >
          <EntityTileContent
            icon={
              <Icon
                path={mdiDevices}
                className="h-6 w-6 text-theme-text-muted"
              />
            }
            label={<span className="text-theme-text-muted">{entityId}</span>}
            status={<span className="text-theme-text-muted">Unavailable</span>}
          />
        </CardShell>
      ) : isEntityReady ? (
        <CardShell
          interactive={canToggle}
          status={isOn ? "on" : "off"}
          domain={domain || undefined}
          tileLayout="tile"
          className="!p-3.5"
          onClick={canToggle ? handleToggle : undefined}
        >
          <EntityTileContent
            icon={
              <EntityIcon entity={entity!} className="h-6 w-6 text-current" />
            }
            label={
              showTitle
                ? entity!.attributes?.friendly_name || entity!.entity_id
                : undefined
            }
            status={statusLabel(entity!, domain)}
            detail={
              showLastChanged && entity!.last_changed ? (
                <span className="flex flex-col">
                  <span>Last changed</span>
                  <span>{formatLastChanged(entity!.last_changed)}</span>
                </span>
              ) : undefined
            }
          />
        </CardShell>
      ) : (
        <div className="rounded-xl p-3 opacity-0" />
      )}
    </Skeleton>
  );
};

export default EntityCard;
