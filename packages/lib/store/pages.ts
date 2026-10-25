import { randomUUID } from "crypto";
import type { CreatePageData, Page, UpdatePageData } from "@repo/types/page";
import { readJson, writeJson } from "./jsonFile";
import { getSidebarById } from "./sidebars";

const FILE = "pages.json";

type PageMap = Record<string, Page>;

async function readAll(): Promise<PageMap> {
  return readJson<PageMap>(FILE, {});
}

async function withSidebar(page: Page): Promise<Page> {
  if (!page.sidebar_id) return page;
  const sidebar = await getSidebarById(page.sidebar_id);
  return sidebar ? { ...page, sidebar } : page;
}

export async function getAllPages(): Promise<Page[]> {
  const all = await readAll();
  const pages = Object.values(all).sort((a, b) =>
    b.created_at.localeCompare(a.created_at)
  );
  return Promise.all(pages.map(withSidebar));
}

export async function getPage(slug: string): Promise<Page | null> {
  const all = await readAll();
  const page = all[slug];
  return page ? withSidebar(page) : null;
}

export async function createPage(data: CreatePageData): Promise<Page> {
  const all = await readAll();
  if (all[data.slug]) {
    throw new Error("A page with this slug already exists");
  }
  const now = new Date().toISOString();
  const page: Page = {
    id: randomUUID(),
    name: data.name,
    slug: data.slug,
    puck_data: data.puck_data,
    published: true,
    sidebar_id: data.sidebar_id ?? null,
    theme_id: data.theme_id ?? null,
    theme_overrides: data.theme_overrides ?? null,
    style_id: data.style_id ?? null,
    created_at: now,
    updated_at: now,
  };
  all[page.slug] = page;
  await writeJson(FILE, all);
  return withSidebar(page);
}

export async function updatePage(
  slug: string,
  data: UpdatePageData
): Promise<Page> {
  const all = await readAll();
  const existing = all[slug];
  if (!existing) throw new Error("Page not found");
  const updated: Page = {
    ...existing,
    ...data,
    updated_at: new Date().toISOString(),
  };
  const newKey = updated.slug;
  if (newKey !== slug) {
    if (all[newKey]) {
      throw new Error("A page with this slug already exists");
    }
    delete all[slug];
  }
  all[newKey] = updated;
  await writeJson(FILE, all);
  return withSidebar(updated);
}

export async function deletePage(slug: string): Promise<void> {
  const all = await readAll();
  delete all[slug];
  await writeJson(FILE, all);
}

/** Overwrites the whole store, used to restore an exported settings bundle. */
export async function replaceAllPages(pages: Page[]): Promise<void> {
  const all: PageMap = {};
  for (const page of pages) all[page.slug] = page;
  await writeJson(FILE, all);
}

/** Upserts by slug, keeping existing pages not present in `pages`. */
export async function mergePages(pages: Page[]): Promise<void> {
  const all = await readAll();
  for (const page of pages) all[page.slug] = page;
  await writeJson(FILE, all);
}
