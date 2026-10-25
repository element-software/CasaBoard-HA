import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isOutsideCooldown, matchesTrigger } from "./popupTrigger";

describe("matchesTrigger", () => {
  it("fires to_state when the new state matches", () => {
    const config = { triggerMode: "to_state" as const, toState: "on" };
    assert.equal(matchesTrigger(config, "off", "on"), true);
    assert.equal(matchesTrigger(config, "on", "off"), false);
  });

  it("matches states case-insensitively and trims config", () => {
    const config = { triggerMode: "to_state" as const, toState: " On " };
    assert.equal(matchesTrigger(config, "off", "on"), true);
  });

  it("applies the fromState guard", () => {
    const config = {
      triggerMode: "to_state" as const,
      toState: "open",
      fromState: "closed",
    };
    assert.equal(matchesTrigger(config, "closed", "open"), true);
    assert.equal(matchesTrigger(config, "opening", "open"), false);
  });

  it("does not fire to_state without a target state", () => {
    const config = { triggerMode: "to_state" as const, toState: "" };
    assert.equal(matchesTrigger(config, "off", "on"), false);
  });

  it("fires any_change on every distinct state", () => {
    const config = { triggerMode: "any_change" as const };
    assert.equal(
      matchesTrigger(
        config,
        "2026-10-17T10:00:00.000+00:00",
        "2026-10-17T10:00:05.000+00:00"
      ),
      true
    );
    assert.equal(matchesTrigger(config, "a", "a"), false);
  });

  it("ignores unavailable and unknown transitions", () => {
    const anyChange = { triggerMode: "any_change" as const };
    const toOn = { triggerMode: "to_state" as const, toState: "on" };
    assert.equal(matchesTrigger(anyChange, "unavailable", "on"), false);
    assert.equal(matchesTrigger(anyChange, "on", "unknown"), false);
    assert.equal(matchesTrigger(toOn, "unavailable", "on"), false);
    assert.equal(matchesTrigger(toOn, "unknown", "on"), false);
  });

  it("does not fire without a previous state (baseline)", () => {
    const config = { triggerMode: "any_change" as const };
    assert.equal(matchesTrigger(config, undefined, "on"), false);
    assert.equal(matchesTrigger(config, "on", undefined), false);
  });
});

describe("isOutsideCooldown", () => {
  it("allows the first fire", () => {
    assert.equal(isOutsideCooldown({ cooldownSeconds: 30 }, 1000, undefined), true);
  });

  it("blocks inside the window and allows after it", () => {
    const config = { cooldownSeconds: 30 };
    assert.equal(isOutsideCooldown(config, 29_999, 0), false);
    assert.equal(isOutsideCooldown(config, 30_000, 0), true);
  });

  it("treats missing or invalid cooldowns as zero", () => {
    assert.equal(isOutsideCooldown({}, 1, 0), true);
    assert.equal(isOutsideCooldown({ cooldownSeconds: -5 }, 1, 0), true);
  });
});
