"use client";

import type { Page } from "@repo/types/page";
import { PuckRenderer } from "../../puck/PuckRenderer";
import type { CSSProperties } from "react";
import type { StyleId } from "@repo/types/style";

type DashboardHAClientProps = {
  page: Page;
  pageSlug: string;
  themeMainStyle?: CSSProperties;
  themeSidebarStyle?: CSSProperties;
  styleMainId?: StyleId;
  styleMainVars?: CSSProperties;
  styleSidebarId?: StyleId;
  styleSidebarVars?: CSSProperties;
};

/**
 * Renders dashboard main content for a page. HA connection and sidebar chrome
 * live in DashboardChromeProvider (layout) so they persist across SPA navigations.
 */
export function DashboardHAClient({
  page,
  pageSlug,
  themeMainStyle,
  themeSidebarStyle,
  styleMainId,
  styleMainVars,
  styleSidebarId,
  styleSidebarVars,
}: DashboardHAClientProps) {
  return (
    <PuckRenderer
      pageId={pageSlug}
      pageData={page}
      themeMainStyle={themeMainStyle}
      themeSidebarStyle={themeSidebarStyle}
      styleMainId={styleMainId}
      styleMainVars={styleMainVars}
      styleSidebarId={styleSidebarId}
      styleSidebarVars={styleSidebarVars}
    />
  );
}
