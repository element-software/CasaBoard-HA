import { redirect } from "next/navigation";
import { HAConnectionActions } from "@repo/lib";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const valid = await HAConnectionActions.hasValidHAConnection();
  redirect(valid ? "/setup" : "/onboarding");
}
