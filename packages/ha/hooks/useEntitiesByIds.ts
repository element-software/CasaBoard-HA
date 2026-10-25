"use client";

import { useSyncExternalStore } from "react";
import {
  getEntitiesByIdsSnapshot,
  subscribeEntityStore,
  type HassEntityMap,
} from "../store/entityStore";

const EMPTY_MAP: HassEntityMap = {};

/** Reactive map for a fixed set of entity ids. */
export function useEntitiesByIds(entityIds: string[]): HassEntityMap {
  return useSyncExternalStore(
    subscribeEntityStore,
    () =>
      entityIds.length === 0
        ? EMPTY_MAP
        : getEntitiesByIdsSnapshot(entityIds),
    () => EMPTY_MAP
  );
}
