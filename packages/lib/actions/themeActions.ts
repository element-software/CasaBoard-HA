"use server";

import type {
  CreateThemeInput,
  Theme,
  UpdateThemeInput,
} from "@repo/types/theme";
import { revalidatePath } from "next/cache";
import { assertThemeTokenKeys, sanitizeThemeTokens } from "../theme/validate";
import * as ThemeStore from "../store/themes";

export async function listThemes(): Promise<Theme[]> {
  return ThemeStore.listThemes();
}

export async function getTheme(id: string): Promise<Theme> {
  const theme = await ThemeStore.getThemeById(id);
  if (!theme) throw new Error("Theme not found");
  return theme;
}

export async function createTheme(input: CreateThemeInput): Promise<Theme> {
  if (!input.name?.trim()) {
    throw new Error("Theme name is required");
  }
  const tokens = sanitizeThemeTokens(input.tokens ?? {});
  assertThemeTokenKeys(tokens);

  const theme = await ThemeStore.createTheme(input.name.trim(), tokens);
  revalidatePath("/setup/themes");
  return theme;
}

export async function updateTheme(
  id: string,
  input: UpdateThemeInput
): Promise<Theme> {
  const patch: Partial<Pick<Theme, "name" | "tokens">> = {};
  if (input.name !== undefined) patch.name = input.name.trim();
  if (input.tokens !== undefined) {
    const tokens = sanitizeThemeTokens(input.tokens);
    assertThemeTokenKeys(tokens);
    patch.tokens = tokens;
  }

  const theme = await ThemeStore.updateTheme(id, patch);
  revalidatePath("/setup/themes");
  revalidatePath(`/setup/themes/${id}/edit`);
  return theme;
}

export async function deleteTheme(id: string): Promise<void> {
  await ThemeStore.deleteTheme(id);
  revalidatePath("/setup/themes");
}

export async function duplicateTheme(id: string): Promise<Theme> {
  const existing = await getTheme(id);
  return createTheme({
    name: `${existing.name} (copy)`,
    tokens: existing.tokens,
  });
}
