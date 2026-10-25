import { randomUUID } from "crypto";
import type {
  CreateSidebarData,
  Sidebar,
  UpdateSidebarData,
} from "@repo/types/sidebar";
import { readJson, writeJson } from "./jsonFile";

const FILE = "sidebars.json";

type SidebarMap = Record<string, Sidebar>;

async function readAll(): Promise<SidebarMap> {
  return readJson<SidebarMap>(FILE, {});
}

/** Resolve by map key first, then by sidebar.slug (handles key drift). */
function findSidebarEntry(
  all: SidebarMap,
  slug: string
): { key: string; sidebar: Sidebar } | null {
  const byKey = all[slug];
  if (byKey) return { key: slug, sidebar: byKey };
  const entry = Object.entries(all).find(([, s]) => s.slug === slug);
  if (!entry) return null;
  return { key: entry[0], sidebar: entry[1] };
}

export async function getAllSidebars(): Promise<Sidebar[]> {
  const all = await readAll();
  return Object.values(all).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
}

export async function getSidebar(slug: string): Promise<Sidebar | null> {
  const all = await readAll();
  return findSidebarEntry(all, slug)?.sidebar ?? null;
}

export async function getSidebarById(id: string): Promise<Sidebar | null> {
  const all = await readAll();
  return Object.values(all).find((s) => s.id === id) ?? null;
}

export async function createSidebar(
  data: CreateSidebarData
): Promise<Sidebar> {
  const all = await readAll();
  if (findSidebarEntry(all, data.slug)) {
    throw new Error("A sidebar with this slug already exists");
  }
  const now = new Date().toISOString();
  const sidebar: Sidebar = {
    id: randomUUID(),
    name: data.name,
    slug: data.slug,
    puck_data: data.puck_data,
    theme_id: data.theme_id ?? null,
    style_id: data.style_id ?? null,
    created_at: now,
    updated_at: now,
  };
  all[sidebar.slug] = sidebar;
  await writeJson(FILE, all);
  return sidebar;
}

export async function updateSidebar(
  slug: string,
  data: UpdateSidebarData
): Promise<Sidebar> {
  const all = await readAll();
  const found = findSidebarEntry(all, slug);
  if (!found) throw new Error("Sidebar not found");
  const updated: Sidebar = {
    ...found.sidebar,
    ...data,
    updated_at: new Date().toISOString(),
  };
  const newKey = updated.slug;
  if (found.key !== newKey) {
    const conflict = findSidebarEntry(all, newKey);
    if (conflict && conflict.sidebar.id !== found.sidebar.id) {
      throw new Error("A sidebar with this slug already exists");
    }
    delete all[found.key];
  }
  all[newKey] = updated;
  await writeJson(FILE, all);
  return updated;
}

export async function deleteSidebar(slug: string): Promise<void> {
  const all = await readAll();
  const found = findSidebarEntry(all, slug);
  if (!found) return;
  delete all[found.key];
  await writeJson(FILE, all);
}

/** Overwrites the whole store, used to restore an exported settings bundle. */
export async function replaceAllSidebars(sidebars: Sidebar[]): Promise<void> {
  const all: SidebarMap = {};
  for (const sidebar of sidebars) all[sidebar.slug] = sidebar;
  await writeJson(FILE, all);
}

/** Upserts by slug, keeping existing sidebars not present in `sidebars`. */
export async function mergeSidebars(sidebars: Sidebar[]): Promise<void> {
  const all = await readAll();
  for (const sidebar of sidebars) all[sidebar.slug] = sidebar;
  await writeJson(FILE, all);
}
