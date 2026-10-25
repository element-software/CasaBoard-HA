"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const DEFAULT_MIN_TEMP = 7;
const DEFAULT_MAX_TEMP = 35;
const DEFAULT_STEP = 0.5;

export function formatModeLabel(entity: any): string {
  const action = entity?.attributes?.hvac_action as string | undefined;
  const mode = (entity?.state || entity?.attributes?.hvac_mode || "") as string;

  if (action === "heating" || mode === "heat") return "Heat";
  if (action === "cooling" || mode === "cool") return "Cool";
  if (action === "drying" || mode === "dry") return "Dry";
  if (action === "fan" || mode === "fan_only") return "Fan";
  if (mode === "heat_cool" || mode === "auto") return "Auto";
  if (mode === "off") return "Off";
  if (action === "idle") {
    if (mode === "heat") return "Heat";
    if (mode === "cool") return "Cool";
    return "Idle";
  }
  if (!mode) return "Climate";
  return mode
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function hvacModeLabel(mode: string): string {
  if (mode === "heat_cool") return "Auto";
  return mode
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export function formatTemp(value: number | null | undefined): string | null {
  if (value == null || Number.isNaN(Number(value))) return null;
  const n = Number(value);
  return Number.isInteger(n) ? String(n) : n.toFixed(1);
}

export type ThermostatController = ReturnType<typeof useThermostatController>;

export function useThermostatController(entity: any, entityId: string) {
  const [targetTemp, setTargetTemp] = useState<number>(0);

  useEffect(() => {
    if (entity?.attributes?.temperature != null) {
      setTargetTemp(entity.attributes.temperature);
    }
  }, [entity?.attributes?.temperature]);

  const minTemp = entity?.attributes?.min_temp ?? DEFAULT_MIN_TEMP;
  const maxTemp = entity?.attributes?.max_temp ?? DEFAULT_MAX_TEMP;
  const step = entity?.attributes?.target_temp_step ?? DEFAULT_STEP;
  const currentTemp = entity?.attributes?.current_temperature ?? null;
  const hvacMode = (entity?.state ?? "off") as string;
  const hvacModes: string[] = entity?.attributes?.hvac_modes ?? [];
  const fanMode: string = entity?.attributes?.fan_mode ?? "";
  const fanModes: string[] = entity?.attributes?.fan_modes ?? [];

  const modeLabel = useMemo(() => formatModeLabel(entity), [entity]);

  const setTemperature = useCallback(
    (value: number) => {
      const clamped = Math.min(maxTemp, Math.max(minTemp, value));
      setTargetTemp(clamped);
      entity?.set_temperature?.({ temperature: clamped });
    },
    [entity, minTemp, maxTemp]
  );

  const adjustTemp = useCallback(
    (delta: number) => {
      const base = targetTemp || entity?.attributes?.temperature || currentTemp || minTemp;
      setTemperature(Math.round((base + delta) / step) * step);
    },
    [targetTemp, entity?.attributes?.temperature, currentTemp, minTemp, step, setTemperature]
  );

  const setHvacMode = useCallback(
    (mode: string) => {
      entity?.set_hvac_mode?.({ hvac_mode: mode });
    },
    [entity]
  );

  const setFanMode = useCallback(
    (mode: string) => {
      entity?.set_fan_mode?.({ fan_mode: mode });
    },
    [entity]
  );

  return {
    entityId,
    name: entity?.attributes?.friendly_name || entityId || "Thermostat",
    targetTemp: targetTemp || entity?.attributes?.temperature || null,
    currentTemp,
    minTemp,
    maxTemp,
    step,
    hvacMode,
    hvacModes,
    fanMode,
    fanModes,
    modeLabel,
    setTemperature,
    adjustTemp,
    setHvacMode,
    setFanMode,
  };
}
