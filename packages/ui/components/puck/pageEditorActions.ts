"use server";

import { PageActions } from "@repo/lib";
import type { CreatePageData, UpdatePageData } from "@repo/types/page";

export async function createPageEditorAction(data: CreatePageData) {
  return PageActions.createPage(data);
}

export async function updatePageEditorAction(
  slug: string,
  data: UpdatePageData
) {
  return PageActions.updatePage(slug, data);
}
