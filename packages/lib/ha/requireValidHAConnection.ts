import { redirect } from "next/navigation";
import { hasValidHAConnection } from "../actions/haConnectionActions";
import { withIngressRedirectPath } from "../ingress/server";

/** Redirect to first-run onboarding when HA is not configured. */
export async function requireValidHAConnection(
  redirectTo = "/onboarding"
): Promise<void> {
  const valid = await hasValidHAConnection();
  if (!valid) {
    redirect(await withIngressRedirectPath(redirectTo));
  }
}
