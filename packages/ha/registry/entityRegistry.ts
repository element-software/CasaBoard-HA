import type { Connection } from "home-assistant-js-websocket";

/** Subset of Home Assistant entity registry entry fields used for cleanup. */
export interface EntityRegistryEntry {
  entity_id: string;
  name: string | null;
  original_name?: string | null;
  platform?: string | null;
  config_entry_id?: string | null;
  device_id?: string | null;
  area_id?: string | null;
  disabled_by?: string | null;
  hidden_by?: string | null;
  entity_category?: string | null;
}

export type ProblematicEntityReason = "unavailable" | "unknown" | "orphaned";

export interface ProblematicEntity {
  entry: EntityRegistryEntry;
  state: string | null;
  reason: ProblematicEntityReason;
  displayName: string;
}

export async function listEntityRegistry(
  connection: Connection
): Promise<EntityRegistryEntry[]> {
  const result = await connection.sendMessagePromise({
    type: "config/entity_registry/list",
  });
  return result as EntityRegistryEntry[];
}

export async function removeEntityRegistryEntry(
  connection: Connection,
  entityId: string
): Promise<void> {
  await connection.sendMessagePromise({
    type: "config/entity_registry/remove",
    entity_id: entityId,
  });
}

export async function removeEntityRegistryEntries(
  connection: Connection,
  entityIds: string[]
): Promise<{
  removed: string[];
  failed: { entityId: string; error: string }[];
}> {
  const removed: string[] = [];
  const failed: { entityId: string; error: string }[] = [];

  for (const entityId of entityIds) {
    try {
      await removeEntityRegistryEntry(connection, entityId);
      removed.push(entityId);
    } catch (err) {
      failed.push({
        entityId,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return { removed, failed };
}

function displayNameFor(entry: EntityRegistryEntry): string {
  return entry.name || entry.original_name || entry.entity_id;
}

function isDisabled(entry: EntityRegistryEntry): boolean {
  return Boolean(entry.disabled_by);
}

/**
 * Join registry entries with live states and flag cleanup candidates.
 * Disabled entities are skipped — they have no state by design.
 */
export function findProblematicEntities(
  entries: EntityRegistryEntry[],
  states: Record<string, { state?: string } | undefined>
): ProblematicEntity[] {
  const problematic: ProblematicEntity[] = [];

  for (const entry of entries) {
    if (isDisabled(entry)) continue;

    const live = states[entry.entity_id];
    const state = live?.state ?? null;
    let reason: ProblematicEntityReason | null = null;

    if (live == null) {
      reason = "orphaned";
    } else if (state === "unavailable") {
      reason = "unavailable";
    } else if (state === "unknown") {
      reason = "unknown";
    }

    if (reason) {
      problematic.push({
        entry,
        state,
        reason,
        displayName: displayNameFor(entry),
      });
    }
  }

  return problematic.sort((a, b) =>
    a.entry.entity_id.localeCompare(b.entry.entity_id)
  );
}
