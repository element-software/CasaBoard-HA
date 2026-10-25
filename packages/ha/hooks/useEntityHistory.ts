"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Connection } from "home-assistant-js-websocket";
import { useHA } from "../provider/HAProvider";
import {
  appendLivePoint,
  normalizeHistoryResponse,
  normalizeStatisticsResponse,
  type EntityHistoryPoint,
  withTimeout,
} from "./entityHistory";

export type { EntityHistoryPoint } from "./entityHistory";

type HistoryMode = "history" | "statistics";

const FETCH_TIMEOUT_MS = 8_000;

async function fetchStatistics(
  conn: Connection,
  id: string,
  start: Date,
  end: Date,
  period: "5minute" | "hour" = "5minute"
): Promise<EntityHistoryPoint[]> {
  const stats = await withTimeout(
    conn.sendMessagePromise<unknown>({
      type: "recorder/statistics_during_period",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      statistic_ids: [id],
      period,
    }),
    FETCH_TIMEOUT_MS,
    "recorder/statistics_during_period"
  );
  return normalizeStatisticsResponse(stats, id);
}

async function fetchHistoryWs(
  conn: Connection,
  id: string,
  start: Date,
  end: Date
): Promise<EntityHistoryPoint[]> {
  const data = await withTimeout(
    conn.sendMessagePromise<unknown>({
      type: "history/history_during_period",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      entity_ids: [id],
      minimal_response: true,
      no_attributes: true,
      include_start_time_state: true,
      significant_changes_only: false,
    }),
    FETCH_TIMEOUT_MS,
    "history/history_during_period"
  );
  return normalizeHistoryResponse(data, id);
}

async function fetchHistoryRest(
  hassUrl: string,
  accessToken: string,
  id: string,
  start: Date,
  end: Date,
  signal?: AbortSignal
): Promise<EntityHistoryPoint[]> {
  const base = hassUrl.replace(/\/$/, "");
  const url =
    `${base}/api/history/period/${encodeURIComponent(start.toISOString())}` +
    `?filter_entity_id=${encodeURIComponent(id)}` +
    `&end_time=${encodeURIComponent(end.toISOString())}` +
    `&minimal_response`;

  const res = await withTimeout(
    fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal,
    }),
    FETCH_TIMEOUT_MS,
    "REST /api/history/period"
  );
  if (!res.ok) {
    throw new Error(`REST history failed: ${res.status}`);
  }
  const data = await res.json();
  return normalizeHistoryResponse(data, id);
}

export function useEntityHistory(
  entityId: string | null | undefined,
  limit: number = 50,
  lookbackMs: number = 24 * 60 * 60 * 1000,
  mode: HistoryMode = "history"
) {
  const { connection, auth, hassUrl } = useHA();
  const [points, setPoints] = useState<EntityHistoryPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const fetchedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    fetchedRef.current = false;
    abortRef.current?.abort();
    const abort = new AbortController();
    abortRef.current = abort;

    async function loadHistory(conn: Connection, id: string) {
      setLoading(true);
      setError(null);

      const end = new Date();
      const start = new Date(end.getTime() - lookbackMs);
      // Prefer 5-minute buckets for ≤48h; hourly for longer windows
      const statsPeriod = lookbackMs > 48 * 60 * 60 * 1000 ? "hour" : "5minute";

      const attempts: Array<() => Promise<EntityHistoryPoint[]>> =
        mode === "statistics"
          ? [
              () => fetchStatistics(conn, id, start, end, statsPeriod),
              () => fetchHistoryWs(conn, id, start, end),
            ]
          : [
              () => fetchHistoryWs(conn, id, start, end),
              () => fetchStatistics(conn, id, start, end, statsPeriod),
            ];

      const token = auth?.accessToken ?? auth?.data?.access_token;
      if (hassUrl && token) {
        attempts.push(() =>
          fetchHistoryRest(hassUrl, token, id, start, end, abort.signal)
        );
      }

      let lastErr: Error | null = null;
      for (const attempt of attempts) {
        if (cancelled || abort.signal.aborted) return;
        try {
          const parsed = await attempt();
          if (parsed.length > 0) {
            if (!cancelled) {
              setPoints(parsed.slice(-limit));
              fetchedRef.current = true;
              setError(null);
            }
            return;
          }
        } catch (err: any) {
          lastErr = err instanceof Error ? err : new Error(String(err));
        }
      }

      if (!cancelled && lastErr) {
        setError(lastErr);
      }
    }

    if (!connection || !entityId) {
      setPoints([]);
      setLoading(false);
      return () => {
        cancelled = true;
        abort.abort();
      };
    }

    loadHistory(connection as Connection, entityId).finally(() => {
      if (!cancelled) setLoading(false);
    });

    let unsubscribe: (() => void) | null = null;
    connection
      .subscribeEvents((event: any) => {
        if (event.data?.entity_id !== entityId) return;
        const newState = event.data?.new_state;
        if (!newState) return;
        setPoints((prev) =>
          appendLivePoint(
            prev,
            newState.state,
            newState.last_updated ?? newState.last_changed,
            limit
          )
        );
      }, "state_changed")
      .then((unsub) => {
        if (cancelled) {
          unsub();
          return;
        }
        unsubscribe = unsub;
      });

    return () => {
      cancelled = true;
      abort.abort();
      unsubscribe?.();
    };
  }, [
    connection,
    entityId,
    limit,
    lookbackMs,
    mode,
    auth?.accessToken,
    auth?.data?.access_token,
    hassUrl,
  ]);

  const history = useMemo(() => points, [points]);
  return { history, loading, error };
}
