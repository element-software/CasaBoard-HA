import type { Connection } from "home-assistant-js-websocket";

/** Domains that expose force_arm / force_arm_cancel (Verisure OWA + legacy). */
export const FORCE_ARM_DOMAINS = ["verisure_owa", "securitas"] as const;

export type AlarmPanelService =
  | "alarm_disarm"
  | "alarm_arm_home"
  | "alarm_arm_away"
  | "alarm_arm_night"
  | "alarm_arm_vacation"
  | "alarm_trigger";

export type AlarmAction = AlarmPanelService | "none";

export type AlarmSecurityTone = "ok" | "armed" | "alert" | "pending";

export type AlarmSecurityStatus = {
  mode: string;
  detail: string;
  tone: AlarmSecurityTone;
  /** Armed, arming, pending, or triggered. */
  isActive: boolean;
};

export type AlarmArmFailure = {
  /** Human-readable failure summary. */
  message: string;
  /** Open zone / sensor names (e.g. Verisure `arm_exceptions`). */
  zones: string[];
  /** When true, integration supports force-arm override. */
  canForceArm: boolean;
};

export type AlarmPanelSnapshot = {
  state?: string;
  codeFormat: string | null;
  codeArmRequired: boolean;
  forceArmAvailable: boolean;
  armExceptions: string[];
  status: AlarmSecurityStatus;
  /** Blocking failure derived from force-arm attributes, if any. */
  forceArmFailure: AlarmArmFailure | null;
};

/** Legacy UI/config values → HA alarm_control_panel service names. */
const ACTION_ALIASES: Record<string, AlarmAction> = {
  none: "none",
  disarm: "alarm_disarm",
  alarm_disarm: "alarm_disarm",
  arm_home: "alarm_arm_home",
  alarm_arm_home: "alarm_arm_home",
  arm_away: "alarm_arm_away",
  alarm_arm_away: "alarm_arm_away",
  arm_night: "alarm_arm_night",
  alarm_arm_night: "alarm_arm_night",
  arm_vacation: "alarm_arm_vacation",
  alarm_arm_vacation: "alarm_arm_vacation",
  trigger: "alarm_trigger",
  alarm_trigger: "alarm_trigger",
};

const ACTIVE_ALARM_STATES = new Set([
  "armed_home",
  "armed_away",
  "armed_night",
  "armed_vacation",
  "armed_custom_bypass",
  "triggered",
  "pending",
  "arming",
]);

export function normalizeAlarmAction(action?: string | null): AlarmAction {
  if (!action) return "none";
  return ACTION_ALIASES[action] ?? "none";
}

export function isAlarmActive(state?: string): boolean {
  return !!state && ACTIVE_ALARM_STATES.has(state);
}

/** When armed, arm/trigger gestures become disarm so the panel can be cleared. */
export function resolveAlarmGestureAction(
  configured: string | undefined,
  state?: string
): AlarmAction {
  const action = normalizeAlarmAction(configured);
  if (action === "none") return "none";
  if (isAlarmActive(state) && action !== "alarm_disarm") {
    return "alarm_disarm";
  }
  return action;
}

export function readArmExceptions(
  attributes: Record<string, unknown> | null | undefined
): string[] {
  const raw = attributes?.arm_exceptions;
  if (!Array.isArray(raw)) return [];
  return raw.map((z) => String(z)).filter(Boolean);
}

export function formatArmFailureMessage(
  zones: string[],
  fallback = "The alarm could not be armed."
): string {
  if (zones.length === 1) return `${zones[0]} is open.`;
  if (zones.length > 1) return `${zones.join(", ")} are open.`;
  return fallback;
}

export function serviceErrorMessage(
  err: unknown,
  fallback = "The alarm action failed."
): string {
  if (!err) return fallback;
  if (typeof err === "string") return err;
  const e = err as { message?: string; error?: { message?: string } };
  return e.message || e.error?.message || fallback;
}

/** Map HA alarm_control_panel state → mode / detail / tone. */
export function getAlarmSecurityStatus(state?: string): AlarmSecurityStatus {
  const isActive = isAlarmActive(state);
  switch (state) {
    case "disarmed":
      return { mode: "Home", detail: "Disarmed", tone: "ok", isActive };
    case "armed_home":
      return { mode: "Home", detail: "Armed", tone: "armed", isActive };
    case "armed_away":
      return { mode: "Away", detail: "Armed", tone: "armed", isActive };
    case "armed_night":
      return { mode: "Night", detail: "Armed", tone: "armed", isActive };
    case "armed_vacation":
      return { mode: "Vacation", detail: "Armed", tone: "armed", isActive };
    case "armed_custom_bypass":
      return { mode: "Custom", detail: "Armed", tone: "armed", isActive };
    case "triggered":
      return { mode: "Alarm", detail: "Triggered", tone: "alert", isActive };
    case "pending":
      return { mode: "Security", detail: "Pending", tone: "pending", isActive };
    case "arming":
      return { mode: "Security", detail: "Arming", tone: "pending", isActive };
    default:
      if (!state) {
        return { mode: "Security", detail: "Unknown", tone: "pending", isActive };
      }
      return {
        mode: "Security",
        detail: state
          .split("_")
          .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
          .join(" "),
        tone: "pending",
        isActive,
      };
  }
}

export function requiresAlarmCode(
  action: AlarmAction,
  attributes: Record<string, unknown> | null | undefined
): boolean {
  if (action === "none") return false;
  const codeFormat = attributes?.code_format;
  const hasCodeFormat = Boolean(codeFormat);
  if (action === "alarm_disarm") return hasCodeFormat;
  return hasCodeFormat && Boolean(attributes?.code_arm_required);
}

/** Snapshot status + force-arm context from an HA alarm entity. */
export function getAlarmPanelSnapshot(
  entity: { state?: string; attributes?: Record<string, unknown> } | null | undefined
): AlarmPanelSnapshot {
  const attributes = entity?.attributes ?? undefined;
  const state = entity?.state;
  const forceArmAvailable = attributes?.force_arm_available === true;
  const armExceptions = readArmExceptions(attributes);
  const codeFormat =
    typeof attributes?.code_format === "string" ? attributes.code_format : null;

  return {
    state,
    codeFormat,
    codeArmRequired: Boolean(attributes?.code_arm_required),
    forceArmAvailable,
    armExceptions,
    status: getAlarmSecurityStatus(state),
    forceArmFailure: forceArmAvailable
      ? {
          zones: armExceptions,
          canForceArm: true,
          message: formatArmFailureMessage(armExceptions),
        }
      : null,
  };
}

export async function callAlarmService(
  connection: Connection,
  entityId: string,
  service: AlarmPanelService,
  code?: string
): Promise<void> {
  const service_data: Record<string, string> = { entity_id: entityId };
  if (code) service_data.code = code;
  await connection.sendMessagePromise({
    type: "call_service",
    domain: "alarm_control_panel",
    service,
    service_data,
  });
}

async function callForceService(
  connection: Connection,
  service: "force_arm" | "force_arm_cancel",
  entityId: string,
  code?: string
): Promise<void> {
  const service_data: Record<string, string> = { entity_id: entityId };
  if (code) service_data.code = code;
  let lastError: unknown;
  for (const domain of FORCE_ARM_DOMAINS) {
    try {
      await connection.sendMessagePromise({
        type: "call_service",
        domain,
        service,
        service_data,
      });
      return;
    } catch (err) {
      lastError = err;
    }
  }
  throw lastError ?? new Error("Force arm is not available for this alarm.");
}

export function forceArmAlarm(
  connection: Connection,
  entityId: string,
  code?: string
): Promise<void> {
  return callForceService(connection, "force_arm", entityId, code);
}

export function cancelForceArmAlarm(
  connection: Connection,
  entityId: string
): Promise<void> {
  return callForceService(connection, "force_arm_cancel", entityId);
}

export type AlarmCallResult =
  | { ok: true }
  | { ok: false; failure: AlarmArmFailure };

export function toAlarmCallFailure(
  err: unknown,
  zones: string[] = [],
  canForceArm = false
): AlarmArmFailure {
  return {
    zones,
    canForceArm,
    message: serviceErrorMessage(err),
  };
}
