import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  appendLivePoint,
  normalizeHistoryList,
  normalizeHistoryResponse,
  normalizeStatisticsResponse,
  toChartDate,
  withTimeout,
} from "./entityHistory";

describe("entityHistory helpers", () => {
  it("treats HA compressed lu seconds as unix seconds", () => {
    const seconds = 1_784_850_000;
    const d = toChartDate(seconds);
    assert.equal(d.getTime(), seconds * 1000);
  });

  it("leaves millisecond timestamps alone", () => {
    const ms = 1_784_850_000_000;
    assert.equal(toChartDate(ms).getTime(), ms);
  });

  it("parses ISO and numeric string timestamps", () => {
    assert.ok(!Number.isNaN(toChartDate("2026-07-24T00:00:00.000Z").getTime()));
    assert.equal(toChartDate("1784850000").getTime(), 1_784_850_000_000);
  });

  it("normalizes compressed history points", () => {
    const points = normalizeHistoryList([
      { s: "21.5", lu: 1_784_850_000 },
      { s: "unavailable", lu: 1_784_850_100 },
      { state: "22.0", last_updated: "2026-07-24T00:00:00Z" },
    ]);
    assert.equal(points.length, 2);
    assert.equal(points[0]?.s, "21.5");
    assert.equal(points[1]?.s, "22.0");
  });

  it("reads history response map and legacy array shape", () => {
    const id = "sensor.tank";
    assert.equal(
      normalizeHistoryResponse({ [id]: [{ s: "1", lu: 100 }] }, id).length,
      1
    );
    assert.equal(
      normalizeHistoryResponse([[{ s: "2", lu: 200 }]], id)[0]?.s,
      "2"
    );
    assert.equal(normalizeHistoryResponse(null, id).length, 0);
  });

  it("maps statistics mean/start into s/lu", () => {
    const id = "sensor.tank";
    const points = normalizeStatisticsResponse(
      {
        [id]: [
          { start: "2026-07-24T00:00:00+00:00", mean: 21.25, min: 20, max: 22 },
          { start: "2026-07-24T01:00:00+00:00", mean: null },
        ],
      },
      id
    );
    assert.equal(points.length, 1);
    assert.equal(points[0]?.s, "21.25");
    assert.equal(points[0]?.lu, "2026-07-24T00:00:00+00:00");
  });

  it("appends live points and respects limit when outside coalesce window", () => {
    const t0 = 1_784_850_000;
    const limited = appendLivePoint(
      [
        { s: "1", lu: t0 },
        { s: "2", lu: t0 + 120 },
      ],
      "3",
      t0 + 240,
      2
    );
    assert.deepEqual(limited, [
      { s: "2", lu: t0 + 120 },
      { s: "3", lu: t0 + 240 },
    ]);
    assert.deepEqual(appendLivePoint([], "bad", 1, 10), []);
  });

  it("coalesces live updates within the window by replacing the last point", () => {
    const t0 = 1_784_850_000;
    const coalesced = appendLivePoint(
      [
        { s: "1", lu: t0 },
        { s: "2", lu: t0 + 120 },
      ],
      "2.5",
      t0 + 150,
      10
    );
    assert.deepEqual(coalesced, [
      { s: "1", lu: t0 },
      { s: "2.5", lu: t0 + 150 },
    ]);
  });

  it("withTimeout rejects slow promises", async () => {
    await assert.rejects(
      () =>
        withTimeout(
          new Promise((resolve) => setTimeout(resolve, 50)),
          10,
          "slow"
        ),
      /slow timed out/
    );
  });
});
