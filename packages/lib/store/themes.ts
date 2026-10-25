import { randomUUID } from "crypto";
import type { Theme } from "@repo/types/theme";
import { readJson, writeJson } from "./jsonFile";

const FILE = "themes.json";

type ThemeMap = Record<string, Theme>;

async function readAll(): Promise<ThemeMap> {
  return readJson<ThemeMap>(FILE, {});
}

export async function listThemes(): Promise<Theme[]> {
  const all = await readAll();
  return Object.values(all).sort((a, b) =>
    b.updated_at.localeCompare(a.updated_at)
  );
}

export async function getThemeById(id: string): Promise<Theme | null> {
  const all = await readAll();
  return all[id] ?? null;
}

export async function createTheme(
  name: string,
  tokens: Theme["tokens"]
): Promise<Theme> {
  const all = await readAll();
  const now = new Date().toISOString();
  const theme: Theme = {
    id: randomUUID(),
    name,
    tokens,
    created_at: now,
    updated_at: now,
  };
  all[theme.id] = theme;
  await writeJson(FILE, all);
  return theme;
}

export async function updateTheme(
  id: string,
  patch: Partial<Pick<Theme, "name" | "tokens">>
): Promise<Theme> {
  const all = await readAll();
  const existing = all[id];
  if (!existing) throw new Error("Theme not found");
  const updated: Theme = {
    ...existing,
    ...patch,
    updated_at: new Date().toISOString(),
  };
  all[id] = updated;
  await writeJson(FILE, all);
  return updated;
}

export async function deleteTheme(id: string): Promise<void> {
  const all = await readAll();
  delete all[id];
  await writeJson(FILE, all);
}

/** Overwrites the whole store, used to restore an exported settings bundle. */
export async function replaceAllThemes(themes: Theme[]): Promise<void> {
  const all: ThemeMap = {};
  for (const theme of themes) all[theme.id] = theme;
  await writeJson(FILE, all);
}

/** Upserts by id, keeping existing themes not present in `themes`. */
export async function mergeThemes(themes: Theme[]): Promise<void> {
  const all = await readAll();
  for (const theme of themes) all[theme.id] = theme;
  await writeJson(FILE, all);
}
