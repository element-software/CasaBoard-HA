"use client";
import React, { useCallback, useMemo } from "react";
import { useDebouncedSlider } from "@repo/hooks/useDebounce";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";

export interface UseLightControllerOptions {
  /** @deprecated Prefer modal brightness; drag fill kept optional. */
  dimmer?: boolean;
}

export function useLightLoading(entity: any, timeoutMs: number = 10000) {
  return useEntityLoading(entity, { timeoutMs });
}

export function supportsFeature(entity: any, bit: number): boolean {
  const features = entity?.attributes?.supported_features ?? 0;
  return (features & bit) === bit;
}

/** HA light supported_features bits */
export const SUPPORT_BRIGHTNESS = 1;
export const SUPPORT_COLOR_TEMP = 2;
export const SUPPORT_COLOR = 16; // SUPPORT_COLOR / hs / rgb varies; 16 is COLOR historically in some versions — also check attrs

export function hasBrightness(entity: any): boolean {
  if (!entity) return false;
  if (entity.attributes?.brightness != null) return true;
  return supportsFeature(entity, SUPPORT_BRIGHTNESS);
}

export function hasColorTemp(entity: any): boolean {
  if (!entity) return false;
  if (
    entity.attributes?.color_temp_kelvin != null ||
    entity.attributes?.min_color_temp_kelvin != null
  ) {
    return true;
  }
  return supportsFeature(entity, SUPPORT_COLOR_TEMP);
}

export function hasColor(entity: any): boolean {
  if (!entity) return false;
  if (entity.attributes?.rgb_color != null || entity.attributes?.hs_color != null) {
    return true;
  }
  const modes: string[] | undefined = entity.attributes?.supported_color_modes;
  if (modes?.some((m) => ["hs", "rgb", "rgbw", "rgbww", "xy"].includes(m))) {
    return true;
  }
  return supportsFeature(entity, SUPPORT_COLOR);
}

export function useLightController(entity: any, entityId: string, _options: UseLightControllerOptions = {}) {
  const entityBrightness: number = entity?.attributes?.brightness || 0;
  const brightnessPercentage: number = Math.round((entityBrightness / 255) * 100);
  const isOn: boolean = entity?.state === "on";

  const canBrightness = useMemo(() => hasBrightness(entity), [entity]);
  const canColorTemp = useMemo(() => hasColorTemp(entity), [entity]);
  const canColor = useMemo(() => hasColor(entity), [entity]);

  const setBrightnessImmediate = useCallback(
    (value: number) => {
      entity?.callService?.("turn_on", { brightness: value });
    },
    [entity]
  );

  const setTemperatureImmediate = useCallback(
    (value: number) => {
      entity?.callService?.("turn_on", {
        // @ts-ignore Home Assistant service data key
        color_temp_kelvin: value,
      });
    },
    [entity]
  );

  const setColorImmediate = useCallback(
    (value: string) => {
      const r = parseInt(value.substring(1, 3), 16);
      const g = parseInt(value.substring(3, 5), 16);
      const b = parseInt(value.substring(5, 7), 16);
      entity?.callService?.("turn_on", { rgb_color: [r, g, b] });
    },
    [entity]
  );

  const debouncedSetBrightness = useDebouncedSlider(setBrightnessImmediate, 150);
  const debouncedSetTemperature = useDebouncedSlider(setTemperatureImmediate, 150);
  const debouncedSetColor = useDebouncedSlider(setColorImmediate, 150);

  const handleBrightnessChange = useCallback(
    (value: number) => {
      debouncedSetBrightness(value);
    },
    [debouncedSetBrightness]
  );

  const handleToggle = useCallback(() => {
    entity?.toggle?.();
  }, [entity]);

  return {
    isOn,
    brightnessPercentage,
    canBrightness,
    canColorTemp,
    canColor,
    handleToggle,
    handleBrightnessChange,
    debouncedSetTemperature,
    debouncedSetColor,
    entityId,
  };
}
