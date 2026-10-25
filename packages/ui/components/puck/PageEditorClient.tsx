import type { Data } from "@measured/puck";
import type { ThemeTokens } from "@repo/types/theme";
import type { StyleId } from "@repo/types/style";
import PageEditorBody from "./PageEditorBody";
import { listThemes } from "@repo/lib/actions/themeActions";
import { HAConnectionActions } from "@repo/lib";

type ThemePickerOption = { id: string; name: string };

type PageEditorClientProps = {
  initialData?: Data;
  pageId?: string | null;
  sidebars?: { id: string; name: string; slug: string }[];
  initialSlug?: string;
  initialThemeId?: string | null;
  initialThemeOverrides?: ThemeTokens | null;
  initialStyleId?: StyleId | null;
};

export default async function PageEditorClient({
  initialData,
  pageId,
  sidebars = [],
  initialSlug,
  initialThemeId,
  initialThemeOverrides,
  initialStyleId,
}: PageEditorClientProps) {
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
    <PageEditorBody
      initialData={initialData}
      pageId={pageId}
      sidebars={sidebars}
      initialSlug={initialSlug}
      themePickerThemes={themePickerThemes}
      themeLibrary={themeLibrary}
      initialThemeId={initialThemeId}
      initialThemeOverrides={initialThemeOverrides}
      initialStyleId={initialStyleId}
      haConnection={haConnection}
    />
  );
}
