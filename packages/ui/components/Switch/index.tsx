"use client";
import { useEntity, useHA } from "@casaboard/ha";
import { Skeleton } from "@heroui/react";
import Icon from "@mdi/react";
import { mdiPower } from "@mdi/js";
import { useCallback, useState } from "react";
import EntityIcon from "../Shared/util/EntityIcon";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";
import { useEntityPress } from "@repo/hooks";
import { CardShell, IconBubble } from "../Shared/Card";
import { EntityControlModal } from "../EntityControlModal";

interface SwitchProps {
  entityId: string;
  tileLayout?: "tile" | "row";
  [key: string]: any;
}

export const Switch = ({ entityId, tileLayout = "tile" }: SwitchProps) => {
  const entity = useEntity(entityId);
  const { connection } = useHA();
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);
  const [modalOpen, setModalOpen] = useState(false);

  const domain = (entityId?.split(".")[0] || "switch") as string;
  const isOn = entity?.state === "on";

  const handleToggle = useCallback(async () => {
    if (!entity || !connection) return;
    const service = entity.state === "on" ? "turn_off" : "turn_on";
    await connection.sendMessagePromise({
      type: "call_service",
      domain,
      service,
      service_data: { entity_id: entity.entity_id },
    });
  }, [connection, entity, domain]);

  const openModal = useCallback(() => setModalOpen(true), []);
  const pressHandlers = useEntityPress({
    onTap: handleToggle,
    onLongPress: openModal,
    enabled: isEntityReady && !!entity,
  });

  if (!entityId) {
    return (
      <div className="p-4 border-2 border-dashed border-theme-border rounded-xl text-center text-theme-text-muted">
        <Icon path={mdiPower} className="h-12 w-12 mx-auto mb-2 opacity-40" />
        Configure Switch Entity
      </div>
    );
  }

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
          <CardShell status="unavailable" domain="switch" tileLayout={tileLayout}>
            <IconBubble
              icon={
                <Icon path={mdiPower} className="h-8 w-8 text-theme-text-muted" />
              }
              label={<span className="text-theme-text-muted">{entityId}</span>}
              secondary={
                <span className="text-theme-text-muted">Unavailable</span>
              }
            />
          </CardShell>
        ) : isEntityReady ? (
          <CardShell
            key={entity!.entity_id}
            interactive
            status={isOn ? "on" : "off"}
            domain="switch"
            tileLayout={tileLayout}
            {...pressHandlers}
          >
            <IconBubble
              icon={<EntityIcon entity={entity!} className="h-6 w-6 text-current" />}
              label={entity!.attributes.friendly_name || entity!.entity_id}
              secondary={isOn ? "On" : "Off"}
            />
          </CardShell>
        ) : (
          <div className="rounded-xl p-3 opacity-0" />
        )}
      </Skeleton>
    </>
  );
};
