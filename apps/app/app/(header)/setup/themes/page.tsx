import { listThemes } from "@repo/lib/actions/themeActions";
import { ThemesList } from "@repo/ui/components/Themes/ThemesList";
import { SetupPageShell } from "@repo/ui/components/Setup/SetupPageShell";

export const dynamic = "force-dynamic";

export default async function ThemesPage() {
  const themes = await listThemes();

  return (
    <SetupPageShell
      title="Themes"
      subtitle={`${themes.length} custom theme${themes.length !== 1 ? "s" : ""}`}
    >
      <ThemesList initialThemes={themes} />
    </SetupPageShell>
  );
}
