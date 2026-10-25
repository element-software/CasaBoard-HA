"use client";
import { useSyncExternalStore } from "react";
import {
  getDomainEntitiesSnapshot,
  subscribeEntityStore,
  type EntitySummary,
} from "../store/entityStore";

export type HAEntitySummary = EntitySummary;

export function useEntities(domain?: string): HAEntitySummary[] {
  const domainKey = domain?.toLowerCase() ?? "";
  return useSyncExternalStore(
    subscribeEntityStore,
    () => getDomainEntitiesSnapshot(domainKey || undefined),
    () => EMPTY_LIST
  );
}

const EMPTY_LIST: HAEntitySummary[] = [];
