"use client";

import Icon from "@mdi/react";
import {
  mdiAutorenew,
  mdiFan,
  mdiFire,
  mdiMinus,
  mdiPlus,
  mdiPower,
  mdiSnowflake,
  mdiWaterPercent,
} from "@mdi/js";
import Popup from "../Popup";
import { formatTemp, hvacModeLabel, type ThermostatController } from "./useThermostat";

type Props = {
  open: boolean;
  setOpen: (open: boolean) => void;
  thermostat: ThermostatController;
};

const GAUGE_START = 225;
const GAUGE_SWEEP = 270;
const GAUGE_SIZE = 240;
const GAUGE_RADIUS = 100;
const GAUGE_STROKE = 16;

function polarToCartesian(cx: number, cy: number, r: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(angleRad), y: cy + r * Math.sin(angleRad) };
}

function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
  const start = polarToCartesian(cx, cy, r, endAngle);
  const end = polarToCartesian(cx, cy, r, startAngle);
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  return ["M", start.x, start.y, "A", r, r, 0, largeArcFlag, 0, end.x, end.y].join(" ");
}

function hvacModeIcon(mode: string): string {
  switch (mode) {
    case "heat":
      return mdiFire;
    case "cool":
      return mdiSnowflake;
    case "heat_cool":
    case "auto":
      return mdiAutorenew;
    case "dry":
      return mdiWaterPercent;
    case "fan_only":
      return mdiFan;
    default:
      return mdiPower;
  }
}

function hvacModeColorVar(mode: string): string {
  switch (mode) {
    case "heat":
      return "var(--theme-warning, #ff9f0a)";
    case "cool":
      return "var(--theme-info, #007aff)";
    case "heat_cool":
    case "auto":
      return "var(--theme-success, #34c759)";
    case "dry":
      return "var(--theme-info, #007aff)";
    case "fan_only":
      return "var(--theme-text-muted, #8e8e93)";
    default:
      return "var(--theme-text-muted, #8e8e93)";
  }
}

function ThermostatGauge({ thermostat }: { thermostat: ThermostatController }) {
  const { targetTemp, currentTemp, minTemp, maxTemp, hvacMode } = thermostat;
  const cx = GAUGE_SIZE / 2;
  const cy = GAUGE_SIZE / 2;
  const range = Math.max(1, maxTemp - minTemp);
  const accent = hvacModeColorVar(hvacMode);

  const targetPct = Math.min(1, Math.max(0, ((targetTemp ?? minTemp) - minTemp) / range));
  const targetAngle = GAUGE_START + targetPct * GAUGE_SWEEP;
  const trackPath = describeArc(cx, cy, GAUGE_RADIUS, GAUGE_START, GAUGE_START + GAUGE_SWEEP);
  const progressPath = describeArc(cx, cy, GAUGE_RADIUS, GAUGE_START, targetAngle);

  const currentPct =
    currentTemp != null ? Math.min(1, Math.max(0, (currentTemp - minTemp) / range)) : null;
  const currentPoint =
    currentPct != null
      ? polarToCartesian(cx, cy, GAUGE_RADIUS, GAUGE_START + currentPct * GAUGE_SWEEP)
      : null;

  return (
    <svg viewBox={`0 0 ${GAUGE_SIZE} ${GAUGE_SIZE}`} className="thermostat-gauge">
      <path
        d={trackPath}
        fill="none"
        stroke="var(--theme-border, rgba(127,127,127,0.25))"
        strokeWidth={GAUGE_STROKE}
        strokeLinecap="round"
      />
      <path
        d={progressPath}
        fill="none"
        stroke={accent}
        strokeWidth={GAUGE_STROKE}
        strokeLinecap="round"
      />
      {currentPoint && (
        <circle
          cx={currentPoint.x}
          cy={currentPoint.y}
          r={5}
          fill="var(--theme-surface, #fff)"
          stroke={accent}
          strokeWidth={3}
        />
      )}
      <text x={cx} y={cy - 6} textAnchor="middle" className="thermostat-gauge__value">
        {formatTemp(targetTemp) ?? "--"}°
      </text>
      <text x={cx} y={cy + 22} textAnchor="middle" className="thermostat-gauge__current">
        {currentTemp != null ? `Now ${formatTemp(currentTemp)}°` : "No sensor"}
      </text>
    </svg>
  );
}

export function ThermostatControlModal({ open, setOpen, thermostat }: Props) {
  const {
    name,
    entityId,
    modeLabel,
    hvacMode,
    hvacModes,
    fanMode,
    fanModes,
    step,
    adjustTemp,
    setHvacMode,
    setFanMode,
  } = thermostat;

  return (
    <Popup open={open} setOpen={setOpen} className="bg-theme-surface text-theme-text max-w-lg">
      <div className="thermostat-modal flex flex-col gap-5">
        <div className="pr-8">
          <h2 className="truncate text-lg font-semibold">{name}</h2>
          <p className="truncate text-sm text-theme-text-secondary">{modeLabel || entityId}</p>
        </div>

        <div className="flex flex-col items-center gap-3">
          <ThermostatGauge thermostat={thermostat} />
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="thermostat-modal__btn"
              aria-label="Decrease target temperature"
              onClick={() => adjustTemp(-step)}
            >
              <Icon path={mdiMinus} className="h-5 w-5" />
            </button>
            <button
              type="button"
              className="thermostat-modal__btn"
              aria-label="Increase target temperature"
              onClick={() => adjustTemp(step)}
            >
              <Icon path={mdiPlus} className="h-5 w-5" />
            </button>
          </div>
        </div>

        {hvacModes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
              Mode
            </span>
            <div className="flex flex-wrap gap-2">
              {hvacModes.map((mode) => (
                <button
                  key={mode}
                  type="button"
                  className={`thermostat-modal__mode ${mode === hvacMode ? "thermostat-modal__mode--active" : ""}`}
                  style={mode === hvacMode ? { color: hvacModeColorVar(mode) } : undefined}
                  aria-pressed={mode === hvacMode}
                  onClick={() => setHvacMode(mode)}
                >
                  <Icon path={hvacModeIcon(mode)} className="h-4 w-4" />
                  {hvacModeLabel(mode)}
                </button>
              ))}
            </div>
          </div>
        )}

        {fanModes.length > 0 && (
          <label className="flex flex-col gap-2">
            <span className="text-xs font-medium uppercase tracking-wide text-theme-text-secondary">
              Fan mode
            </span>
            <select
              className="thermostat-modal__select"
              value={fanMode}
              onChange={(e) => setFanMode(e.target.value)}
            >
              {!fanMode && <option value="">Select fan mode…</option>}
              {fanModes.map((mode) => (
                <option key={mode} value={mode}>
                  {mode}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </Popup>
  );
}
