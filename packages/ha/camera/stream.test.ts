import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  CAMERA_FEATURE_STREAM,
  cameraSupportsHls,
  cameraSupportsWebRtc,
  getCameraMjpegUrl,
  getCameraPosterUrl,
  joinHassUrl,
} from "./stream";

describe("camera stream helpers", () => {
  it("joins relative HA paths to the instance URL", () => {
    assert.equal(
      joinHassUrl("http://ha.local:8123/", "/api/hls/abc/playlist.m3u8"),
      "http://ha.local:8123/api/hls/abc/playlist.m3u8"
    );
    assert.equal(
      joinHassUrl("http://ha.local:8123", "api/hls/abc/playlist.m3u8"),
      "http://ha.local:8123/api/hls/abc/playlist.m3u8"
    );
  });

  it("rewrites absolute http HA media URLs onto an https instance URL", () => {
    assert.equal(
      joinHassUrl(
        "https://ha.example.com",
        "http://192.0.2.10:8123/api/hls/abc/playlist.m3u8"
      ),
      "https://ha.example.com/api/hls/abc/playlist.m3u8"
    );
  });

  it("leaves non-HA http URLs unchanged when joining", () => {
    assert.equal(
      joinHassUrl(
        "https://ha.example.com",
        "http://192.168.1.50/cgi-bin/snapshot.cgi"
      ),
      "http://192.168.1.50/cgi-bin/snapshot.cgi"
    );
  });

  it("detects HLS support from capabilities or STREAM feature bit", () => {
    assert.equal(
      cameraSupportsHls({ frontend_stream_types: ["hls"] }),
      true
    );
    assert.equal(
      cameraSupportsHls(
        { frontend_stream_types: ["web_rtc"] },
        CAMERA_FEATURE_STREAM
      ),
      false
    );
    assert.equal(
      cameraSupportsHls(
        { frontend_stream_types: ["hls", "web_rtc"] },
        CAMERA_FEATURE_STREAM
      ),
      true
    );
    assert.equal(cameraSupportsHls(null, CAMERA_FEATURE_STREAM), true);
    assert.equal(cameraSupportsHls(null, 0), false);
  });

  it("detects WebRTC support from capabilities only", () => {
    assert.equal(
      cameraSupportsWebRtc({ frontend_stream_types: ["web_rtc"] }),
      true
    );
    assert.equal(
      cameraSupportsWebRtc({ frontend_stream_types: ["hls", "web_rtc"] }),
      true
    );
    assert.equal(cameraSupportsWebRtc({ frontend_stream_types: ["hls"] }), false);
    assert.equal(cameraSupportsWebRtc(null), false);
  });

  it("builds authenticated proxy URLs", () => {
    const mjpeg = getCameraMjpegUrl(
      "http://ha.local:8123",
      "camera.front",
      "tok"
    );
    assert.match(mjpeg, /\/api\/camera_proxy_stream\/camera\.front/);
    assert.match(mjpeg, /token=tok/);

    const poster = getCameraPosterUrl(
      "http://ha.local:8123",
      "camera.front",
      "tok"
    );
    assert.match(poster, /\/api\/camera_proxy\/camera\.front/);
    assert.match(poster, /token=tok/);
  });
});
