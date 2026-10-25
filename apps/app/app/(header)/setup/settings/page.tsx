import { SettingsBackup } from "@repo/ui/components/Settings/SettingsBackup";
import { SettingsUpdates } from "@repo/ui/components/Settings/SettingsUpdates";
import { PageActions, SidebarActions, ThemeActions } from "@repo/lib";
import { withIngressRedirectPath } from "@repo/lib/ingress/server";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const [pages, sidebars, themes, setupHref] = await Promise.all([
    PageActions.getAllPages(),
    SidebarActions.getAllSidebars(),
    ThemeActions.listThemes(),
    withIngressRedirectPath("/setup"),
  ]);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-theme-text">Import / Export</h1>
        <p className="text-theme-text-secondary">
          Back up all of your dashboard settings, or restore them on another device
        </p>
      </div>

      <SettingsBackup
        initialCounts={{
          pages: pages.length,
          sidebars: sidebars.length,
          themes: themes.length,
        }}
      />

      <div className="mt-8">
        <SettingsUpdates />
      </div>

      <div className="mt-8 pt-6 border-t border-theme-border">
        <Link
          href={setupHref}
          className="inline-flex items-center text-theme-text-secondary hover:text-theme-text transition-colors"
        >
          ← Back to Setup Dashboard
        </Link>
      </div>
    </div>
  );
}
