import { Suspense } from "react";
import { HAConnectForm } from "@repo/ui/components/HAConnect/HAConnectForm";
import { HAConnectionActions } from "@repo/lib";
import { withIngressRedirectPath } from "@repo/lib/ingress/server";
import Icon from "@mdi/react";
import { mdiHomeAssistant } from "@mdi/js";
import { CleanAuthUrl } from "./clean-auth-url";
import Link from "next/link";

// Force dynamic rendering for this page since it reads live server state
export const dynamic = "force-dynamic";

export default async function HAConfigPage() {
  const [connection, setupHref] = await Promise.all([
    HAConnectionActions.getHAConnection(),
    withIngressRedirectPath("/setup"),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Suspense fallback={null}>
        <CleanAuthUrl />
      </Suspense>
      <div className="mb-8">
        <div className="flex items-center mb-4">
          <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center mr-4">
            <Icon path={mdiHomeAssistant} className="w-8 h-8 text-cyan-400" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-theme-text">
              Home Assistant Configuration
            </h1>
            <p className="text-theme-text-secondary">
              Configure your Home Assistant connection
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <Suspense fallback={null}>
          <HAConnectForm initialConnection={connection} />
        </Suspense>
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
