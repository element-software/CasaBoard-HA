"use server";

import { revalidatePath } from "next/cache";
import type { Data } from "@measured/puck";
import type { Page } from "@repo/types/page";
import type { Sidebar } from "@repo/types/sidebar";
import type { Theme } from "@repo/types/theme";
import {
  SETTINGS_BUNDLE_VERSION,
  type ImportDiff,
  type ImportDiffEntry,
  type SettingsBundle,
} from "@repo/types/settingsBundle";
import { serverLogger } from "../logger";
import * as PageStore from "../store/pages";
import * as SidebarStore from "../store/sidebars";
import * as ThemeStore from "../store/themes";

export type ImportMode = "merge" | "replace";

/** Snapshot of every setting except HA credentials, for backup/restore. */
export async function exportSettings(): Promise<SettingsBundle> {
  const [pages, sidebars, themes] = await Promise.all([
    PageStore.getAllPages(),
    SidebarStore.getAllSidebars(),
    ThemeStore.listThemes(),
  ]);
  return {
    version: SETTINGS_BUNDLE_VERSION,
    exported_at: new Date().toISOString(),
    // drop the resolved `sidebar` object; only sidebar_id is stored data
    pages: pages.map(({ sidebar: _sidebar, ...page }) => page),
    sidebars,
    themes,
  };
}

function isPuckData(value: unknown): value is Data {
  return (
    !!value &&
    typeof value === "object" &&
    Array.isArray((value as { content?: unknown }).content)
  );
}

function isPage(value: unknown): value is Page {
  if (!value || typeof value !== "object") return false;
  const p = value as Partial<Page>;
  return (
    typeof p.id === "string" &&
    typeof p.name === "string" &&
    typeof p.slug === "string" &&
    typeof p.created_at === "string" &&
    typeof p.updated_at === "string" &&
    isPuckData(p.puck_data)
  );
}

function isSidebar(value: unknown): value is Sidebar {
  if (!value || typeof value !== "object") return false;
  const s = value as Partial<Sidebar>;
  return (
    typeof s.id === "string" &&
    typeof s.name === "string" &&
    typeof s.slug === "string" &&
    typeof s.created_at === "string" &&
    typeof s.updated_at === "string" &&
    isPuckData(s.puck_data)
  );
}

function isTheme(value: unknown): value is Theme {
  if (!value || typeof value !== "object") return false;
  const t = value as Partial<Theme>;
  return (
    typeof t.id === "string" &&
    typeof t.name === "string" &&
    typeof t.created_at === "string" &&
    typeof t.updated_at === "string" &&
    typeof t.tokens === "object" &&
    t.tokens !== null
  );
}

function assertBundle(bundle: unknown): asserts bundle is SettingsBundle {
  if (!bundle || typeof bundle !== "object") {
    throw new Error("Not a valid CasaBoard settings file");
  }
  const b = bundle as Partial<SettingsBundle>;
  if (b.version !== SETTINGS_BUNDLE_VERSION) {
    throw new Error("This settings file is from an unsupported version of CasaBoard");
  }
  if (!Array.isArray(b.pages) || !b.pages.every(isPage)) {
    throw new Error("Settings file contains an invalid page");
  }
  if (!Array.isArray(b.sidebars) || !b.sidebars.every(isSidebar)) {
    throw new Error("Settings file contains an invalid sidebar");
  }
  if (!Array.isArray(b.themes) || !b.themes.every(isTheme)) {
    throw new Error("Settings file contains an invalid theme");
  }
}

/** True if two records are equivalent for diff purposes (ignores field order). */
function recordsEqual(a: unknown, b: unknown): boolean {
  return JSON.stringify(a) === JSON.stringify(b);
}

function diffCollection<T extends { name: string }>(
  key: (item: T) => string,
  existing: T[],
  incoming: T[],
  mode: ImportMode
): ImportDiffEntry[] {
  const existingByKey = new Map(existing.map((item) => [key(item), item]));
  const incomingKeys = new Set(incoming.map(key));
  const entries: ImportDiffEntry[] = [];

  for (const item of incoming) {
    const k = key(item);
    const prev = existingByKey.get(k);
    entries.push({
      key: k,
      name: item.name,
      status: !prev ? "added" : recordsEqual(prev, item) ? "unchanged" : "updated",
    });
  }

  if (mode === "replace") {
    for (const item of existing) {
      const k = key(item);
      if (!incomingKeys.has(k)) {
        entries.push({ key: k, name: item.name, status: "removed" });
      }
    }
  }

  return entries;
}

/** Computes what an import would add/change/remove, without writing anything. */
export async function previewImport(
  bundle: unknown,
  mode: ImportMode = "merge"
): Promise<ImportDiff> {
  assertBundle(bundle);
  const [existingPages, existingSidebars, existingThemes] = await Promise.all([
    PageStore.getAllPages(),
    SidebarStore.getAllSidebars(),
    ThemeStore.listThemes(),
  ]);

  return {
    pages: diffCollection(
      (p) => p.slug,
      existingPages.map(({ sidebar: _sidebar, ...page }) => page),
      bundle.pages,
      mode
    ),
    sidebars: diffCollection((s) => s.slug, existingSidebars, bundle.sidebars, mode),
    themes: diffCollection((t) => t.id, existingThemes, bundle.themes, mode),
  };
}

/**
 * Restores a previously exported bundle.
 * "replace" wipes pages/sidebars/themes and writes the bundle in their place.
 * "merge" upserts by slug/id, leaving anything not in the bundle untouched.
 */
export async function importSettings(
  bundle: unknown,
  mode: ImportMode = "replace"
): Promise<void> {
  try {
    assertBundle(bundle);
    if (mode === "replace") {
      await ThemeStore.replaceAllThemes(bundle.themes);
      await SidebarStore.replaceAllSidebars(bundle.sidebars);
      await PageStore.replaceAllPages(bundle.pages);
    } else {
      await ThemeStore.mergeThemes(bundle.themes);
      await SidebarStore.mergeSidebars(bundle.sidebars);
      await PageStore.mergePages(bundle.pages);
    }
    revalidatePath("/", "layout");
  } catch (error) {
    serverLogger.error(
      "settingsActions.import",
      "Failed to import settings",
      error
    );
    throw error;
  }
}
