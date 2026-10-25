"use server";

import type { AuthData } from "home-assistant-js-websocket";
import type { HAConnection } from "@repo/types/ha";
import { readHAConnection, writeHAConnection } from "../store/haConnection";

export async function getHAConnection(): Promise<HAConnection | null> {
  const stored = await readHAConnection();
  return stored ? { hass_url: stored.hass_url } : null;
}

export async function getHAAuthData(): Promise<AuthData | null> {
  const stored = await readHAConnection();
  return stored?.auth ?? null;
}

/** True when URL + access token are persisted (first-run complete). */
export async function hasValidHAConnection(): Promise<boolean> {
  const stored = await readHAConnection();
  return Boolean(stored?.hass_url && stored?.auth?.access_token);
}

export async function saveHAConnection(
  hass_url: string,
  auth: AuthData | null
): Promise<void> {
  await writeHAConnection({ hass_url, auth });
}

export async function clearHAConnection(): Promise<void> {
  await writeHAConnection(null);
}
