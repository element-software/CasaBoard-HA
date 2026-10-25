import { NextResponse } from "next/server";
import { PageActions, HAConnectionActions } from "@repo/lib";

export const dynamic = "force-dynamic";

/**
 * Lightweight status endpoint for the Home Assistant custom integration
 * (and operators) to probe without loading the full UI.
 */
export async function GET() {
  try {
    const [pages, connection, auth] = await Promise.all([
      PageActions.getAllPages(),
      HAConnectionActions.getHAConnection(),
      HAConnectionActions.getHAAuthData(),
    ]);

    return NextResponse.json({
      ok: true,
      service: "casaboard",
      version: process.env.CASABOARD_VERSION ?? "dev",
      pages: pages.length,
      ha_connected: Boolean(connection?.hass_url && auth),
      hass_url: connection?.hass_url ?? null,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "health check failed";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
