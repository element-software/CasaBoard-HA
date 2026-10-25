import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatArmFailureMessage,
  getAlarmPanelSnapshot,
  getAlarmSecurityStatus,
  normalizeAlarmAction,
  requiresAlarmCode,
  resolveAlarmGestureAction,
  serviceErrorMessage,
} from "./alarm";

describe("normalizeAlarmAction", () => {
  it("maps legacy aliases to HA services", () => {
    assert.equal(normalizeAlarmAction("disarm"), "alarm_disarm");
    assert.equal(normalizeAlarmAction("arm_night"), "alarm_arm_night");
    assert.equal(normalizeAlarmAction("alarm_arm_away"), "alarm_arm_away");
  });

  it("falls back to none", () => {
    assert.equal(normalizeAlarmAction(undefined), "none");
    assert.equal(normalizeAlarmAction("nope"), "none");
  });
});

describe("resolveAlarmGestureAction", () => {
  it("keeps configured arm action when disarmed", () => {
    assert.equal(
      resolveAlarmGestureAction("alarm_arm_night", "disarmed"),
      "alarm_arm_night"
    );
  });

  it("switches arm actions to disarm when armed", () => {
    assert.equal(
      resolveAlarmGestureAction("alarm_arm_night", "armed_night"),
      "alarm_disarm"
    );
    assert.equal(
      resolveAlarmGestureAction("arm_away", "armed_away"),
      "alarm_disarm"
    );
  });

  it("leaves none alone even when armed", () => {
    assert.equal(resolveAlarmGestureAction("none", "armed_home"), "none");
  });
});

describe("getAlarmSecurityStatus", () => {
  it("maps common panel states", () => {
    assert.deepEqual(getAlarmSecurityStatus("disarmed"), {
      mode: "Home",
      detail: "Disarmed",
      tone: "ok",
      isActive: false,
    });
    assert.deepEqual(getAlarmSecurityStatus("armed_night"), {
      mode: "Night",
      detail: "Armed",
      tone: "armed",
      isActive: true,
    });
  });
});

describe("getAlarmPanelSnapshot", () => {
  it("exposes force-arm failure from Verisure-style attributes", () => {
    const snap = getAlarmPanelSnapshot({
      state: "disarmed",
      attributes: {
        force_arm_available: true,
        arm_exceptions: ["Kitchen window", "Hall door"],
        code_format: "number",
        code_arm_required: false,
      },
    });
    assert.equal(snap.forceArmAvailable, true);
    assert.deepEqual(snap.armExceptions, ["Kitchen window", "Hall door"]);
    assert.equal(snap.forceArmFailure?.canForceArm, true);
    assert.match(snap.forceArmFailure?.message ?? "", /Kitchen window/);
  });

  it("has no force-arm failure when attribute is absent", () => {
    const snap = getAlarmPanelSnapshot({
      state: "armed_away",
      attributes: { code_format: "number" },
    });
    assert.equal(snap.forceArmAvailable, false);
    assert.equal(snap.forceArmFailure, null);
    assert.equal(snap.status.isActive, true);
  });
});

describe("requiresAlarmCode", () => {
  it("requires code for disarm when code_format is set", () => {
    assert.equal(
      requiresAlarmCode("alarm_disarm", { code_format: "number" }),
      true
    );
  });

  it("requires code for arm only when code_arm_required", () => {
    assert.equal(
      requiresAlarmCode("alarm_arm_night", {
        code_format: "number",
        code_arm_required: false,
      }),
      false
    );
    assert.equal(
      requiresAlarmCode("alarm_arm_night", {
        code_format: "number",
        code_arm_required: true,
      }),
      true
    );
  });
});

describe("formatArmFailureMessage / serviceErrorMessage", () => {
  it("formats zone lists", () => {
    assert.equal(formatArmFailureMessage(["A"]), "A is open.");
    assert.equal(formatArmFailureMessage(["A", "B"]), "A, B are open.");
  });

  it("reads nested HA error messages", () => {
    assert.equal(
      serviceErrorMessage({ error: { message: "Open zone" } }),
      "Open zone"
    );
  });
});
