import { SidebarActions } from "@repo/lib";
import { requireValidHAConnection } from "@repo/lib/ha/requireValidHAConnection";
import SidebarEditorClient from "@repo/ui/components/puck/SidebarEditorClient";
import { notFound } from "next/navigation";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

interface SidebarEditPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function SidebarEditPage({
  params,
}: SidebarEditPageProps) {
  await requireValidHAConnection();
  const { slug } = await params;

  const sidebar = await SidebarActions.getSidebar(slug).catch(() => null);
  if (!sidebar) {
    notFound();
  }

  return (
    <SidebarEditorClient
      initialData={sidebar.puck_data}
      sidebarId={sidebar.id}
      initialSlug={sidebar.slug}
      initialThemeId={sidebar.theme_id ?? null}
      initialStyleId={sidebar.style_id ?? null}
    />
  );
}
