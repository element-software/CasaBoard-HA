/**
 * External entity map for Home Assistant state.
 *
 * `subscribeEntities` replaces the whole map on every update, but unchanged
 * entity objects keep the same reference. Hooks use `useSyncExternalStore`
 * against this store so React only re-renders when the selected snapshot
 * actually changes (Object.is), not on every unrelated sensor tick.
 */

export type HassEntityMap = Record<string, any>;

export type EntitySummary = {
  id: string;
  domain: string;
  entity: any;
};

type Listener = () => void;

let entities: HassEntityMap = {};
let entityCount = 0;
let globalVersion = 0;
const domainVersions = new Map<string, number>();
const listeners = new Set<Listener>();

const domainListCache = new Map<
  string,
  { version: number; list: EntitySummary[] }
>();
const idsMapCache = new Map<
  string,
  { refs: any[]; map: HassEntityMap }
>();
const triggerStatesCache = new Map<
  string,
  { refs: Array<any | undefined>; states: Array<string | undefined> }
>();

function domainOf(entityId: string): string {
  return String(entityId).split(".")[0] ?? "";
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

function bumpDomain(domain: string): void {
  if (!domain) return;
  domainVersions.set(domain, (domainVersions.get(domain) ?? 0) + 1);
}

/** Diff prev→next and bump only domains whose entity refs changed. */
function noteChangedDomains(prev: HassEntityMap, next: HassEntityMap): void {
  for (const id of Object.keys(prev)) {
    if (prev[id] !== next[id]) bumpDomain(domainOf(id));
  }
  for (const id of Object.keys(next)) {
    if (!(id in prev)) bumpDomain(domainOf(id));
  }
}

export function subscribeEntityStore(onStoreChange: Listener): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

export function getEntitySnapshot(): HassEntityMap {
  return entities;
}

export function getEntityCountSnapshot(): number {
  return entityCount;
}

export function getEntityById(entityId: string): any | undefined {
  if (!entityId) return undefined;
  return entities[entityId];
}

export function getDomainEntitiesSnapshot(domain?: string): EntitySummary[] {
  const key = domain ? domain.toLowerCase() : "";
  const version = key
    ? (domainVersions.get(key) ?? 0)
    : globalVersion;
  const cached = domainListCache.get(key);
  if (cached && cached.version === version) return cached.list;

  const list: EntitySummary[] = [];
  for (const [id, entity] of Object.entries(entities)) {
    const entityDomain = domainOf(id);
    if (key && entityDomain !== key) continue;
    list.push({ id, domain: entityDomain, entity });
  }

  domainListCache.set(key, { version, list });
  return list;
}

/**
 * Map of the given ids → entity. Snapshot reference is stable while every
 * selected entity reference is unchanged.
 */
export function getEntitiesByIdsSnapshot(entityIds: string[]): HassEntityMap {
  const key = entityIds.join("\0");
  const refs = entityIds.map((id) => (id ? entities[id] : undefined));
  const cached = idsMapCache.get(key);
  if (
    cached &&
    cached.refs.length === refs.length &&
    cached.refs.every((ref, i) => ref === refs[i])
  ) {
    return cached.map;
  }

  const map: HassEntityMap = {};
  entityIds.forEach((id, i) => {
    if (id && refs[i] !== undefined) map[id] = refs[i];
  });
  idsMapCache.set(key, { refs, map });
  return map;
}

/**
 * Parallel state strings for trigger entity ids. Stable while those entities
 * are unchanged (used by event-popup triggers).
 */
export function getTriggerStatesSnapshot(
  entityIds: string[]
): Array<string | undefined> {
  const key = entityIds.join("\0");
  const refs = entityIds.map((id) => (id ? entities[id] : undefined));
  const cached = triggerStatesCache.get(key);
  if (
    cached &&
    cached.refs.length === refs.length &&
    cached.refs.every((ref, i) => ref === refs[i])
  ) {
    return cached.states;
  }

  const states = refs.map((entity) =>
    entity ? (entity.state as string | undefined) : undefined
  );
  triggerStatesCache.set(key, { refs, states });
  return states;
}

export function replaceEntitySnapshot(next: HassEntityMap): void {
  if (next === entities) return;
  const prev = entities;
  noteChangedDomains(prev, next);
  entities = next;
  entityCount = Object.keys(next).length;
  globalVersion += 1;
  // Domain list caches key on domainVersions; id/trigger caches compare entity refs.
  // Do not clear those maps here — clearing would allocate new snapshots every tick
  // and defeat useSyncExternalStore's Object.is bailout.
  domainListCache.delete("");
  notify();
}

export function clearEntitySnapshot(): void {
  if (entityCount === 0 && Object.keys(entities).length === 0) return;
  replaceEntitySnapshot({});
}

/** Test helper: reset module state between cases. */
export function __resetEntityStoreForTests(): void {
  entities = {};
  entityCount = 0;
  globalVersion = 0;
  domainVersions.clear();
  domainListCache.clear();
  idsMapCache.clear();
  triggerStatesCache.clear();
  listeners.clear();
}
