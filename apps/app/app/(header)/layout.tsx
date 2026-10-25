import { ConfigurationProvider } from "@repo/ui/components/Shared/util/ConfigurationProvider";
import { ConfigService, HAConnectionActions } from "@repo/lib";
import { withIngressRedirectPath } from "@repo/lib/ingress/server";
import { SetupLayout } from "@repo/ui/components/Setup/SetupLayout";
import { redirect } from "next/navigation";

// Force dynamic rendering — reads live server config on every request
export const dynamic = "force-dynamic";

export default async function HeaderShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [initialConfig, valid] = await Promise.all([
    ConfigService.getServerConfig(),
    HAConnectionActions.hasValidHAConnection(),
  ]);

  if (!valid) {
    redirect(await withIngressRedirectPath("/onboarding"));
  }

  return (
    <ConfigurationProvider initialConfig={initialConfig}>
      <SetupLayout>{children}</SetupLayout>
    </ConfigurationProvider>
  );
}
