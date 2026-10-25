"use client";
import { useState, useCallback } from "react";
import { Skeleton } from "@heroui/react";
import Icon from "@mdi/react";
import { mdiLightbulb } from "@mdi/js";
import EntityIcon from "../Shared/util/EntityIcon";
import { CardShell, IconBubble } from "../Shared/Card";
import { useEntity } from "@casaboard/ha";
import { useEntityPress } from "@repo/hooks";
import { useLightLoading, useLightController } from "./useLight";
import { EntityControlModal } from "../EntityControlModal";

interface LightProps {
  entityId: string;
  dimmer?: boolean;
  temperature?: boolean;
  color?: boolean;
  tileLayout?: "tile" | "row";
  [key: string]: any;
}

export const Light = ({
  entityId,
  dimmer = true,
  temperature = false,
  color = false,
  tileLayout = "tile",
}: LightProps) => {
  const entity = useEntity(entityId);
  const [modalOpen, setModalOpen] = useState(false);

  const { isEntityReady, showNotAvailable, isLoaded } = useLightLoading(entity);

  const {
    isOn,
    brightnessPercentage,
    canBrightness,
    canColorTemp,
    canColor,
    handleToggle,
    handleBrightnessChange,
    debouncedSetTemperature,
    debouncedSetColor,
  } = useLightController(entity, entityId);

  const openModal = useCallback(() => setModalOpen(true), []);
  const pressHandlers = useEntityPress({
    onTap: handleToggle,
    onLongPress: openModal,
    enabled: isEntityReady && !!entity,
  });

  if (!entityId) {
    return (
      <div className="p-4 border-2 border-dashed border-theme-border rounded-xl text-center text-theme-text-muted">
        <Icon path={mdiLightbulb} className="h-12 w-12 mx-auto mb-2 opacity-40" />
        Configure Light Entity
      </div>
    );
  }

  const showBrightness = dimmer && canBrightness;
  const showTemp = temperature || canColorTemp;
  const showColor = color || canColor;

  return (
    <>
      <EntityControlModal
        open={modalOpen}
        setOpen={setModalOpen}
        entity={entity}
        entityId={entityId}
        showBrightness={showBrightness}
        showTemperature={showTemp}
        showColor={showColor}
        brightnessPercentage={brightnessPercentage}
        onBrightnessChange={handleBrightnessChange}
        onTemperatureChange={debouncedSetTemperature}
        onColorChange={debouncedSetColor}
        onToggle={handleToggle}
      />
      <Skeleton
        isLoaded={isLoaded}
        className="flex h-full w-full flex-col rounded-xl"
        classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
      >
        {showNotAvailable ? (
          <CardShell status="unavailable" domain="light" tileLayout={tileLayout}>
            <IconBubble
              icon={
                <Icon
                  path={mdiLightbulb}
                  className="h-8 w-8 text-theme-text-muted"
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
            key={entity?.entity_id || entityId}
            interactive
            status={isOn ? "on" : "off"}
            domain="light"
            tileLayout={tileLayout}
            {...pressHandlers}
          >
            <IconBubble
              icon={<EntityIcon entity={entity} className="h-6 w-6 text-current" />}
              label={
                entity.attributes?.friendly_name || entity.entity_id || entityId
              }
              secondary={
                isOn
                  ? showBrightness
                    ? `${brightnessPercentage}%`
                    : "On"
                  : "Off"
              }
            />
          </CardShell>
        ) : (
          <div className="rounded-xl p-3 text-center text-theme-text-muted opacity-0" />
        )}
      </Skeleton>
    </>
  );
};
