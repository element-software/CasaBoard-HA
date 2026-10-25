import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ERR_CANNOT_CONNECT,
  ERR_INVALID_AUTH,
  ERR_INVALID_HTTPS_TO_HTTP,
  ERR_HASS_HOST_REQUIRED,
} from "home-assistant-js-websocket";
import { classifyConnectionError, haConnectionFailure } from "./errors";
import { normalizeHassUrl } from "./normalizeUrl";

describe("normalizeHassUrl", () => {
  it("defaults to http when protocol is omitted", () => {
    const result = normalizeHassUrl("homeassistant.local:8123");
    assert.deepEqual(result, {
      ok: true,
      url: "http://homeassistant.local:8123",
    });
  });

  it("preserves https and strips trailing slash", () => {
    const result = normalizeHassUrl("https://ha.example.com:8123/");
    assert.deepEqual(result, {
      ok: true,
      url: "https://ha.example.com:8123",
    });
  });

  it("does not double-prefix http://", () => {
    const result = normalizeHassUrl("http://192.168.1.10:8123");
    assert.deepEqual(result, {
      ok: true,
      url: "http://192.168.1.10:8123",
    });
  });

  it("rejects empty input as host_required", () => {
    const result = normalizeHassUrl("   ");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.failure.code, "host_required");
    }
  });

  it("rejects non-http protocols", () => {
    const result = normalizeHassUrl("ftp://ha.local");
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.failure.code, "invalid_url");
    }
  });
});

describe("classifyConnectionError", () => {
  it("maps websocket numeric auth failures", () => {
    assert.equal(classifyConnectionError(ERR_INVALID_AUTH).code, "invalid_auth");
  });

  it("maps websocket cannot-connect failures", () => {
    assert.equal(classifyConnectionError(ERR_CANNOT_CONNECT).code, "unreachable");
  });

  it("maps https-to-http mixed content", () => {
    const failure = classifyConnectionError(ERR_INVALID_HTTPS_TO_HTTP);
    assert.equal(failure.code, "https_to_http");
    assert.match(failure.message, /HTTPS address you actually browse/i);
  });

  it("maps host required", () => {
    assert.equal(
      classifyConnectionError(ERR_HASS_HOST_REQUIRED).code,
      "host_required"
    );
  });

  it("detects SSL certificate errors from message text", () => {
    assert.equal(
      classifyConnectionError(new Error("unable to verify the first certificate")).code,
      "ssl"
    );
    assert.equal(
      classifyConnectionError(new Error("self signed certificate in certificate chain")).code,
      "ssl"
    );
  });

  it("detects network unreachable errors from message text", () => {
    assert.equal(
      classifyConnectionError(new Error("Failed to fetch")).code,
      "unreachable"
    );
    assert.equal(
      classifyConnectionError(new Error("connect ECONNREFUSED 192.168.1.1:8123")).code,
      "unreachable"
    );
  });

  it("passes through already-typed failures", () => {
    const typed = haConnectionFailure("invalid_url");
    assert.equal(classifyConnectionError(typed).code, "invalid_url");
  });

  it("falls back to unknown for unrecognized errors", () => {
    assert.equal(classifyConnectionError(new Error("weird")).code, "unknown");
  });
});
