import { Data } from "@measured/puck";
import type { StyleId } from "./style";

export interface Sidebar {
  id: string;
  name: string;
  slug: string;
  puck_data: Data;
  theme_id?: string | null;
  style_id?: StyleId | null;
  created_at: string;
  updated_at: string;
}

export interface CreateSidebarData {
  name: string;
  slug: string;
  puck_data: Data;
  theme_id?: string | null;
  style_id?: StyleId | null;
}

export interface UpdateSidebarData {
  name?: string;
  slug?: string;
  puck_data?: Data;
  theme_id?: string | null;
  style_id?: StyleId | null;
}
