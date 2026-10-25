"use server";

import { CreatePageData, Page, UpdatePageData } from "@repo/types/page";
import { revalidatePath } from "next/cache";
import { serverLogger } from "../logger";
import * as PageStore from "../store/pages";

export async function createPage(data: CreatePageData): Promise<Page> {
  try {
    const page = await PageStore.createPage(data);
    revalidatePath("/setup/pages");
    return page;
  } catch (error) {
    serverLogger.error("pageActions.create", "Failed to create page", error);
    throw error;
  }
}

export async function updatePage(
  slug: string,
  data: UpdatePageData
): Promise<Page> {
  try {
    const page = await PageStore.updatePage(slug, data);
    revalidatePath("/setup/pages");
    revalidatePath(`/${slug}`);
    revalidatePath(`/dashboard/${slug}`);
    if (page.slug !== slug) {
      revalidatePath(`/${page.slug}`);
      revalidatePath(`/dashboard/${page.slug}`);
      revalidatePath(`/setup/pages/edit/${page.slug}`);
    }
    return page;
  } catch (error) {
    serverLogger.error("pageActions.update", "Failed to update page", error);
    throw error;
  }
}

export async function deletePage(slug: string) {
  try {
    await PageStore.deletePage(slug);
    revalidatePath("/setup/pages");
    return { success: true };
  } catch (error) {
    serverLogger.error("pageActions.delete", "Failed to delete page", error);
    throw error;
  }
}

export async function getPage(slug: string): Promise<Page> {
  try {
    const page = await PageStore.getPage(slug);
    if (!page) throw new Error("Page not found");
    return page;
  } catch (error) {
    serverLogger.error("pageActions.get", "Failed to get page", error);
    throw error;
  }
}

export async function getAllPages(): Promise<Page[]> {
  try {
    return await PageStore.getAllPages();
  } catch (error) {
    serverLogger.error("pageActions.getAll", "Failed to get all pages", error);
    throw error;
  }
}

export async function getPageBySlug(slug: string): Promise<Page> {
  try {
    const page = await PageStore.getPage(slug);
    if (!page) throw new Error("Page not found");
    return page;
  } catch (error) {
    serverLogger.error(
      "pageActions.getBySlug",
      "Failed to get page by slug",
      error
    );
    throw error;
  }
}

async function uniquePageSlug(base: string): Promise<string> {
  let slug = `${base}-copy`;
  let n = 2;
  while (await PageStore.getPage(slug)) {
    slug = `${base}-copy-${n}`;
    n += 1;
  }
  return slug;
}

export async function duplicatePage(slug: string): Promise<Page> {
  try {
    const existing = await getPage(slug);
    return createPage({
      name: `${existing.name} (copy)`,
      slug: await uniquePageSlug(existing.slug),
      puck_data: structuredClone(existing.puck_data),
      sidebar_id: existing.sidebar_id ?? null,
      theme_id: existing.theme_id ?? null,
      theme_overrides: existing.theme_overrides ?? null,
      style_id: existing.style_id ?? null,
    });
  } catch (error) {
    serverLogger.error(
      "pageActions.duplicate",
      "Failed to duplicate page",
      error
    );
    throw error;
  }
}
