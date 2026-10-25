import PageEditorClient from "@repo/ui/components/puck/PageEditorClient";
import { SidebarActions } from "@repo/lib";
import { requireValidHAConnection } from "@repo/lib/ha/requireValidHAConnection";

export const dynamicParams = true;
export const dynamic = "force-dynamic";

export default async function PageCreate() {
  await requireValidHAConnection();
  const sidebars = await SidebarActions.getAllSidebars();

  return <PageEditorClient sidebars={sidebars} />;
}
