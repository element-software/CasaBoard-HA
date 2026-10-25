import type { Data } from "@measured/puck";
import type { StyleId } from "@repo/types/style";
import SidebarEditorBody from "./SidebarEditorBody";
import { listThemes } from "@repo/lib/actions/themeActions";
import { HAConnectionActions } from "@repo/lib";

type ThemePickerOption = { id: string; name: string };

type SidebarEditorClientProps = {
  initialData?: Data;
  sidebarId?: string | null;
  initialSlug?: string;
  initialThemeId?: string | null;
  initialStyleId?: StyleId | null;
};

export default async function SidebarEditorClient({
  initialData,
  sidebarId,
  initialSlug,
  initialThemeId,
  initialStyleId,
}: SidebarEditorClientProps) {
  const [themes, haConnection] = await Promise.all([
    listThemes(),
    HAConnectionActions.getHAConnection(),
  ]);

  const themePickerThemes: ThemePickerOption[] = themes.map((t) => ({
    id: t.id,
    name: t.name,
  }));

  const themeLibrary = themes.map((t) => ({
    id: t.id,
    tokens: t.tokens ?? {},
  }));

  return (
    <SidebarEditorBody
      initialData={initialData}
      sidebarId={sidebarId}
      initialSlug={initialSlug}
      themePickerThemes={themePickerThemes}
      themeLibrary={themeLibrary}
      initialThemeId={initialThemeId}
      initialStyleId={initialStyleId}
      haConnection={haConnection}
    />
  );
}
