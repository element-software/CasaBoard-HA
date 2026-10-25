import { ConfigurationProvider } from "@repo/ui/components/Shared/util/ConfigurationProvider";
import { ConfigService } from "@repo/lib";
import { Footer } from "@repo/ui/components/Shared/Footer/index";

// Force dynamic rendering — reads live server config on every request
export const dynamic = "force-dynamic";

export default async function ImmersiveShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch configuration server-side
  const initialConfig = await ConfigService.getServerConfig();

  return (
    <ConfigurationProvider initialConfig={initialConfig}>
      <div className="min-h-screen">
        <main className="flex-1 h-full">{children}</main>
        <Footer />
      </div>
    </ConfigurationProvider>
  );
}
