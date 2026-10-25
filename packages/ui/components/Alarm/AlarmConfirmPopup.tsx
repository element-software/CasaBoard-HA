"use client";
import { XMarkIcon, BackspaceIcon } from "@heroicons/react/24/outline";
import { Modal, ModalContent, ModalBody } from "@heroui/react";
import { useEffect, useState } from "react";
import classNames from "classnames";
import type { AlarmAction, AlarmArmFailure } from "@casaboard/ha";

export type { AlarmArmFailure };

const ACTION_CONFIRM_LABEL: Record<Exclude<AlarmAction, "none">, string> = {
  alarm_disarm: "Disarm",
  alarm_arm_home: "Arm Home",
  alarm_arm_away: "Arm Away",
  alarm_arm_night: "Arm Night",
  alarm_arm_vacation: "Arm Vacation",
  alarm_trigger: "Trigger Alarm",
};

const KEYPAD_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "del"] as const;

interface AlarmConfirmPopupProps {
  action: Exclude<AlarmAction, "none"> | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (code?: string) => void;
  /** When true, show PIN keypad; code is sent to HA for validation. */
  requiresCode?: boolean;
  /** Service call in flight. */
  isSubmitting?: boolean;
  /** Arm/disarm failure — zones + optional force-arm. */
  failure?: AlarmArmFailure | null;
  onForceArm?: () => void;
  onForceCancel?: () => void;
}

export const AlarmConfirmPopup = ({
  action,
  isOpen,
  onClose,
  onConfirm,
  requiresCode = false,
  isSubmitting = false,
  failure = null,
  onForceArm,
  onForceCancel,
}: AlarmConfirmPopupProps) => {
  const [pin, setPin] = useState("");
  const isDisarm = action === "alarm_disarm";
  // Disarm always prompts for a PIN when HA exposes a code format; arming
  // follows `requiresCode` (code_arm_required). Fallback: disarm always asks.
  const showPin = !failure && !isSubmitting && (requiresCode || isDisarm);
  const showFailure = Boolean(failure) && !isSubmitting;

  useEffect(() => {
    if (isOpen) setPin("");
  }, [isOpen]);

  const handleKey = (key: string) => {
    if (key === "del") {
      setPin((p) => p.slice(0, -1));
    } else {
      setPin((p) => (p.length < 10 ? p + key : p));
    }
  };

  const handleConfirm = () => {
    if (isSubmitting) return;
    if (showPin && pin.length === 0) return;
    onConfirm(showPin ? pin : undefined);
  };

  const label = action ? ACTION_CONFIRM_LABEL[action] : "";
  const canConfirm = !showPin || pin.length > 0;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      isDismissable={!isSubmitting}
      hideCloseButton
      classNames={{
        base: "hk-modal bg-white opacity-100",
        backdrop: "hk-modal__backdrop",
        wrapper: "items-center",
        closeButton: "hidden",
      }}
    >
      <ModalContent className="hk-modal__content bg-white opacity-100">
        <ModalBody className="hk-modal__body bg-white">
          <button
            type="button"
            className="hk-modal__close"
            onClick={onClose}
            aria-label="Close"
            disabled={isSubmitting}
          >
            <XMarkIcon className="h-4 w-4" />
          </button>

          <div className="hk-modal__stack">
            <div className="hk-modal__header">
              <p className="hk-modal__eyebrow">
                {showFailure ? "Security" : showPin ? "Security" : "Confirm action"}
              </p>
              <h2 className="hk-modal__title">
                {isSubmitting
                  ? `${label}…`
                  : showFailure
                    ? failure?.canForceArm
                      ? "Open sensor(s) — arm anyway?"
                      : "Arming failed"
                    : showPin
                      ? isDisarm
                        ? "Enter PIN to Disarm"
                        : `Enter PIN to ${label}`
                      : label}
              </h2>
              {!showPin && !showFailure && !isSubmitting && (
                <p className="hk-modal__desc">
                  Are you sure you want to {label.toLowerCase()}?
                </p>
              )}
              {showFailure && failure?.message && (
                <p className="hk-modal__desc">{failure.message}</p>
              )}
            </div>

            {showFailure && failure && failure.zones.length > 0 && (
              <ul className="hk-modal__zones">
                {failure.zones.map((zone) => (
                  <li key={zone} className="hk-modal__zone">
                    {zone}
                  </li>
                ))}
              </ul>
            )}

            {isSubmitting && (
              <div className="hk-modal__loading" aria-live="polite">
                <span className="hk-modal__spinner" />
                <span>Talking to Home Assistant…</span>
              </div>
            )}

            {showPin && (
              <>
                <div className="hk-modal__pin">
                  {pin.length === 0 ? (
                    <span className="hk-modal__pin-placeholder">● ● ● ●</span>
                  ) : (
                    <div className="hk-modal__pin-dots">
                      {Array.from({ length: pin.length }).map((_, i) => (
                        <span key={i} className="hk-modal__pin-dot" />
                      ))}
                    </div>
                  )}
                </div>

                <div className="hk-modal__keypad">
                  {KEYPAD_KEYS.map((key, i) => {
                    if (key === "") return <div key={i} />;
                    return (
                      <button
                        key={i}
                        type="button"
                        className={classNames(
                          "hk-modal__key",
                          key === "del" && "hk-modal__key--del"
                        )}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          handleKey(key);
                        }}
                      >
                        {key === "del" ? (
                          <BackspaceIcon className="h-5 w-5 mx-auto" />
                        ) : (
                          key
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}

            {!isSubmitting && (
              <div className="hk-modal__actions">
                <button
                  type="button"
                  className="hk-modal__btn hk-modal__btn--cancel"
                  onClick={showFailure && onForceCancel ? onForceCancel : onClose}
                >
                  Cancel
                </button>
                {showFailure && failure?.canForceArm ? (
                  <button
                    type="button"
                    className="hk-modal__btn hk-modal__btn--primary"
                    onClick={onForceArm}
                  >
                    Force Arm
                  </button>
                ) : !showFailure ? (
                  <button
                    type="button"
                    className={classNames(
                      "hk-modal__btn hk-modal__btn--primary",
                      isDisarm && "hk-modal__btn--danger",
                      !canConfirm && "hk-modal__btn--disabled"
                    )}
                    disabled={!canConfirm}
                    onClick={handleConfirm}
                  >
                    {label}
                  </button>
                ) : null}
              </div>
            )}
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
