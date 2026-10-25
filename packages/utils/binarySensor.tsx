import {
  mdiDoorClosed,
  mdiDoorOpen,
  mdiMotionSensor,
  mdiMotionSensorOff,
} from "@mdi/js";
import {
  binarySensorBackgroundClass,
  binarySensorIconClass,
} from "./entityTheme";

const DEVICE_CLASS_CONFIG = {
  occupancy: {
    icons: {
      on: {
        path: mdiMotionSensor,
        className: "h-10 w-10",
        color: "text-theme-text-primary",
      },
      off: {
        path: mdiMotionSensorOff,
        className: "h-10 w-10",
        color: "text-theme-text-secondary",
      },
      default: {
        path: mdiDoorOpen,
        className: "h-10 w-10",
        color: "text-theme-error",
      },
    },
    states: {
      on: "Occupied",
      off: "Clear",
      default: "Unknown",
    },
  },
  door: {
    icons: {
      on: {
        path: mdiDoorOpen,
        className: "min-h-12 min-w-12 h-12 w-12",
        color: "text-theme-text-primary",
      },
      off: {
        path: mdiDoorClosed,
        className: "min-h-12 min-w-12 h-12 w-12",
        color: "text-theme-text-secondary",
      },
      default: {
        path: mdiDoorOpen,
        className: "h-12 w-12",
        color: "text-theme-error",
      },
    },
    states: {
      on: "Open",
      off: "Closed",
      default: "Unknown",
    },
  },
  running: {
    states: {
      on: "Running",
      off: "Not Running",
      default: "Unknown",
    },
  },
} as const;

export const stateClassNameBg = (entity: any) => {
  return binarySensorBackgroundClass(String(entity?.state ?? ""));
};

export const stateClassNameIcon = (entity: any) => {
  return binarySensorIconClass(String(entity?.state ?? ""));
};

export const renderState = (entity: any) => {
  const deviceClass = entity?.attributes
    ?.device_class as keyof typeof DEVICE_CLASS_CONFIG;
  const config = DEVICE_CLASS_CONFIG[deviceClass]?.states;

  if (!config) return "Unknown";

  return config[entity.state as keyof typeof config] || config.default;
};
