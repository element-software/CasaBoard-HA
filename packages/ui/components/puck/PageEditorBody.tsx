"use client";

import PuckEditorClient from "./PuckEditorClient";
import {
  createPageEditorAction,
  updatePageEditorAction,
} from "./pageEditorActions";
import { HassConnectWrapper } from "../Shared/util/HassConnectWrapper";
import type { HAConnection } from "@repo/types/ha";
import type { Data } from "@measured/puck";
import type { ThemeTokens } from "@repo/types/theme";
import type { StyleId } from "@repo/types/style";

type ThemePickerOption = { id: string; name: string };

type ThemeLibraryEntry = { id: string; tokens: ThemeTokens };

type PageEditorBodyProps = {
  initialData?: Data;
  pageId?: string | null;
  sidebars?: { id: string; name: string; slug: string }[];
  initialSlug?: string;
  themePickerThemes?: ThemePickerOption[];
  themeLibrary?: ThemeLibraryEntry[];
  initialThemeId?: string | null;
  initialThemeOverrides?: ThemeTokens | null;
  initialStyleId?: StyleId | null;
  haConnection?: HAConnection | null;
};

export default function PageEditorBody({
  initialData,
  pageId,
  sidebars = [],
  initialSlug,
  themePickerThemes = [],
  themeLibrary = [],
  initialThemeId,
  initialThemeOverrides,
  initialStyleId,
  haConnection = null,
}: PageEditorBodyProps) {
  const editor = (
    <PuckEditorClient
      type="page"
      initialData={initialData}
      itemId={pageId}
      sidebars={sidebars}
      initialSlug={initialSlug}
      themePickerThemes={themePickerThemes}
      themeLibrary={themeLibrary}
      initialThemeId={initialThemeId}
      initialThemeOverrides={initialThemeOverrides}
      initialStyleId={initialStyleId}
      onCreateItem={createPageEditorAction}
      onUpdateItem={updatePageEditorAction}
      editUrlTemplate="/setup/pages/edit/{slug}"
      viewUrlTemplate="/dashboard/{slug}"
      backUrl="/setup/pages"
    />
  );

  if (haConnection) {
    return (
      <HassConnectWrapper haInstance={haConnection}>{editor}</HassConnectWrapper>
    );
  }

  return editor;
}
