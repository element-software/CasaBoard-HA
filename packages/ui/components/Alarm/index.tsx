"use client";
import {
  useAlarm,
  type AlarmAction,
  type AlarmArmFailure,
} from "@casaboard/ha";
import { useCallback, useEffect, useRef, useState } from "react";
import { Skeleton } from "@heroui/react";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";
import { AlarmConfirmPopup } from "./AlarmConfirmPopup";

export type { AlarmAction, AlarmArmFailure };

export interface AlarmProps {
  entityId: string;
  tapAction?: AlarmAction | string;
  longPressAction?: AlarmAction | string;
  code?: string;
}

const LONG_PRESS_MS = 600;

const ACTION_LABEL: Record<Exclude<AlarmAction, "none">, string> = {
  alarm_disarm: "Disarming",
  alarm_arm_home: "Arming Home",
  alarm_arm_away: "Arming Away",
  alarm_arm_night: "Arming Night",
  alarm_arm_vacation: "Arming Vacation",
  alarm_trigger: "Triggering",
};

export const Alarm = ({
  entityId,
  tapAction = "none",
  longPressAction = "none",
  code,
}: AlarmProps) => {
  const {
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
  } = useAlarm(entityId, { code });

  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const didLongPress = useRef(false);
  const lastArmActionRef = useRef<Exclude<AlarmAction, "none"> | null>(null);
  const sawForceArmRef = useRef(false);

  const [confirmAction, setConfirmAction] = useState<Exclude<AlarmAction, "none"> | null>(null);

  const effectiveTap = resolveGestureAction(tapAction);
  const effectiveLongPress = resolveGestureAction(longPressAction);
  const { status, forceArmAvailable } = snapshot;

  const closePopup = useCallback(() => {
    setConfirmAction(null);
    clearFailure();
  }, [clearFailure]);

  // When HA reports a force-arm window, keep/open the confirm popup.
  useEffect(() => {
    if (forceArmAvailable) {
      sawForceArmRef.current = true;
      setConfirmAction((current) => {
        if (current) return current;
        return (
          lastArmActionRef.current ??
          (effectiveTap !== "none" && effectiveTap !== "alarm_disarm"
            ? effectiveTap
            : "alarm_arm_away")
        );
      });
      return;
    }

    // Force-arm window cleared (armed, cancelled, or expired).
    if (sawForceArmRef.current) {
      sawForceArmRef.current = false;
      if (confirmAction) closePopup();
    }
  }, [forceArmAvailable, effectiveTap, confirmAction, closePopup]);

  // Close once the panel reaches the intended armed/disarmed state.
  useEffect(() => {
    if (!confirmAction || failure?.canForceArm) return;
    if (confirmAction === "alarm_disarm" && snapshot.state === "disarmed") {
      closePopup();
      return;
    }
    if (
      confirmAction.startsWith("alarm_arm_") &&
      typeof snapshot.state === "string" &&
      snapshot.state.startsWith("armed_")
    ) {
      closePopup();
    }
  }, [snapshot.state, confirmAction, failure, closePopup]);

  const openConfirm = useCallback(
    (action: AlarmAction) => {
      if (action === "none" || isBusy) return;

      if (forceArmAvailable) {
        setConfirmAction(
          lastArmActionRef.current ??
            (action !== "alarm_disarm"
              ? (action as Exclude<AlarmAction, "none">)
              : "alarm_arm_away")
        );
        return;
      }

      clearFailure();
      setConfirmAction(action as Exclude<AlarmAction, "none">);
    },
    [isBusy, forceArmAvailable, clearFailure]
  );

  const handleConfirmed = useCallback(
    async (enteredCode?: string) => {
      if (!confirmAction || isBusy) return;
      if (confirmAction !== "alarm_disarm") {
        lastArmActionRef.current = confirmAction;
      }
      await call(confirmAction, enteredCode);
    },
    [confirmAction, call, isBusy]
  );

  const handleForceArm = useCallback(async () => {
    await forceArm();
  }, [forceArm]);

  const handleForceCancel = useCallback(async () => {
    await cancelForceArm();
    closePopup();
  }, [cancelForceArm, closePopup]);

  const handlePointerDown = useCallback(() => {
    if (isBusy) return;
    didLongPress.current = false;
    if (effectiveLongPress !== "none") {
      timerRef.current = setTimeout(() => {
        didLongPress.current = true;
        openConfirm(effectiveLongPress);
      }, LONG_PRESS_MS);
    }
  }, [effectiveLongPress, openConfirm, isBusy]);

  const handlePointerUp = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!didLongPress.current && !isBusy) {
      if (forceArmAvailable) {
        openConfirm(effectiveTap !== "none" ? effectiveTap : "alarm_arm_away");
        return;
      }
      openConfirm(effectiveTap);
    }
  }, [effectiveTap, openConfirm, isBusy, forceArmAvailable]);

  const handlePointerLeave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  if (!entityId) {
    return (
      <div className="alarm-hk alarm-hk--empty">
        <span>Configure Alarm Entity</span>
      </div>
    );
  }

  const isInteractive =
    !isBusy &&
    isEntityReady &&
    (forceArmAvailable ||
      effectiveTap !== "none" ||
      effectiveLongPress !== "none");

  const busyAction = pendingService ?? confirmAction;
  const statusLine = isBusy
    ? busyAction
      ? `${ACTION_LABEL[busyAction]}…`
      : "Working…"
    : forceArmAvailable
      ? "Arming blocked"
      : `${status.mode} • ${status.detail}`;

  const tone = forceArmAvailable ? "alert" : status.tone;

  return (
    <>
      <AlarmConfirmPopup
        action={confirmAction}
        isOpen={confirmAction !== null}
        onClose={failure?.canForceArm ? handleForceCancel : closePopup}
        onConfirm={handleConfirmed}
        requiresCode={confirmAction ? requiresCode(confirmAction) : false}
        isSubmitting={isBusy}
        failure={failure}
        onForceArm={handleForceArm}
        onForceCancel={handleForceCancel}
      />
      <Skeleton
        isLoaded={isLoaded}
        className="flex h-full w-full flex-col rounded-[1.75rem]"
        classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
      >
        {showNotAvailable ? (
          <div className="alarm-hk alarm-hk--unavailable">
            <div className="alarm-hk__icon" aria-hidden>
              <span className="alarm-hk__glyph" />
            </div>
            <div className="alarm-hk__labels">
              <div className="alarm-hk__title">Security</div>
              <div className="alarm-hk__status">Unavailable</div>
            </div>
          </div>
        ) : isEntityReady ? (
          <div
            className={`alarm-hk alarm-hk--${tone}${isInteractive ? " alarm-hk--interactive" : ""}`}
            onPointerDown={isInteractive ? handlePointerDown : undefined}
            onPointerUp={isInteractive ? handlePointerUp : undefined}
            onPointerLeave={isInteractive ? handlePointerLeave : undefined}
            role={isInteractive ? "button" : undefined}
            tabIndex={isInteractive ? 0 : undefined}
          >
            <div className="alarm-hk__icon" aria-hidden>
              {isBusy ? (
                <span className="alarm-hk__spinner" />
              ) : (
                <span className="alarm-hk__glyph" />
              )}
            </div>
            <div className="alarm-hk__labels">
              <div className="alarm-hk__title">Security</div>
              <div className="alarm-hk__status">{statusLine}</div>
            </div>
          </div>
        ) : (
          <div className="alarm-hk opacity-0" />
        )}
      </Skeleton>
    </>
  );
};
