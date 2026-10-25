import SidebarEditorClient from "@repo/ui/components/puck/SidebarEditorClient";
import { requireValidHAConnection } from "@repo/lib/ha/requireValidHAConnection";

export const dynamic = "force-dynamic";

export default async function SidebarCreatePage() {
  await requireValidHAConnection();
  return <SidebarEditorClient />;
}
