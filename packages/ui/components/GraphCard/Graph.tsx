/* eslint-disable react-hooks/exhaustive-deps */
"use client";
import {
  VictoryChart,
  VictoryArea,
  VictoryAxis,
  VictoryTooltip,
  VictoryVoronoiContainer,
} from "victory";
import { useId, useMemo, useRef } from "react";
import { toChartDate } from "@casaboard/ha";
import classNames from "classnames";

interface GraphCardProps {
  data: {
    entityHistory: any[];
    unit?: string;
    lookbackMs?: number;
  };
  className?: string;
}

const DISPLAY_MAX_POINTS = 48;
const Y_EXPAND_EPS = 0.02;
const Y_SHRINK_UNUSED = 0.25;

type ChartPoint = { y: number; x: Date };

function yDomainFor(values: number[]): [number, number] {
  const min = Math.min(...values);
  const max = Math.max(...values);
  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 1];
  if (min === max) {
    const pad = Math.abs(min) * 0.05 || 1;
    return [min - pad, max + pad];
  }
  const pad = (max - min) * 0.12;
  return [min - pad, max + pad];
}

/** Keep Y scale steady: expand immediately when clipped; shrink only when mostly unused. */
function stabilizeYDomain(
  prev: [number, number] | null,
  next: [number, number]
): [number, number] {
  if (!prev) return next;
  const [pMin, pMax] = prev;
  const [nMin, nMax] = next;
  const span = pMax - pMin || 1;
  let min = pMin;
  let max = pMax;

  if (nMin < pMin - span * Y_EXPAND_EPS) min = nMin;
  if (nMax > pMax + span * Y_EXPAND_EPS) max = nMax;

  const unusedLow = min - nMin;
  const unusedHigh = max - nMax;
  if (unusedLow > span * Y_SHRINK_UNUSED || unusedHigh > span * Y_SHRINK_UNUSED) {
    return next;
  }
  return [min, max];
}

function downsample(data: ChartPoint[], maxPoints: number): ChartPoint[] {
  if (data.length <= maxPoints) return data;
  const out: ChartPoint[] = new Array(maxPoints);
  const last = data.length - 1;
  const step = last / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    out[i] = data[Math.round(i * step)]!;
  }
  out[maxPoints - 1] = data[last]!;
  return out;
}

function stabilizeXDomain(
  prev: [Date, Date] | null,
  endMs: number,
  lookbackMs: number
): [Date, Date] {
  const next: [Date, Date] = [
    new Date(endMs - lookbackMs),
    new Date(endMs),
  ];
  if (!prev) return next;
  const prevEnd = prev[1].getTime();
  // Only nudge the window forward when time advanced meaningfully (≥2% of window)
  if (endMs - prevEnd < lookbackMs * 0.02) {
    return prev;
  }
  return next;
}

const Graph = ({ data, className }: GraphCardProps) => {
  const reactGradientId = useId();
  const gradientId = useMemo(
    () => `graph-grad-${reactGradientId.replace(/[^a-zA-Z0-9_-]/g, "")}`,
    [reactGradientId]
  );

  const lookbackMs = data?.lookbackMs ?? 24 * 60 * 60 * 1000;
  const domainYRef = useRef<[number, number] | null>(null);
  const domainXRef = useRef<[Date, Date] | null>(null);

  const processedData = useMemo(() => {
    if (!data?.entityHistory || !Array.isArray(data.entityHistory)) {
      return [];
    }
    const points = data.entityHistory
      .map((item: any) => {
        const y = parseFloat(String(item.s ?? item.state ?? ""));
        if (!Number.isFinite(y)) return null;
        const time = item.lu || item.last_updated || item.last_changed;
        return {
          y,
          x: toChartDate(time),
        };
      })
      .filter((p: ChartPoint | null): p is ChartPoint => p != null);
    return downsample(points, DISPLAY_MAX_POINTS);
  }, [data?.entityHistory]);

  const domainY = useMemo(() => {
    if (processedData.length === 0) return [0, 1] as [number, number];
    const next = yDomainFor(processedData.map((d) => d.y));
    const stable = stabilizeYDomain(domainYRef.current, next);
    domainYRef.current = stable;
    return stable;
  }, [processedData]);

  const domainX = useMemo(() => {
    if (processedData.length === 0) {
      const end = Date.now();
      return [new Date(end - lookbackMs), new Date(end)] as [Date, Date];
    }
    const endMs = processedData[processedData.length - 1]!.x.getTime();
    const stable = stabilizeXDomain(domainXRef.current, endMs, lookbackMs);
    domainXRef.current = stable;
    return stable;
  }, [processedData, lookbackMs]);

  const unit = data?.unit || "W";

  if (processedData.length < 2) {
    return null;
  }

  return (
    <div
      className={classNames(
        "relative w-full overflow-hidden leading-none",
        className
      )}
    >
      <svg
        width={0}
        height={0}
        className="absolute overflow-hidden"
        aria-hidden
        focusable="false"
      >
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop
              offset="0%"
              stopColor="var(--theme-chart-fill)"
              stopOpacity={0.55}
            />
            <stop
              offset="100%"
              stopColor="var(--theme-chart-fill)"
              stopOpacity={0.05}
            />
          </linearGradient>
        </defs>
      </svg>
      <VictoryChart
        height={160}
        width={640}
        padding={{ top: 6, bottom: 0, left: 0, right: 0 }}
        domain={{ x: domainX, y: domainY }}
        scale={{ x: "time", y: "linear" }}
        style={{
          parent: {
            width: "100%",
            height: "100%",
            display: "block",
          },
        }}
        containerComponent={
          <VictoryVoronoiContainer
            labels={({ datum }) =>
              `${Number(datum.y).toFixed(2)}${unit} at ${datum.x ? new Date(datum.x).toLocaleTimeString() : ""}`
            }
            labelComponent={
              <VictoryTooltip
                flyoutStyle={{
                  fill: "rgba(0, 0, 0, 0.9)",
                  stroke: "white",
                  strokeWidth: 1,
                }}
                style={{
                  fill: "white",
                  fontSize: 14,
                  fontWeight: 600,
                }}
                constrainToVisibleArea
              />
            }
          />
        }
      >
        <VictoryAxis
          style={{
            axis: { stroke: "transparent" },
            ticks: { stroke: "transparent" },
            tickLabels: { fill: "transparent", fontSize: 0 },
            grid: { stroke: "transparent" },
          }}
        />
        <VictoryAxis
          dependentAxis
          style={{
            axis: { stroke: "transparent" },
            ticks: { stroke: "transparent" },
            tickLabels: { fill: "transparent", fontSize: 0 },
            grid: { stroke: "transparent" },
          }}
        />
        <VictoryArea
          data={processedData}
          interpolation="monotoneX"
          // Baseline at zoomed domain min — default y0=0 flattens high-range sensors (W, V)
          y0={() => domainY[0]}
          style={{
            data: {
              fill: `url(#${gradientId})`,
              fillOpacity: 1,
              stroke: "var(--theme-chart-line)",
              strokeWidth: 2,
              strokeLinecap: "round",
              strokeLinejoin: "round",
            },
          }}
          animate={{
            duration: 250,
            onLoad: { duration: 0 },
          }}
        />
      </VictoryChart>
    </div>
  );
};

export default Graph;
