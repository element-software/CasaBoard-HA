import { Data } from "@measured/puck";
import type { ThemeTokens } from "./theme";
import type { StyleId } from "./style";
import { Sidebar } from "@repo/types/sidebar";

export interface Page {
  id: string;
  name: string;
  slug: string;
  puck_data: Data;
  /** @deprecated Kept for existing data files; all pages are live in the app. */
  published?: boolean;
  sidebar_id?: string | null;
  sidebar?: Sidebar;
  theme_id?: string | null;
  theme_overrides?: ThemeTokens | null;
  style_id?: StyleId | null;
  created_at: string;
  updated_at: string;
}

export interface CreatePageData {
  name: string;
  slug: string;
  puck_data: Data;
  sidebar_id?: string | null;
  theme_id?: string | null;
  theme_overrides?: ThemeTokens | null;
  style_id?: StyleId | null;
}

export interface UpdatePageData {
  name?: string;
  slug?: string;
  puck_data?: Data;
  sidebar_id?: string | null;
  theme_id?: string | null;
  theme_overrides?: ThemeTokens | null;
  style_id?: StyleId | null;
}
