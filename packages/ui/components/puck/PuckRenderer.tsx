"use client";

import type { CSSProperties } from "react";
import { Render } from "@measured/puck";
import { Page } from "@repo/types/page";
import { PuckConfig } from "./puck.config";
import { ThemeScope } from "../ThemeScope/ThemeScope";
import type { StyleId } from "@repo/types/style";
import type { EventPopupRule } from "@repo/types/eventPopup";
import {
  useRegisterDashboardChrome,
  type DashboardChromeState,
} from "../Shared/util/DashboardChrome";
import { useMemo } from "react";
import { EventPopupHost } from "../EventPopup/EventPopupHost";

interface PuckRendererProps {
  pageId: string;
  pageData?: Page;
  themeMainStyle?: CSSProperties;
  themeSidebarStyle?: CSSProperties;
  styleMainId?: StyleId;
  styleMainVars?: CSSProperties;
  styleSidebarId?: StyleId;
  styleSidebarVars?: CSSProperties;
}

export const PuckRenderer = ({
  pageId,
  pageData,
  themeMainStyle,
  themeSidebarStyle,
  styleMainId,
  styleMainVars,
  styleSidebarId,
  styleSidebarVars,
}: PuckRendererProps) => {
  const chrome = useMemo<DashboardChromeState | null>(() => {
    if (!pageData?.sidebar?.puck_data) return null;
    return {
      sidebar: pageData.sidebar,
      themeSidebarStyle,
      styleSidebarId,
      styleSidebarVars,
    };
  }, [pageData?.sidebar, themeSidebarStyle, styleSidebarId, styleSidebarVars]);

  useRegisterDashboardChrome(chrome);

  if (!pageData) {
    return (
      <div className="p-8 text-center text-red-500">
        <p>Error loading page: {pageId}</p>
      </div>
    );
  }

  if (!pageData?.puck_data) {
    return (
      <ThemeScope
        style={themeMainStyle}
        styleVars={styleMainVars}
        styleId={styleMainId}
        className="min-h-full bg-theme-page-background"
      >
        <div className="p-8 text-center text-theme-text-secondary">
          <p>This page hasn&apos;t been configured yet.</p>
          <p>Use the setup editor to add components to this page.</p>
        </div>
      </ThemeScope>
    );
  }

  const pageRootProps = pageData.puck_data.root?.props as
    | { eventPopups?: EventPopupRule[] }
    | undefined;

  return (
    <ThemeScope
      style={themeMainStyle}
      styleVars={styleMainVars}
      styleId={styleMainId}
      className="min-h-full bg-theme-page-background text-theme-text"
    >
      <div className="p-4 pt-0 md:pt-4 w-full" key={pageId}>
        <Render config={PuckConfig} data={pageData.puck_data} />
      </div>
      <EventPopupHost rules={pageRootProps?.eventPopups} />
    </ThemeScope>
  );
};
