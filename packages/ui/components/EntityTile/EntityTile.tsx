"use client";

import { Light } from "../Light";
import { Switch } from "../Switch";
import { MediaPlayer } from "../MediaPlayer";
import { useEntity } from "@casaboard/ha";
import { Skeleton } from "@heroui/react";
import { useCallback, useState } from "react";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";
import { useEntityPress } from "@repo/hooks";
import { useHA } from "@casaboard/ha";
import { CardShell, IconBubble } from "../Shared/Card";
import EntityIcon from "../Shared/util/EntityIcon";
import { EntityControlModal } from "../EntityControlModal";

type EntityTileProps = {
  entityId: string;
  tileLayout?: "tile" | "row";
};

/** Renders the right control for a domain, with HomeKit tap / long-press. */
export function EntityTile({ entityId, tileLayout = "tile" }: EntityTileProps) {
  const domain = entityId?.split(".")[0] ?? "";

  if (domain === "light") {
    return <Light entityId={entityId} tileLayout={tileLayout} />;
  }
  if (domain === "switch" || domain === "input_boolean") {
    return <Switch entityId={entityId} tileLayout={tileLayout} />;
  }
  if (domain === "media_player") {
    return <MediaPlayer entityId={entityId} />;
  }

  return <GenericToggleTile entityId={entityId} tileLayout={tileLayout} />;
}

function GenericToggleTile({ entityId, tileLayout }: EntityTileProps) {
  const entity = useEntity(entityId);
  const { connection } = useHA();
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);
  const [modalOpen, setModalOpen] = useState(false);
  const domain = entityId?.split(".")[0] || "switch";
  const isOn = entity?.state === "on" || entity?.state === "home" || entity?.state === "open";

  const handleToggle = useCallback(async () => {
    if (!entity || !connection) return;
    const toggleDomains = ["fan", "cover", "lock", "media_player", "input_boolean"];
    if (toggleDomains.includes(domain) || domain === "switch") {
      const service = entity.state === "on" || entity.state === "open" ? "turn_off" : "turn_on";
      try {
        await connection.sendMessagePromise({
          type: "call_service",
          domain,
          service: domain === "cover" ? (entity.state === "open" ? "close_cover" : "open_cover") : service,
          service_data: { entity_id: entity.entity_id },
        });
      } catch {
        /* non-toggleable domains still show state in modal */
      }
    }
  }, [connection, entity, domain]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const pressHandlers = useEntityPress({
    onTap: handleToggle,
    onLongPress: openModal,
    enabled: isEntityReady && !!entity,
  });

  if (!entityId) return null;

  return (
    <>
      <EntityControlModal
        open={modalOpen}
        setOpen={setModalOpen}
        entity={entity}
        entityId={entityId}
        onToggle={handleToggle}
      />
      <Skeleton
        isLoaded={isLoaded}
        className="flex h-full w-full flex-col rounded-xl"
        classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
      >
        {showNotAvailable ? (
          <CardShell status="unavailable" tileLayout={tileLayout}>
            <IconBubble
              icon={<span className="h-6 w-6 rounded-full bg-theme-border" />}
              label={entityId}
              secondary="Unavailable"
            />
          </CardShell>
        ) : isEntityReady ? (
          <CardShell
            interactive
            status={isOn ? "on" : "off"}
            domain={domain}
            tileLayout={tileLayout}
            {...pressHandlers}
          >
            <IconBubble
              icon={<EntityIcon entity={entity!} className="h-6 w-6 text-current" />}
              label={entity!.attributes?.friendly_name || entity!.entity_id}
              secondary={String(entity!.state)}
            />
          </CardShell>
        ) : (
          <div className="rounded-xl p-3 opacity-0" />
        )}
      </Skeleton>
    </>
  );
}
