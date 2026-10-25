"use client";
import React from "react";
import {
  ComponentConfig,
  LightConfig,
  AlarmConfig,
  BinarySensorConfig,
  SensorConfig,
  EntitiesCardConfig,
  CustomGridConfig,
} from "@repo/config";
import { Light } from "../Light";
import { Alarm } from "../Alarm";
import { BinarySensor } from "../BinarySensor";
import GraphCard from "../GraphCard";
import EntitiesCard from "../EntitiesCard";
import EntityCard from "../EntitiesCard/EntityCard";
import classNames from "classnames";
import { clientLogger } from "@repo/lib";

interface ComponentRendererProps {
  config: ComponentConfig;
}

export const ComponentRenderer: React.FC<ComponentRendererProps> = ({
  config,
}) => {
  switch (config.type) {
    case "light":
      const lightConfig = config as LightConfig;
      return (
        <Light
          entityId={lightConfig.id}
          dimmer={lightConfig.dimmer}
          temperature={lightConfig.temperature}
          color={lightConfig.color}
        />
      );

    case "alarm":
      const alarmConfig = config as AlarmConfig;
      return <Alarm entityId={alarmConfig.id} />;

    case "binary_sensor":
      const binarySensorConfig = config as BinarySensorConfig;
      return <BinarySensor entityId={binarySensorConfig.id} />;

    case "sensor":
      const sensorConfig = config as SensorConfig;
      return <GraphCard entityId={sensorConfig.id} showStatistics={false} />;

    case "entities_card":
      const entitiesCardConfig = config as EntitiesCardConfig;
      return (
        <EntitiesCard
          title={entitiesCardConfig.title}
          entities={entitiesCardConfig.entities || []}
          colspan={entitiesCardConfig.colspan}
          columns={entitiesCardConfig.columns}
          showTitles={entitiesCardConfig.showTitles}
          showLastChanged={entitiesCardConfig.showLastChanged}
          showAllOn={entitiesCardConfig.showAllOn}
          disableClick={entitiesCardConfig.disableClick}
          openTab={entitiesCardConfig.openTab}
        >
          {entitiesCardConfig.children && (
            <div className="grid grid-cols-2 gap-2">
              {entitiesCardConfig.children.map((childConfig, index) => (
                <ComponentRenderer key={index} config={childConfig} />
              ))}
            </div>
          )}
        </EntitiesCard>
      );

    case "custom_grid":
      const customGridConfig = config as CustomGridConfig;
      return (
        <div
          className={classNames(
            "relative w-full items-center justify-between cursor-pointer text-theme-text rounded-2xl grid gap-4",
            {
              "grid-cols-1":
                !customGridConfig.gridCols || customGridConfig.gridCols === 1,
              "grid-cols-2": customGridConfig.gridCols === 2,
              "grid-cols-3": customGridConfig.gridCols === 3,
              "grid-cols-4": customGridConfig.gridCols === 4,
            },
            customGridConfig.className
          )}
        >
          {(customGridConfig.entities || []).map((entity, index) => (
            <EntityCard
              key={`entity-${index}`}
              entityId={entity.id}
              icon={entity.icon}
              showState={entity.showState}
              showTitle={entity.showTitle}
              showLastChanged={entity.showLastChanged}
            />
          ))}
          {(customGridConfig.children || []).map((childConfig, index) => (
            <ComponentRenderer key={`child-${index}`} config={childConfig} />
          ))}
        </div>
      );

    default:
      clientLogger.warn(
        "ComponentRenderer",
        "Unknown component type",
        (config as any).type
      );
      return null;
  }
};
