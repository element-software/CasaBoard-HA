/**
 * Pure matching logic for event-triggered popups. Kept free of React and HA
 * connection types so it can be unit-tested and reused outside CasaBoard.
 */

export type PopupTriggerMode =
  /** Fire when the new state equals `toState` (optionally only from `fromState`). */
  | "to_state"
  /** Fire on any state change (e.g. `event.*` entities, whose state is a timestamp). */
  | "any_change";

export interface PopupTriggerConfig {
  triggerMode: PopupTriggerMode;
  toState?: string;
  fromState?: string;
  cooldownSeconds?: number;
}

/** States that mean "HA lost the device", not "the device did something". */
const NON_EVENT_STATES = new Set(["unavailable", "unknown"]);

function normalizeState(value: string | undefined): string {
  return (value ?? "").trim().toLowerCase();
}

/**
 * Whether a state transition should fire the popup. Transitions to or from
 * `unavailable` / `unknown` never fire, so device reconnects stay silent.
 */
export function matchesTrigger(
  config: PopupTriggerConfig,
  prevState: string | undefined,
  nextState: string | undefined
): boolean {
  if (prevState === undefined || nextState === undefined) return false;
  if (prevState === nextState) return false;
  if (NON_EVENT_STATES.has(prevState) || NON_EVENT_STATES.has(nextState)) {
    return false;
  }

  if (config.triggerMode === "any_change") return true;

  const to = normalizeState(config.toState);
  if (!to || normalizeState(nextState) !== to) return false;

  const from = normalizeState(config.fromState);
  return !from || normalizeState(prevState) === from;
}

/** Whether the cooldown since the last fire has elapsed. */
export function isOutsideCooldown(
  config: Pick<PopupTriggerConfig, "cooldownSeconds">,
  now: number,
  lastFiredAt: number | undefined
): boolean {
  if (lastFiredAt === undefined) return true;
  const cooldownMs = Math.max(0, Number(config.cooldownSeconds) || 0) * 1000;
  return now - lastFiredAt >= cooldownMs;
}
