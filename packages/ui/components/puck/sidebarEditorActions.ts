"use server";

import { SidebarActions } from "@repo/lib";
import type { CreateSidebarData, UpdateSidebarData } from "@repo/types/sidebar";

export async function createSidebarEditorAction(data: CreateSidebarData) {
  return SidebarActions.createSidebar(data);
}

export async function updateSidebarEditorAction(
  slug: string,
  data: UpdateSidebarData
) {
  return SidebarActions.updateSidebar(slug, data);
}
