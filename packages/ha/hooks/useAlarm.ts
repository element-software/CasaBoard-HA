"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  callAlarmService,
  cancelForceArmAlarm,
  forceArmAlarm,
  getAlarmPanelSnapshot,
  normalizeAlarmAction,
  requiresAlarmCode,
  resolveAlarmGestureAction,
  toAlarmCallFailure,
  type AlarmAction,
  type AlarmArmFailure,
  type AlarmCallResult,
  type AlarmPanelService,
  type AlarmPanelSnapshot,
} from "../alarm/alarm";
import { useHA } from "../provider/HAProvider";
import { useEntity } from "./useEntity";

const PENDING_TIMEOUT_MS = 30_000;

export type UseAlarmOptions = {
  /** Optional stored code used when the caller does not pass one. */
  code?: string;
};

export type UseAlarmResult = {
  entity: ReturnType<typeof useEntity>;
  snapshot: AlarmPanelSnapshot;
  /** Attribute-based force-arm failure, or the last service-call error. */
  failure: AlarmArmFailure | null;
  /** True while an arm/disarm/force-arm call is awaiting a terminal outcome. */
  isBusy: boolean;
  /** Service currently in flight, if any. */
  pendingService: AlarmPanelService | null;
  clearFailure: () => void;
  requiresCode: (action: AlarmAction | string) => boolean;
  resolveGestureAction: (configured?: string) => AlarmAction;
  call: (action: AlarmAction | string, code?: string) => Promise<AlarmCallResult>;
  forceArm: (code?: string) => Promise<AlarmCallResult>;
  cancelForceArm: () => Promise<AlarmCallResult>;
};

function isTerminalSuccess(
  pending: AlarmPanelService,
  state: string | undefined
): boolean {
  if (pending === "alarm_disarm") return state === "disarmed";
  if (pending.startsWith("alarm_arm_") || pending === "alarm_trigger") {
    return typeof state === "string" && state.startsWith("armed_");
  }
  return false;
}

/**
 * Alarm control panel helper: live status, code requirements, Verisure-style
 * force-arm context, and service callers.
 */
export function useAlarm(
  entityId: string,
  options: UseAlarmOptions = {}
): UseAlarmResult {
  const { code } = options;
  const entity = useEntity(entityId);
  const { connection } = useHA();
  const lastCodeRef = useRef<string | undefined>(undefined);
  const lastArmServiceRef = useRef<AlarmPanelService | null>(null);
  const [pendingService, setPendingService] = useState<AlarmPanelService | null>(
    null
  );
  const [callFailure, setCallFailure] = useState<AlarmArmFailure | null>(null);
  const busyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const snapshot = useMemo(
    () => getAlarmPanelSnapshot(entity),
    // Recompute when HA pushes a new state object.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [entity?.state, entity?.attributes]
  );

  const failure = snapshot.forceArmFailure ?? callFailure;
  const isBusy = pendingService !== null;

  const clearFailure = useCallback(() => {
    setCallFailure(null);
  }, []);

  const clearBusyTimer = useCallback(() => {
    if (busyTimeoutRef.current) {
      clearTimeout(busyTimeoutRef.current);
      busyTimeoutRef.current = null;
    }
  }, []);

  const endPending = useCallback(() => {
    setPendingService(null);
    clearBusyTimer();
  }, [clearBusyTimer]);

  const beginPending = useCallback(
    (service: AlarmPanelService) => {
      setPendingService(service);
      setCallFailure(null);
      clearBusyTimer();
      busyTimeoutRef.current = setTimeout(() => {
        setPendingService(null);
        busyTimeoutRef.current = null;
        setCallFailure({
          zones: [],
          canForceArm: false,
          message: "No response from the alarm. Please try again.",
        });
      }, PENDING_TIMEOUT_MS);
    },
    [clearBusyTimer]
  );

  useEffect(() => () => clearBusyTimer(), [clearBusyTimer]);

  // Resolve pending only on terminal outcomes — not intermediate states like "arming".
  useEffect(() => {
    if (!pendingService) return;

    if (snapshot.forceArmAvailable) {
      endPending();
      setCallFailure(null);
      return;
    }

    if (isTerminalSuccess(pendingService, entity?.state)) {
      endPending();
    }
  }, [
    pendingService,
    snapshot.forceArmAvailable,
    entity?.state,
    endPending,
  ]);

  const requiresCode = useCallback(
    (action: AlarmAction | string) =>
      requiresAlarmCode(normalizeAlarmAction(action), entity?.attributes),
    [entity?.attributes]
  );

  const resolveGestureAction = useCallback(
    (configured?: string) => resolveAlarmGestureAction(configured, entity?.state),
    [entity?.state]
  );

  const call = useCallback(
    async (action: AlarmAction | string, enteredCode?: string): Promise<AlarmCallResult> => {
      const normalized = normalizeAlarmAction(action);
      if (!connection || !entityId || normalized === "none") {
        return {
          ok: false,
          failure: {
            zones: [],
            canForceArm: false,
            message: "Alarm is not ready.",
          },
        };
      }

      const service = normalized as AlarmPanelService;
      const codeToUse = enteredCode ?? code;
      lastCodeRef.current = codeToUse;
      if (service !== "alarm_disarm") {
        lastArmServiceRef.current = service;
      }
      beginPending(service);

      try {
        await callAlarmService(connection, entityId, service, codeToUse);
        // Stay busy until armed_*, force_arm_available, error, or timeout.
        return { ok: true };
      } catch (err) {
        const next = toAlarmCallFailure(err);
        setCallFailure(next);
        endPending();
        return { ok: false, failure: next };
      }
    },
    [connection, entityId, code, beginPending, endPending]
  );

  const forceArm = useCallback(
    async (enteredCode?: string): Promise<AlarmCallResult> => {
      if (!connection || !entityId) {
        return {
          ok: false,
          failure: {
            zones: snapshot.armExceptions,
            canForceArm: true,
            message: "Alarm is not ready.",
          },
        };
      }
      const codeToUse = enteredCode ?? lastCodeRef.current ?? code;
      beginPending(lastArmServiceRef.current ?? "alarm_arm_away");
      try {
        await forceArmAlarm(connection, entityId, codeToUse);
        return { ok: true };
      } catch (err) {
        const next = toAlarmCallFailure(err, snapshot.armExceptions, true);
        setCallFailure(next);
        endPending();
        return { ok: false, failure: next };
      }
    },
    [
      connection,
      entityId,
      code,
      snapshot.armExceptions,
      pendingService,
      beginPending,
      endPending,
    ]
  );

  const cancelForceArm = useCallback(async (): Promise<AlarmCallResult> => {
    if (!connection || !entityId) {
      setCallFailure(null);
      endPending();
      return { ok: true };
    }
    try {
      if (snapshot.forceArmAvailable) {
        await cancelForceArmAlarm(connection, entityId);
      }
      setCallFailure(null);
      endPending();
      return { ok: true };
    } catch (err) {
      setCallFailure(null);
      endPending();
      return {
        ok: false,
        failure: toAlarmCallFailure(err, snapshot.armExceptions, true),
      };
    }
  }, [
    connection,
    entityId,
    snapshot.forceArmAvailable,
    snapshot.armExceptions,
    endPending,
  ]);

  return {
    entity,
    snapshot,
    failure,
    isBusy,
    pendingService,
    clearFailure,
    requiresCode,
    resolveGestureAction,
    call,
    forceArm,
    cancelForceArm,
  };
}
