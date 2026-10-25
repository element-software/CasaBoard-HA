import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  alignAuthHassUrl,
  readIngressPrefixFromBrowser,
  resolveBrowserHassUrl,
  rewriteHassMediaUrl,
} from "./browserHassUrl";

const STORED = "http://192.0.2.10:8123";
const INGRESS_ORIGIN = "https://ha.example.com";
const INGRESS_PATH = "/api/hassio_ingress/abc123";

describe("readIngressPrefixFromBrowser", () => {
  it("returns empty when there is no browser location", () => {
    assert.equal(readIngressPrefixFromBrowser(null), "");
  });

  it("reads the prefix from the pathname", () => {
    assert.equal(
      readIngressPrefixFromBrowser({
        origin: INGRESS_ORIGIN,
        pathname: `${INGRESS_PATH}/dashboard/kitchen`,
      }),
      INGRESS_PATH
    );
  });

  it("prefers the ingress cookie over the pathname", () => {
    assert.equal(
      readIngressPrefixFromBrowser({
        origin: INGRESS_ORIGIN,
        pathname: "/dashboard/kitchen",
        cookie: `casaboard-ingress-path=${encodeURIComponent(INGRESS_PATH)}`,
      }),
      INGRESS_PATH
    );
  });
});

describe("resolveBrowserHassUrl", () => {
  it("returns the page origin under Ingress (pathname)", () => {
    assert.equal(
      resolveBrowserHassUrl(STORED, {
        origin: INGRESS_ORIGIN,
        pathname: `${INGRESS_PATH}/setup/pages`,
      }),
      INGRESS_ORIGIN
    );
  });

  it("returns the page origin under Ingress (cookie)", () => {
    assert.equal(
      resolveBrowserHassUrl(STORED, {
        origin: INGRESS_ORIGIN,
        pathname: "/dashboard/kitchen",
        cookie: `other=1; casaboard-ingress-path=${encodeURIComponent(`${INGRESS_PATH}/`)}`,
      }),
      INGRESS_ORIGIN
    );
  });

  it("keeps the stored URL outside Ingress", () => {
    assert.equal(
      resolveBrowserHassUrl(STORED, {
        origin: "http://192.168.1.10:3000",
        pathname: "/dashboard/kitchen",
      }),
      STORED
    );
  });

  it("keeps the stored URL when there is no browser location", () => {
    assert.equal(resolveBrowserHassUrl(STORED, null), STORED);
  });
});

describe("rewriteHassMediaUrl", () => {
  it("rewrites http HA camera proxy URLs onto the browser origin", () => {
    assert.equal(
      rewriteHassMediaUrl(
        "http://192.0.2.10:8123/api/camera_proxy/camera.front?token=tok",
        INGRESS_ORIGIN
      ),
      "https://ha.example.com/api/camera_proxy/camera.front?token=tok"
    );
  });

  it("rewrites http /local/ media onto the browser origin", () => {
    assert.equal(
      rewriteHassMediaUrl(
        "http://192.0.2.10:8123/local/album.jpg",
        INGRESS_ORIGIN
      ),
      "https://ha.example.com/local/album.jpg"
    );
  });

  it("keeps an explicit port from the browser origin", () => {
    assert.equal(
      rewriteHassMediaUrl(
        "http://192.0.2.10:8123/api/hls/abc/playlist.m3u8",
        "https://ha.example.com:8123"
      ),
      "https://ha.example.com:8123/api/hls/abc/playlist.m3u8"
    );
  });

  it("leaves third-party camera http URLs alone", () => {
    const raw = "http://192.168.1.50/cgi-bin/snapshot.cgi";
    assert.equal(rewriteHassMediaUrl(raw, INGRESS_ORIGIN), raw);
  });

  it("leaves already-https URLs alone", () => {
    const raw = "https://cdn.example.com/art.jpg";
    assert.equal(rewriteHassMediaUrl(raw, INGRESS_ORIGIN), raw);
  });
});

describe("alignAuthHassUrl", () => {
  it("patches hassUrl in memory", () => {
    const auth = { data: { hassUrl: STORED } };
    alignAuthHassUrl(auth, `${INGRESS_ORIGIN}/`);
    assert.equal(auth.data.hassUrl, INGRESS_ORIGIN);
  });
});
