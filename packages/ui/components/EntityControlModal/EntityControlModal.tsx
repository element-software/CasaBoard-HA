"use client";

import { useMemo } from "react";
import Popup from "../Popup";
import { Slider } from "../RangeSlider/RangeSlider";
import EntityIcon from "../Shared/util/EntityIcon";

export type EntityControlModalProps = {
  open: boolean;
  setOpen: (open: boolean) => void;
  entity: any;
  entityId: string;
  /** Show brightness controls (lights). */
  showBrightness?: boolean;
  /** Show color picker when supported. */
  showColor?: boolean;
  /** Show color temperature when supported. */
  showTemperature?: boolean;
  brightnessPercentage?: number;
  onBrightnessChange?: (brightness0to255: number) => void;
  onColorChange?: (hex: string) => void;
  onTemperatureChange?: (kelvin: number) => void;
  onToggle?: () => void;
};

function rgbToHex(rgb?: number[]): string {
  if (!rgb || rgb.length < 3) return "#ffcc00";
  const [r, g, b] = rgb;
  return (
    "#" +
    [r, g, b]
      .map((c) => Math.max(0, Math.min(255, c ?? 0)).toString(16).padStart(2, "0"))
      .join("")
  );
}

export function EntityControlModal({
  open,
  setOpen,
  entity,
  entityId,
  showBrightness = false,
  showColor = false,
  showTemperature = false,
  brightnessPercentage = 0,
  onBrightnessChange,
  onColorChange,
  onTemperatureChange,
  onToggle,
}: EntityControlModalProps) {
  const name =
    entity?.attributes?.friendly_name || entity?.entity_id || entityId;
  const isOn = entity?.state === "on";
  const minKelvin = entity?.attributes?.min_color_temp_kelvin ?? 2000;
  const maxKelvin = entity?.attributes?.max_color_temp_kelvin ?? 6500;
  const kelvin =
    entity?.attributes?.color_temp_kelvin ??
    Math.round((minKelvin + maxKelvin) / 2);
  const hex = useMemo(
    () => rgbToHex(entity?.attributes?.rgb_color),
    [entity?.attributes?.rgb_color]
  );

  const hasControls = showBrightness || showColor || showTemperature;

  return (
    <Popup open={open} setOpen={setOpen} className="bg-theme-surface text-theme-text max-w-md">
      <div className="flex flex-col gap-5 pr-8">
        <div className="flex items-center gap-3">
          {entity && (
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-theme-interactive-hover">
              <EntityIcon entity={entity} className="h-7 w-7" />
            </div>
          )}
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{name}</h2>
            <p className="text-sm text-theme-text-secondary">
              {isOn
                ? showBrightness
                  ? `On · ${brightnessPercentage}%`
                  : "On"
                : "Off"}
            </p>
          </div>
        </div>

        {onToggle && (
          <button
            type="button"
            onClick={onToggle}
            className="w-full rounded-xl bg-theme-interactive-hover px-4 py-3 text-sm font-semibold text-theme-text hover:bg-theme-interactive-active transition-colors"
          >
            {isOn ? "Turn Off" : "Turn On"}
          </button>
        )}

        {hasControls && isOn && (
          <div className="flex flex-col gap-4">
            {showBrightness && onBrightnessChange && (
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium text-theme-text-secondary uppercase tracking-wide">
                  Brightness
                </span>
                <Slider
                  min={1}
                  max={255}
                  step={1}
                  value={Math.max(1, Math.round((brightnessPercentage / 100) * 255))}
                  onChange={onBrightnessChange}
                />
                <span className="text-xs text-theme-text-muted self-end">
                  {brightnessPercentage}%
                </span>
              </label>
            )}

            {showTemperature && onTemperatureChange && (
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium text-theme-text-secondary uppercase tracking-wide">
                  Color temperature
                </span>
                <Slider
                  min={minKelvin}
                  max={maxKelvin}
                  step={50}
                  value={kelvin}
                  onChange={onTemperatureChange}
                />
                <span className="text-xs text-theme-text-muted self-end">
                  {kelvin} K
                </span>
              </label>
            )}

            {showColor && onColorChange && (
              <label className="flex flex-col gap-2">
                <span className="text-xs font-medium text-theme-text-secondary uppercase tracking-wide">
                  Color
                </span>
                <input
                  type="color"
                  value={hex}
                  onChange={(e) => onColorChange(e.target.value)}
                  className="h-10 w-full cursor-pointer rounded-lg border-0 bg-transparent"
                />
              </label>
            )}
          </div>
        )}

        {!hasControls && (
          <p className="text-sm text-theme-text-secondary">
            Use the button above to toggle this device.
          </p>
        )}
      </div>
    </Popup>
  );
}
