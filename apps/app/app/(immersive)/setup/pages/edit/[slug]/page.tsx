import { PageActions, SidebarActions } from "@repo/lib";
import { requireValidHAConnection } from "@repo/lib/ha/requireValidHAConnection";
import PageEditorClient from "@repo/ui/components/puck/PageEditorClient";
import { notFound } from "next/navigation";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default async function PageEdit({ params }: PageProps) {
  await requireValidHAConnection();
  const { slug } = await params;

  const [page, sidebars] = await Promise.all([
    PageActions.getPage(slug),
    SidebarActions.getAllSidebars(),
  ]);

  if (!page) {
    notFound();
  }

  return (
    <PageEditorClient
      initialData={page.puck_data}
      pageId={page.id}
      sidebars={sidebars}
      initialSlug={page.slug}
      initialThemeId={page.theme_id ?? null}
      initialThemeOverrides={page.theme_overrides ?? null}
      initialStyleId={page.style_id ?? null}
    />
  );
}
