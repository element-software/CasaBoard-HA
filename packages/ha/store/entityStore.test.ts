import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  __resetEntityStoreForTests,
  getDomainEntitiesSnapshot,
  getEntitiesByIdsSnapshot,
  getEntityById,
  getEntityCountSnapshot,
  getTriggerStatesSnapshot,
  replaceEntitySnapshot,
  subscribeEntityStore,
} from "./entityStore";

function entity(id: string, state: string) {
  return { entity_id: id, state, attributes: {} };
}

describe("entityStore selective snapshots", () => {
  beforeEach(() => {
    __resetEntityStoreForTests();
  });

  it("keeps an unchanged entity reference when a different entity updates", () => {
    const lightA = entity("light.a", "on");
    const sensorB = entity("sensor.b", "1");
    replaceEntitySnapshot({ "light.a": lightA, "sensor.b": sensorB });

    const nextSensor = entity("sensor.b", "2");
    replaceEntitySnapshot({ "light.a": lightA, "sensor.b": nextSensor });

    assert.equal(getEntityById("light.a"), lightA);
    assert.equal(getEntityById("sensor.b"), nextSensor);
  });

  it("keeps getEntityById Object.is-stable across unrelated entity updates", () => {
    const lightA = entity("light.a", "on");
    replaceEntitySnapshot({
      "light.a": lightA,
      "sensor.b": entity("sensor.b", "1"),
    });

    const before = getEntityById("light.a");
    replaceEntitySnapshot({
      "light.a": lightA,
      "sensor.b": entity("sensor.b", "2"),
    });
    const after = getEntityById("light.a");

    assert.equal(before, after);
  });

  it("returns a stable domain list snapshot when only another domain changes", () => {
    const lightA = entity("light.a", "on");
    replaceEntitySnapshot({
      "light.a": lightA,
      "sensor.b": entity("sensor.b", "1"),
    });

    const first = getDomainEntitiesSnapshot("light");
    replaceEntitySnapshot({
      "light.a": lightA,
      "sensor.b": entity("sensor.b", "99"),
    });
    const second = getDomainEntitiesSnapshot("light");

    assert.equal(second, first);
    assert.equal(second[0]?.entity, lightA);
  });

  it("rebuilds a domain list when an entity in that domain changes", () => {
    const lightA = entity("light.a", "on");
    replaceEntitySnapshot({ "light.a": lightA });

    const first = getDomainEntitiesSnapshot("light");
    const lightAOff = entity("light.a", "off");
    replaceEntitySnapshot({ "light.a": lightAOff });
    const second = getDomainEntitiesSnapshot("light");

    assert.notEqual(second, first);
    assert.equal(second[0]?.entity, lightAOff);
  });

  it("returns a stable by-ids map when selected entities are unchanged", () => {
    const lightA = entity("light.a", "on");
    const cam = entity("camera.front", "idle");
    replaceEntitySnapshot({
      "light.a": lightA,
      "camera.front": cam,
      "sensor.b": entity("sensor.b", "1"),
    });

    const ids = ["light.a", "camera.front"];
    const first = getEntitiesByIdsSnapshot(ids);
    replaceEntitySnapshot({
      "light.a": lightA,
      "camera.front": cam,
      "sensor.b": entity("sensor.b", "2"),
    });
    const second = getEntitiesByIdsSnapshot(ids);

    assert.equal(second, first);
  });

  it("returns stable trigger states when trigger entities are unchanged", () => {
    const binary = entity("binary_sensor.door", "off");
    replaceEntitySnapshot({
      "binary_sensor.door": binary,
      "sensor.b": entity("sensor.b", "1"),
    });

    const ids = ["binary_sensor.door"];
    const first = getTriggerStatesSnapshot(ids);
    replaceEntitySnapshot({
      "binary_sensor.door": binary,
      "sensor.b": entity("sensor.b", "2"),
    });
    const second = getTriggerStatesSnapshot(ids);

    assert.equal(second, first);
    assert.deepEqual(second, ["off"]);
  });

  it("keeps entity count snapshot stable when count is unchanged", () => {
    replaceEntitySnapshot({
      "light.a": entity("light.a", "on"),
      "sensor.b": entity("sensor.b", "1"),
    });
    const first = getEntityCountSnapshot();
    replaceEntitySnapshot({
      "light.a": entity("light.a", "off"),
      "sensor.b": entity("sensor.b", "2"),
    });
    assert.equal(getEntityCountSnapshot(), first);
  });

  it("notifies subscribers on replace", () => {
    let calls = 0;
    const unsub = subscribeEntityStore(() => {
      calls += 1;
    });
    replaceEntitySnapshot({ "light.a": entity("light.a", "on") });
    replaceEntitySnapshot({ "light.a": entity("light.a", "off") });
    unsub();
    replaceEntitySnapshot({ "light.a": entity("light.a", "on") });
    assert.equal(calls, 2);
  });
});
