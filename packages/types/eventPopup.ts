export type EventPopupTriggerMode = "to_state" | "any_change";

/** One per-page rule: when `triggerEntityId` changes, show `cameraEntityId` in a popup. */
export interface EventPopupRule {
  /** Popup title; falls back to the camera friendly name. */
  name?: string;
  enabled: boolean;

  triggerEntityId: string;
  triggerMode: EventPopupTriggerMode;
  /** Required for `to_state`, e.g. "on". */
  toState?: string;
  /** Optional guard for `to_state`, e.g. "off". */
  fromState?: string;
  /** Ignore re-triggers within this many seconds. */
  cooldownSeconds: number;

  cameraEntityId: string;
  /** Allow unmuting camera audio (streams always start muted). */
  allowAudio: boolean;

  /** 0 keeps the popup open until dismissed. */
  autoCloseSeconds: number;
}

export const DEFAULT_EVENT_POPUP_RULE: EventPopupRule = {
  name: "",
  enabled: true,
  triggerEntityId: "",
  triggerMode: "to_state",
  toState: "on",
  fromState: "",
  cooldownSeconds: 30,
  cameraEntityId: "",
  allowAudio: false,
  autoCloseSeconds: 30,
};
