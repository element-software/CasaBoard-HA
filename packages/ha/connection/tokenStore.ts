import type {
  AuthData,
  LoadTokensFunc,
  SaveTokensFunc,
} from "home-assistant-js-websocket";

export type HATokenStore = {
  loadTokens: LoadTokensFunc;
  saveTokens: (hassUrl: string) => SaveTokensFunc;
};

const LOCAL_STORAGE_KEY = "casaboard-ha-auth";

/**
 * Browser token store for non-server runtimes (localStorage).
 */
export function createLocalStorageTokenStore(
  storageKey: string = LOCAL_STORAGE_KEY
): HATokenStore {
  return {
    loadTokens: async () => {
      if (typeof window === "undefined") return null;
      try {
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) return null;
        return JSON.parse(raw) as AuthData;
      } catch {
        return null;
      }
    },
    saveTokens: (_hassUrl: string) => {
      return async (data: AuthData | null) => {
        if (typeof window === "undefined") return;
        try {
          if (data === null) {
            window.localStorage.removeItem(storageKey);
          } else {
            window.localStorage.setItem(storageKey, JSON.stringify(data));
          }
        } catch {
          // ignore quota / private mode
        }
      };
    },
  };
}
