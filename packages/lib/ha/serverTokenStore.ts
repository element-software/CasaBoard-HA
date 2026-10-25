"use client";

import type { AuthData } from "home-assistant-js-websocket";
import type { HATokenStore } from "@casaboard/ha";
import {
  getHAAuthData,
  saveHAConnection,
} from "../actions/haConnectionActions";

/**
 * Token store backed by DATA_DIR/ha-connection.json via server actions.
 * Used by the Next.js app (editor + live /dashboard preview).
 */
export function createServerTokenStore(): HATokenStore {
  return {
    loadTokens: async () => getHAAuthData(),
    saveTokens: (hassUrl: string) => {
      return async (data: AuthData | null) => {
        await saveHAConnection(hassUrl, data);
      };
    },
  };
}
