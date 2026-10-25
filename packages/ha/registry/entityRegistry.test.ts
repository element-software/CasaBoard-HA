import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Connection } from "home-assistant-js-websocket";
import {
  findProblematicEntities,
  listEntityRegistry,
  removeEntityRegistryEntry,
  removeEntityRegistryEntries,
  type EntityRegistryEntry,
} from "./entityRegistry";

function mockConnection(
  handler: (msg: Record<string, unknown>) => unknown
): Connection {
  return {
    sendMessagePromise: async (msg: Record<string, unknown>) => handler(msg),
  } as unknown as Connection;
}

describe("listEntityRegistry", () => {
  it("sends config/entity_registry/list", async () => {
    const entries: EntityRegistryEntry[] = [
      { entity_id: "sensor.dead", name: "Dead" },
    ];
    let captured: Record<string, unknown> | null = null;
    const connection = mockConnection((msg) => {
      captured = msg;
      return entries;
    });

    const result = await listEntityRegistry(connection);
    assert.deepEqual(captured, { type: "config/entity_registry/list" });
    assert.deepEqual(result, entries);
  });
});

describe("removeEntityRegistryEntry", () => {
  it("sends config/entity_registry/remove with entity_id", async () => {
    let captured: Record<string, unknown> | null = null;
    const connection = mockConnection((msg) => {
      captured = msg;
      return null;
    });

    await removeEntityRegistryEntry(connection, "sensor.dead");
    assert.deepEqual(captured, {
      type: "config/entity_registry/remove",
      entity_id: "sensor.dead",
    });
  });
});

describe("removeEntityRegistryEntries", () => {
  it("removes sequentially and collects failures", async () => {
    const connection = mockConnection((msg) => {
      if (msg.entity_id === "sensor.fail") {
        throw new Error("not found");
      }
      return null;
    });

    const result = await removeEntityRegistryEntries(connection, [
      "sensor.ok",
      "sensor.fail",
      "sensor.also_ok",
    ]);

    assert.deepEqual(result.removed, ["sensor.ok", "sensor.also_ok"]);
    assert.equal(result.failed.length, 1);
    assert.equal(result.failed[0]?.entityId, "sensor.fail");
    assert.match(result.failed[0]?.error ?? "", /not found/);
  });
});

describe("findProblematicEntities", () => {
  const entries: EntityRegistryEntry[] = [
    { entity_id: "sensor.live", name: "Live", original_name: "Live Orig" },
    { entity_id: "sensor.gone", name: null, original_name: "Gone" },
    { entity_id: "light.down", name: "Down" },
    { entity_id: "switch.mystery", name: "Mystery" },
    { entity_id: "sensor.off", name: "Off", disabled_by: "user" },
  ];

  it("flags orphaned, unavailable, and unknown", () => {
    const states = {
      "sensor.live": { state: "23.5" },
      "light.down": { state: "unavailable" },
      "switch.mystery": { state: "unknown" },
    };

    const result = findProblematicEntities(entries, states);
    assert.equal(result.length, 3);

    const byId = Object.fromEntries(
      result.map((row) => [row.entry.entity_id, row])
    );
    assert.equal(byId["sensor.gone"]?.reason, "orphaned");
    assert.equal(byId["sensor.gone"]?.displayName, "Gone");
    assert.equal(byId["light.down"]?.reason, "unavailable");
    assert.equal(byId["switch.mystery"]?.reason, "unknown");
    assert.equal(byId["sensor.live"], undefined);
    assert.equal(byId["sensor.off"], undefined);
  });

  it("sorts by entity_id", () => {
    const states = {
      "light.down": { state: "unavailable" },
      "switch.mystery": { state: "unknown" },
    };
    const result = findProblematicEntities(entries, states);
    const ids = result.map((row) => row.entry.entity_id);
    assert.deepEqual(ids, [...ids].sort());
  });
});
