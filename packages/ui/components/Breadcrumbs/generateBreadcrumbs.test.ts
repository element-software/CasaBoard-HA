import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { generateBreadcrumbs } from "./generateBreadcrumbs";

describe("generateBreadcrumbs", () => {
  it("builds setup settings crumbs without ingress segments", () => {
    const crumbs = generateBreadcrumbs("/setup/settings");
    assert.deepEqual(
      crumbs.map((c) => c.label),
      ["Home", "Setup", "Settings"]
    );
    assert.equal(crumbs[0]?.href, "/");
    assert.equal(crumbs[1]?.href, "/setup");
    assert.equal(crumbs[2]?.href, undefined);
  });

  it("labels HA cleanup", () => {
    assert.deepEqual(
      generateBreadcrumbs("/setup/ha-cleanup").map((c) => c.label),
      ["Home", "Setup", "HA Cleanup"]
    );
  });

  it("labels about and docs segments", () => {
    assert.deepEqual(
      generateBreadcrumbs("/setup/about").map((c) => c.label),
      ["Home", "Setup", "About"]
    );
    assert.deepEqual(
      generateBreadcrumbs("/setup/docs").map((c) => c.label),
      ["Home", "Setup", "Docs"]
    );
  });

  it("collapses edit/<slug> into a single crumb", () => {
    const crumbs = generateBreadcrumbs("/setup/pages/edit/kitchen");
    assert.deepEqual(
      crumbs.map((c) => c.label),
      ["Home", "Setup", "Pages", "Edit Kitchen"]
    );
  });
});
