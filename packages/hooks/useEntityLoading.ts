"use client";

import { useEffect, useState, useMemo } from "react";

export interface UseEntityLoadingOptions {
  timeoutMs?: number;
  isReadyPredicate?: (entity: any) => boolean;
}

/**
 * Generic loading/availability hook for HA entities.
 * Mirrors Light's behavior: shows skeleton until entity becomes ready or
 * until a timeout elapses, then shows a not-available state.
 */
export function useEntityLoading(entity: any, options: UseEntityLoadingOptions = {}) {
  const { timeoutMs = 10000, isReadyPredicate } = options;

  const isEntityReady = useMemo(() => {
    if (typeof isReadyPredicate === "function") {
      return isReadyPredicate(entity);
    }
    return !!entity && entity.state !== "unknown" && entity.state !== "unavailable";
  }, [entity, isReadyPredicate]);

  const [unavailableTimeoutReached, setUnavailableTimeoutReached] = useState(false);

  useEffect(() => {
    let timeout: any;
    const isUnknownOrUnavailable = !isEntityReady;
    if (isUnknownOrUnavailable) {
      setUnavailableTimeoutReached(false);
      timeout = setTimeout(() => {
        setUnavailableTimeoutReached(true);
      }, timeoutMs);
    } else {
      setUnavailableTimeoutReached(false);
    }

    return () => {
      if (timeout) clearTimeout(timeout);
    };
  }, [isEntityReady, timeoutMs]);

  const showNotAvailable = !isEntityReady && unavailableTimeoutReached;
  const isLoaded = isEntityReady || showNotAvailable;

  return { isEntityReady, showNotAvailable, isLoaded };
}


