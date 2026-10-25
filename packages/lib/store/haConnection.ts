import type { AuthData } from "home-assistant-js-websocket";
import { readJson, writeJson } from "./jsonFile";

const FILE = "ha-connection.json";

export interface StoredHAConnection {
  hass_url: string;
  auth: AuthData | null;
}

export async function readHAConnection(): Promise<StoredHAConnection | null> {
  return readJson<StoredHAConnection | null>(FILE, null);
}

export async function writeHAConnection(
  conn: StoredHAConnection | null
): Promise<void> {
  await writeJson(FILE, conn);
}
