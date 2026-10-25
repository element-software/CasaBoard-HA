import { SidebarActions } from "@repo/lib";
import { SidebarManagement } from "@repo/ui/components/Sidebars/SidebarManagement";
import { SetupPageShell } from "@repo/ui/components/Setup/SetupPageShell";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function SidebarsPage() {
  try {
    const sidebars = await SidebarActions.getAllSidebars();

    return (
      <SetupPageShell
        title="Sidebars"
        subtitle={`${sidebars.length} sidebar${sidebars.length !== 1 ? "s" : ""} total`}
      >
        <SidebarManagement
          showAllSidebars={true}
          showHeader={false}
          initialSidebars={sidebars}
        />
      </SetupPageShell>
    );
  } catch (error) {
    console.error("Error loading sidebars:", error);
    notFound();
  }
}
