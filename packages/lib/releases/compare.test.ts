import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { compareSemver, isNewerRelease } from "./compare";

describe("release semver compare", () => {
  it("orders dotted versions", () => {
    assert.equal(compareSemver("0.1.0", "0.1.1"), -1);
    assert.equal(compareSemver("1.0.0", "0.9.9"), 1);
    assert.equal(compareSemver("v1.2.3", "1.2.3"), 0);
  });

  it("detects newer releases", () => {
    assert.equal(isNewerRelease("0.1.0", "0.2.0"), true);
    assert.equal(isNewerRelease("0.2.0", "0.2.0"), false);
  });
});
