"use client";

import { useMemo, useSyncExternalStore } from "react";
import { useHA } from "../provider/HAProvider";
import {
  getEntityById,
  subscribeEntityStore,
} from "../store/entityStore";

// Generic service caller for any entity
function callService(
  connection: any,
  domain: string,
  service: string,
  entityId: string,
  data: Record<string, any> = {}
) {
  if (!connection) throw new Error("No HA connection available");
  return connection.sendMessagePromise({
    type: "call_service",
    domain,
    service,
    service_data: { entity_id: entityId, ...data },
  });
}

// Map of domain to available services
const DOMAIN_SERVICES: Record<string, string[]> = {
  light: ["toggle", "turn_on", "turn_off"],
  switch: ["toggle", "turn_on", "turn_off"],
  cover: ["open_cover", "close_cover", "toggle"],
  climate: [
    "set_temperature",
    "set_hvac_mode",
    "set_fan_mode",
    "turn_on",
    "turn_off",
  ],
  media_player: [
    "play_media",
    "media_play",
    "media_pause",
    "media_play_pause",
    "media_stop",
    "media_next_track",
    "media_previous_track",
    "media_seek",
    "volume_set",
    "volume_mute",
    "volume_up",
    "volume_down",
    "select_source",
    "select_sound_mode",
    "shuffle_set",
    "repeat_set",
    "turn_on",
    "turn_off",
    "toggle",
  ],
  lock: ["lock", "unlock"],
  fan: ["toggle", "turn_on", "turn_off"],
};

/**
 * Read a single entity from the shared entity store.
 * Re-renders only when that entity's state object reference changes.
 */
export function useEntity<T = any>(entityId: string) {
  const { connection } = useHA();
  const state = useSyncExternalStore(
    subscribeEntityStore,
    () => (entityId ? getEntityById(entityId) : undefined),
    () => undefined
  ) as T | undefined;

  return useMemo(() => {
    if (!entityId || !state) return null;

    const domain = String(entityId).split(".")[0];
    const services = DOMAIN_SERVICES[domain] || [];
    const serviceMethods: Record<string, (...args: any[]) => Promise<any>> = {};

    services.forEach((service) => {
      serviceMethods[service] = (data: Record<string, any> = {}) =>
        callService(connection, domain, service, entityId, data);
    });

    serviceMethods.callService = (
      service: string,
      data: Record<string, any> = {}
    ) => callService(connection, domain, service, entityId, data);

    return {
      ...state,
      ...serviceMethods,
    };
  }, [state, connection, entityId]);
}
