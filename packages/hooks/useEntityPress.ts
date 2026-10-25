"use client";

import { useCallback, useRef } from "react";

const LONG_PRESS_MS = 600;

export type UseEntityPressOptions = {
  onTap: () => void;
  onLongPress: () => void;
  enabled?: boolean;
  longPressMs?: number;
};

/**
 * Pointer-based short press vs long press (Alarm pattern).
 * Long press suppresses the subsequent tap.
 */
export function useEntityPress({
  onTap,
  onLongPress,
  enabled = true,
  longPressMs = LONG_PRESS_MS,
}: UseEntityPressOptions) {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const handlePointerDown = useCallback(() => {
    if (!enabled) return;
    didLongPress.current = false;
    clearTimer();
    timerRef.current = setTimeout(() => {
      didLongPress.current = true;
      onLongPress();
    }, longPressMs);
  }, [enabled, clearTimer, onLongPress, longPressMs]);

  const handlePointerUp = useCallback(() => {
    if (!enabled) return;
    clearTimer();
    if (!didLongPress.current) {
      onTap();
    }
  }, [enabled, clearTimer, onTap]);

  const handlePointerLeave = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  const handlePointerCancel = useCallback(() => {
    clearTimer();
  }, [clearTimer]);

  return {
    onPointerDown: handlePointerDown,
    onPointerUp: handlePointerUp,
    onPointerLeave: handlePointerLeave,
    onPointerCancel: handlePointerCancel,
  };
}
