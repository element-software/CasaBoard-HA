"use client";
import Icon from "@mdi/react";
import { mdiMotionSensor } from "@mdi/js";
import EntityIcon from "../Shared/util/EntityIcon";
import { BinarySensorUtils } from "@repo/utils";
import { CardShell, IconBubble } from "../Shared/Card";
import { useEntity } from "@casaboard/ha";
import { Skeleton } from "@heroui/react";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";

interface BinarySensorProps {
  entityId: string;
  tileLayout?: "tile" | "row";
  [key: string]: any;
}

export const BinarySensor = ({
  entityId,
  tileLayout = "tile",
}: BinarySensorProps) => {
  const entity = useEntity(entityId);
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);

  if (!entityId) {
    return (
      <div className="p-4 border-2 border-dashed border-theme-border rounded-xl text-center text-theme-text-muted">
        <Icon path={mdiMotionSensor} className="h-12 w-12 mx-auto mb-2 opacity-40" />
        Configure Binary Sensor Entity
      </div>
    );
  }

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="flex h-full w-full flex-col rounded-xl"
      classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
    >
      {showNotAvailable ? (
        <CardShell status="unavailable" tileLayout={tileLayout}>
          <IconBubble
            icon={
              <Icon
                path={mdiMotionSensor}
                className="h-6 w-6 text-theme-text-muted"
              />
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
          status="off"
          tileLayout={tileLayout}
        >
          <IconBubble
            icon={<EntityIcon entity={entity!} className="h-6 w-6" />}
            label={entity!.attributes.friendly_name}
            secondary={BinarySensorUtils.renderState(entity as any)}
          />
        </CardShell>
      ) : (
        <div className="rounded-xl p-3 opacity-0" />
      )}
    </Skeleton>
  );
};
