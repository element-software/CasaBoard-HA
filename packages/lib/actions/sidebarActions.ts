"use server";

import { revalidatePath } from "next/cache";
import { serverLogger } from "../logger";
import {
  Sidebar,
  CreateSidebarData,
  UpdateSidebarData,
} from "@repo/types/sidebar";
import * as SidebarStore from "../store/sidebars";

export async function getAllSidebars(): Promise<Sidebar[]> {
  try {
    const sidebars = await SidebarStore.getAllSidebars();
    serverLogger.info(
      "getAllSidebars",
      `Retrieved ${sidebars.length} sidebars`
    );
    return sidebars;
  } catch (error) {
    serverLogger.error("getAllSidebars", "Failed to get sidebars", error);
    throw error;
  }
}

export async function getSidebar(slug: string): Promise<Sidebar> {
  try {
    const sidebar = await SidebarStore.getSidebar(slug);
    if (!sidebar) throw new Error("Sidebar not found");
    return sidebar;
  } catch (error) {
    serverLogger.error("getSidebar", `Failed to get sidebar ${slug}`, error);
    throw error;
  }
}

export async function createSidebar(
  sidebarData: CreateSidebarData
): Promise<Sidebar> {
  try {
    const finalData = {
      ...sidebarData,
      slug: sidebarData.slug || generateSlug(sidebarData.name),
    };
    const sidebar = await SidebarStore.createSidebar(finalData);
    serverLogger.info("createSidebar", `Created sidebar ${sidebar.slug}`);
    return sidebar;
  } catch (error) {
    serverLogger.error("createSidebar", "Failed to create sidebar", error);
    throw error;
  }
}

export async function updateSidebar(
  slug: string,
  sidebarData: UpdateSidebarData
): Promise<Sidebar> {
  try {
    const sidebar = await SidebarStore.updateSidebar(slug, sidebarData);
    revalidatePath("/setup/sidebars");
    if (sidebar.slug !== slug) {
      revalidatePath(`/setup/sidebars/edit/${sidebar.slug}`);
    }
    serverLogger.info(
      "updateSidebar",
      `Updated sidebar ${slug}${sidebar.slug !== slug ? ` -> ${sidebar.slug}` : ""}`
    );
    return sidebar;
  } catch (error) {
    serverLogger.error(
      "updateSidebar",
      `Failed to update sidebar ${slug}`,
      error
    );
    throw error;
  }
}

export async function deleteSidebar(slug: string): Promise<void> {
  try {
    await SidebarStore.deleteSidebar(slug);
    serverLogger.info("deleteSidebar", `Deleted sidebar ${slug}`);
  } catch (error) {
    serverLogger.error(
      "deleteSidebar",
      `Failed to delete sidebar ${slug}`,
      error
    );
    throw error;
  }
}

async function uniqueSidebarSlug(base: string): Promise<string> {
  let slug = `${base}-copy`;
  let n = 2;
  while (await SidebarStore.getSidebar(slug)) {
    slug = `${base}-copy-${n}`;
    n += 1;
  }
  return slug;
}

export async function duplicateSidebar(slug: string): Promise<Sidebar> {
  try {
    const existing = await getSidebar(slug);
    const sidebar = await createSidebar({
      name: `${existing.name} (copy)`,
      slug: await uniqueSidebarSlug(existing.slug),
      puck_data: structuredClone(existing.puck_data),
      theme_id: existing.theme_id ?? null,
      style_id: existing.style_id ?? null,
    });
    revalidatePath("/setup/sidebars");
    serverLogger.info(
      "duplicateSidebar",
      `Duplicated sidebar ${slug} -> ${sidebar.slug}`
    );
    return sidebar;
  } catch (error) {
    serverLogger.error(
      "duplicateSidebar",
      `Failed to duplicate sidebar ${slug}`,
      error
    );
    throw error;
  }
}

export async function updateSidebarData(
  slug: string,
  puckData: any
): Promise<Sidebar> {
  try {
    const sidebar = await SidebarStore.updateSidebar(slug, {
      puck_data: puckData,
    });
    serverLogger.info("updateSidebarData", `Updated sidebar data for ${slug}`);
    return sidebar;
  } catch (error) {
    serverLogger.error(
      "updateSidebarData",
      `Failed to update sidebar data for ${slug}`,
      error
    );
    throw error;
  }
}

// Helper function for generating slugs
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
