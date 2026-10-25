import type { CSSProperties } from "react";
import {
  DEFAULT_LIGHT_THEME_TOKENS,
  type ResolvedThemeTokens,
  type ThemeTokens,
} from "@repo/types/theme";
import { sanitizeThemeTokens } from "./validate";

export function mergeThemeLayers(
  ...layers: ThemeTokens[]
): ResolvedThemeTokens {
  const base: ResolvedThemeTokens = { ...DEFAULT_LIGHT_THEME_TOKENS };
  for (const layer of layers) {
    const clean = sanitizeThemeTokens(layer);
    for (const key of Object.keys(clean) as (keyof ResolvedThemeTokens)[]) {
      const v = clean[key];
      if (v !== undefined) base[key] = v;
    }
  }
  return base;
}

/** Inline style object for a theme scope root. */
export function resolvedTokensToCssVars(
  tokens: ResolvedThemeTokens
): CSSProperties {
  const style: Record<string, string> = {};
  for (const [key, val] of Object.entries(tokens)) {
    style[`--theme-${key}`] = val;
  }
  return style as CSSProperties;
}
