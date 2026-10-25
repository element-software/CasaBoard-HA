import type { CSSProperties } from "react";
import type { Page } from "@repo/types/page";
import { STYLE_PRESETS, DEFAULT_STYLE_ID, type StyleId } from "@repo/types/style";

function styleTokensToCssVars(id: StyleId | null | undefined): CSSProperties {
  const preset = STYLE_PRESETS[id ?? DEFAULT_STYLE_ID] ?? STYLE_PRESETS[DEFAULT_STYLE_ID];
  const vars: Record<string, string> = {};
  for (const [key, value] of Object.entries(preset.tokens)) {
    vars[`--style-${key}`] = value;
  }
  return vars as CSSProperties;
}

export function resolveDashboardStyle(page: Page): {
  mainId: StyleId;
  main: CSSProperties;
  sidebarId: StyleId;
  sidebar: CSSProperties;
} {
  const mainId = page.style_id ?? DEFAULT_STYLE_ID;
  const sidebarId = page.sidebar?.style_id ?? mainId;

  return {
    mainId,
    main: styleTokensToCssVars(mainId),
    sidebarId,
    sidebar: styleTokensToCssVars(sidebarId),
  };
}
