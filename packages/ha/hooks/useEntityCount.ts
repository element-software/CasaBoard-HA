"use client";

import { useSyncExternalStore } from "react";
import {
  getEntityCountSnapshot,
  subscribeEntityStore,
} from "../store/entityStore";

/** Reactive entity count; re-renders only when the count changes. */
export function useEntityCount(): number {
  return useSyncExternalStore(
    subscribeEntityStore,
    getEntityCountSnapshot,
    () => 0
  );
}
