import type { Page } from "./page";
import type { Sidebar } from "./sidebar";
import type { Theme } from "./theme";

export const SETTINGS_BUNDLE_VERSION = 1;

export interface SettingsBundle {
  version: typeof SETTINGS_BUNDLE_VERSION;
  exported_at: string;
  pages: Page[];
  sidebars: Sidebar[];
  themes: Theme[];
}

export type ImportDiffStatus = "added" | "updated" | "unchanged" | "removed";

export interface ImportDiffEntry {
  key: string;
  name: string;
  status: ImportDiffStatus;
}

export interface ImportDiff {
  pages: ImportDiffEntry[];
  sidebars: ImportDiffEntry[];
  themes: ImportDiffEntry[];
}
