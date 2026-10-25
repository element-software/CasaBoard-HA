"use client";

import { useEffect } from "react";
import type { EventPopupRule } from "@repo/types/eventPopup";
import { EventPopupModal } from "./EventPopupModal";
import { useEventPopupTriggers } from "./useEventPopupTriggers";

export interface EventPopupHostProps {
  rules?: EventPopupRule[];
}

const NO_RULES: EventPopupRule[] = [];

/** Viewer-only: listens for the page's popup rules and shows the active popup. */
export function EventPopupHost({ rules = NO_RULES }: EventPopupHostProps) {
  const { active, dismiss } = useEventPopupTriggers(rules);
  const autoCloseSeconds = Math.max(
    0,
    Number(active?.rule.autoCloseSeconds) || 0
  );

  // Keyed on firedAt so a re-trigger restarts the timer.
  useEffect(() => {
    if (!active || autoCloseSeconds === 0) return;
    const id = window.setTimeout(dismiss, autoCloseSeconds * 1000);
    return () => window.clearTimeout(id);
  }, [active?.firedAt, autoCloseSeconds, dismiss]);

  if (!active) return null;

  return (
    <EventPopupModal
      // New camera → fresh stream; re-trigger of the same camera keeps it.
      key={active.rule.cameraEntityId}
      rule={active.rule}
      firedAt={active.firedAt}
      onClose={dismiss}
    />
  );
}
