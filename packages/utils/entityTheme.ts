/** Maps Home Assistant-style states to dashboard theme utility classes. */

export function binarySensorBackgroundClass(state: string): string {
  switch (state) {
    case "on":
      return "bg-theme-entity-on";
    case "off":
      return "bg-theme-entity-off";
    case "unavailable":
      return "bg-theme-entity-unavailable";
    case "unknown":
      return "bg-theme-entity-unknown";
    default:
      return "bg-theme-entity-unknown";
  }
}

export function binarySensorIconClass(state: string): string {
  switch (state) {
    case "on":
      return "text-theme-text-primary";
    case "off":
      return "text-theme-text-secondary";
    default:
      return "text-theme-text-muted";
  }
}

/** alarm_control_panel states (partial set — unknown falls back). */
export function alarmBackgroundClass(state: string): string {
  const s = (state || "").toLowerCase();
  if (s === "disarmed") return "bg-theme-alarm-disarmed";
  if (s.startsWith("armed")) return "bg-theme-alarm-armed";
  if (s === "triggered" || s.includes("pending")) {
    return "bg-theme-alarm-triggered";
  }
  if (s === "unavailable" || s === "unknown") {
    return "bg-theme-entity-unavailable";
  }
  return "bg-theme-alarm-armed";
}

export function lightTileBackgroundClass(state: string): string {
  switch (state) {
    case "on":
      return "bg-theme-entity-on";
    case "off":
      return "bg-theme-entity-off";
    case "unavailable":
      return "bg-theme-entity-unavailable";
    default:
      return "bg-theme-entity-unknown";
  }
}

export function lightTileTextClass(state: string): string {
  switch (state) {
    case "on":
      return "text-theme-text-on-primary";
    case "off":
      return "text-theme-text-secondary";
    case "unavailable":
      return "text-theme-error";
    default:
      return "text-theme-text-muted";
  }
}
