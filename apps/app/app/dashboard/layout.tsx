import { ConfigurationProvider } from "@repo/ui/components/Shared/util/ConfigurationProvider";
import { DashboardChromeProvider } from "@repo/ui/components/Shared/util/DashboardChrome";
import { ConfigService } from "@repo/lib";
import { requireValidHAConnection } from "@repo/lib/ha/requireValidHAConnection";

// Force dynamic rendering for this layout since it uses cookies
export const dynamic = "force-dynamic";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireValidHAConnection();
  const initialConfig = await ConfigService.getServerConfig();

  return (
    <ConfigurationProvider initialConfig={initialConfig}>
      <DashboardChromeProvider>{children}</DashboardChromeProvider>
    </ConfigurationProvider>
  );
}
