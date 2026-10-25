import { Suspense } from "react";
import { redirect } from "next/navigation";
import { HAConnectionActions } from "@repo/lib";
import { withIngressRedirectPath } from "@repo/lib/ingress/server";
import { OnboardingWizard } from "@repo/ui/components/Onboarding/OnboardingWizard";

export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const [valid, connection] = await Promise.all([
    HAConnectionActions.hasValidHAConnection(),
    HAConnectionActions.getHAConnection(),
  ]);
  if (valid) {
    redirect(await withIngressRedirectPath("/setup"));
  }

  return (
    <Suspense
      fallback={
        <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center text-sm text-theme-text-secondary">
          Loading…
        </div>
      }
    >
      <OnboardingWizard initialHassUrl={connection?.hass_url ?? ""} />
    </Suspense>
  );
}
