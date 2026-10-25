"use client";

import PuckEditorClient from "./PuckEditorClient";
import {
  createSidebarEditorAction,
  updateSidebarEditorAction,
} from "./sidebarEditorActions";
import { HassConnectWrapper } from "../Shared/util/HassConnectWrapper";
import type { HAConnection } from "@repo/types/ha";
import type { Data } from "@measured/puck";
import type { ThemeTokens } from "@repo/types/theme";
import type { StyleId } from "@repo/types/style";

type ThemePickerOption = { id: string; name: string };
type ThemeLibraryEntry = { id: string; tokens: ThemeTokens };

type SidebarEditorBodyProps = {
  initialData?: Data;
  sidebarId?: string | null;
  initialSlug?: string;
  themePickerThemes?: ThemePickerOption[];
  themeLibrary?: ThemeLibraryEntry[];
  initialThemeId?: string | null;
  initialStyleId?: StyleId | null;
  haConnection?: HAConnection | null;
};

export default function SidebarEditorBody({
  initialData,
  sidebarId,
  initialSlug,
  themePickerThemes = [],
  themeLibrary = [],
  initialThemeId,
  initialStyleId,
  haConnection = null,
}: SidebarEditorBodyProps) {
  const editor = (
    <PuckEditorClient
      type="sidebar"
      initialData={initialData}
      itemId={sidebarId}
      initialSlug={initialSlug}
      themePickerThemes={themePickerThemes}
      themeLibrary={themeLibrary}
      initialThemeId={initialThemeId}
      initialStyleId={initialStyleId}
      onCreateItem={createSidebarEditorAction}
      onUpdateItem={updateSidebarEditorAction}
      editUrlTemplate="/setup/sidebars/edit/{slug}"
      backUrl="/setup/sidebars"
    />
  );

  if (haConnection) {
    return (
      <HassConnectWrapper haInstance={haConnection}>{editor}</HassConnectWrapper>
    );
  }

  return editor;
}
