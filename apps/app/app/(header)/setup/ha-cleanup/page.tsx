import { HAConnectionActions } from "@repo/lib";
import { withIngressRedirectPath } from "@repo/lib/ingress/server";
import { HACleanup } from "@repo/ui/components/HACleanup/HACleanup";
import { SetupPageShell } from "@repo/ui/components/Setup/SetupPageShell";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HACleanupPage() {
  const connection = await HAConnectionActions.getHAConnection();
  if (!connection) {
    redirect(await withIngressRedirectPath("/setup/ha-config"));
  }

  return (
    <SetupPageShell
      title="HA Cleanup"
      subtitle="Remove unknown entities and manage Home Assistant repairs"
    >
      <HACleanup haInstance={connection} />
    </SetupPageShell>
  );
}
