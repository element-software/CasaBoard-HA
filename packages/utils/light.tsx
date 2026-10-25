import { lightTileBackgroundClass, lightTileTextClass } from "./entityTheme";

export const stateClassNameBg = (entity: any) => {
  return lightTileBackgroundClass(String(entity?.state ?? ""));
};

export const stateClassNameIcon = (entity: any) => {
  return lightTileTextClass(String(entity?.state ?? ""));
};

const BRIGHTNESS_LEVELS = [
  {
    min: 0,
    max: 0,
    classes: "text-theme-text-secondary",
    opacity: "",
  },
  {
    min: 1,
    max: 99,
    classes: "text-theme-text-primary",
    opacity: "opacity-50",
  },
  {
    min: 100,
    max: 199,
    classes: "text-theme-text-primary",
    opacity: "opacity-75",
  },
  {
    min: 200,
    max: Infinity,
    classes: "text-theme-text-primary",
    opacity: "",
  },
] as const;

export const sliderBrightnessClassnames = (entity: any) => {
  const brightness = entity.attributes.brightness;

  if (entity.state === "off") return "text-theme-text-secondary";

  if (!brightness && brightness !== 0) {
    return "bg-theme-primary text-theme-text-on-primary";
  }

  const level = BRIGHTNESS_LEVELS.find(
    ({ min, max }) => brightness >= min && brightness <= max
  );
  return `${level?.classes || "text-theme-text-primary"} ${level?.opacity || ""}`.trim();
};

const TEMPERATURE_LEVELS = [
  { factor: 0, classes: "text-theme-text-primary", opacity: "opacity-25" },
  { factor: 1, classes: "text-theme-text-primary", opacity: "opacity-50" },
  { factor: 2, classes: "text-theme-text-primary", opacity: "opacity-75" },
  { factor: 3, classes: "text-theme-text-primary", opacity: "opacity-90" },
  { factor: 4, classes: "text-theme-text-primary", opacity: "" },
] as const;

export const sliderTemperatureClassnames = (
  entity: any,
  min: number,
  max: number,
  value: number
) => {
  if (entity.state === "off") return "text-theme-text-secondary";

  const range = max - min;
  const normalizedValue = value - min;
  const factor = Math.floor((normalizedValue / range) * 5);

  const level = TEMPERATURE_LEVELS.find(
    (l) => l.factor === Math.min(factor, 4)
  );
  return `${level?.classes || "text-theme-text-primary"} ${level?.opacity || ""}`.trim();
};
