import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  normalizeIngressPrefix,
  stripIngressPrefix,
  withIngressPath,
} from "./path";

describe("ingress path helpers", () => {
  it("normalizes empty and root prefixes", () => {
    assert.equal(normalizeIngressPrefix(null), "");
    assert.equal(normalizeIngressPrefix("/"), "");
    assert.equal(normalizeIngressPrefix("  /  "), "");
  });

  it("strips trailing slash from prefix", () => {
    assert.equal(
      normalizeIngressPrefix("/api/hassio_ingress/abc/"),
      "/api/hassio_ingress/abc"
    );
  });

  it("leaves paths unchanged without a prefix", () => {
    assert.equal(withIngressPath("", "/setup/pages"), "/setup/pages");
  });

  it("prefixes absolute paths", () => {
    assert.equal(
      withIngressPath("/api/hassio_ingress/abc", "/setup/pages"),
      "/api/hassio_ingress/abc/setup/pages"
    );
  });

  it("does not double-prefix", () => {
    const prefix = "/api/hassio_ingress/abc";
    const once = withIngressPath(prefix, "/setup");
    assert.equal(withIngressPath(prefix, once), once);
  });

  it("strips ingress prefix from pathname", () => {
    const prefix = "/api/hassio_ingress/abc";
    assert.equal(
      stripIngressPrefix(prefix, "/api/hassio_ingress/abc/setup/pages"),
      "/setup/pages"
    );
    assert.equal(stripIngressPrefix("", "/setup/pages"), "/setup/pages");
  });
});
