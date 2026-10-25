"use server";

import type { CSSProperties } from "react";
import type { Page } from "@repo/types/page";
import { getThemeById } from "../store/themes";
import { mergeThemeLayers, resolvedTokensToCssVars } from "./merge";
import { sanitizeThemeTokens } from "./validate";

export async function resolveDashboardThemeStyles(
  page: Page
): Promise<{ main: CSSProperties; sidebar: CSSProperties }> {
  let themeLayer: Record<string, string> = {};
  if (page.theme_id) {
    const theme = await getThemeById(page.theme_id);
    if (theme?.tokens) {
      themeLayer = sanitizeThemeTokens(theme.tokens) as Record<string, string>;
    }
  }

  const overrides = sanitizeThemeTokens(
    (page.theme_overrides as Record<string, unknown> | null) ?? {}
  );

  const mainResolved = mergeThemeLayers(themeLayer, overrides);

  let sidebarResolved = mainResolved;
  if (page.sidebar?.theme_id) {
    const sidebarTheme = await getThemeById(page.sidebar.theme_id);
    if (sidebarTheme?.tokens) {
      sidebarResolved = mergeThemeLayers(
        sanitizeThemeTokens(sidebarTheme.tokens) as Record<string, string>
      );
    } else {
      sidebarResolved = mergeThemeLayers();
    }
  }

  return {
    main: resolvedTokensToCssVars(mainResolved),
    sidebar: resolvedTokensToCssVars(sidebarResolved),
  };
}
