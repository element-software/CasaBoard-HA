export interface EntityHistoryPoint {
  /** State value (numeric sensors as string) */
  s: string;
  /** Last updated — ISO string, unix seconds, or unix milliseconds */
  lu: string | number;
}

/** HA compressed timestamps are seconds; JS Date needs ms when value looks like seconds. */
export function toChartDate(
  time: string | number | Date | null | undefined
): Date {
  if (time == null) return new Date();
  if (time instanceof Date) return time;
  if (typeof time === "number") {
    return new Date(time < 1e12 ? time * 1000 : time);
  }
  const trimmed = String(time).trim();
  if (
    trimmed !== "" &&
    !trimmed.includes("-") &&
    !trimmed.includes("T") &&
    !trimmed.includes(":")
  ) {
    const asNum = Number(trimmed);
    if (Number.isFinite(asNum)) {
      return new Date(asNum < 1e12 ? asNum * 1000 : asNum);
    }
  }
  return new Date(trimmed);
}

function isFiniteNumericState(value: unknown): boolean {
  const n = typeof value === "number" ? value : parseFloat(String(value ?? ""));
  return Number.isFinite(n);
}

/** Normalize a raw history list (WS compressed or full state objects). */
export function normalizeHistoryList(list: unknown): EntityHistoryPoint[] {
  if (!Array.isArray(list)) return [];
  return list
    .map((item: any) => {
      const s = item?.s ?? item?.state;
      const lu = item?.lu ?? item?.last_updated ?? item?.last_changed;
      if (s == null || lu == null || !isFiniteNumericState(s)) return null;
      return { s: String(s), lu: lu as string | number };
    })
    .filter((p): p is EntityHistoryPoint => p != null);
}

/** Parse history/history_during_period (object map or legacy array-of-arrays). */
export function normalizeHistoryResponse(
  data: unknown,
  entityId: string
): EntityHistoryPoint[] {
  if (data == null) return [];
  if (Array.isArray(data)) {
    return normalizeHistoryList(data[0] ?? []);
  }
  if (typeof data === "object") {
    const map = data as Record<string, unknown>;
    return normalizeHistoryList(map[entityId] ?? []);
  }
  return [];
}

/** Parse recorder/statistics_during_period series for one entity. */
export function normalizeStatisticsSeries(series: unknown): EntityHistoryPoint[] {
  if (!Array.isArray(series)) return [];
  return series
    .map((row: any) => {
      const mean = row?.mean ?? row?.state;
      const start = row?.start;
      if (mean == null || start == null || !isFiniteNumericState(mean)) {
        return null;
      }
      return { s: String(mean), lu: start as string | number };
    })
    .filter((p): p is EntityHistoryPoint => p != null)
    .sort((a, b) => toChartDate(a.lu).getTime() - toChartDate(b.lu).getTime());
}

export function normalizeStatisticsResponse(
  data: unknown,
  entityId: string
): EntityHistoryPoint[] {
  if (data == null || typeof data !== "object") return [];
  const series = (data as Record<string, unknown>)[entityId];
  return normalizeStatisticsSeries(series);
}

/** Replace the last point when updates arrive within this window (ms). */
export const LIVE_COALESCE_MS = 60_000;

/**
 * Append a live state sample. Frequent updates within `coalesceMs` replace the
 * last point instead of growing the series (reduces chart redraw churn).
 */
export function appendLivePoint(
  points: EntityHistoryPoint[],
  state: string | number,
  lastUpdated: string | number | undefined,
  limit: number,
  coalesceMs: number = LIVE_COALESCE_MS
): EntityHistoryPoint[] {
  if (!isFiniteNumericState(state)) return points;
  const next: EntityHistoryPoint = {
    s: String(state),
    lu: lastUpdated ?? new Date().toISOString(),
  };
  if (points.length === 0) return [next];

  const last = points[points.length - 1]!;
  const lastMs = toChartDate(last.lu).getTime();
  const nextMs = toChartDate(next.lu).getTime();
  if (
    coalesceMs > 0 &&
    Number.isFinite(lastMs) &&
    Number.isFinite(nextMs) &&
    nextMs - lastMs < coalesceMs
  ) {
    return [...points.slice(0, -1), next];
  }

  const merged = [...points, next];
  return merged.length > limit ? merged.slice(-limit) : merged;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  label: string
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      promise,
      new Promise<never>((_, reject) => {
        timer = setTimeout(
          () => reject(new Error(`${label} timed out after ${ms}ms`)),
          ms
        );
      }),
    ]);
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
