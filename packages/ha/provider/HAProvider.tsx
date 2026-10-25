"use client";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from "react";
import {
  Connection,
  getStates,
  subscribeEntities,
  Auth,
  type AuthData,
} from "home-assistant-js-websocket";
import {
  connect,
  resolveBrowserHassUrl,
  type HATokenStore,
} from "../connection";
import {
  clearEntitySnapshot,
  getEntityById as getStoreEntity,
  getEntitySnapshot,
  replaceEntitySnapshot,
} from "../store/entityStore";
import { HAConnection } from "../types";

export interface HAContextType {
  connection: Connection | null;
  auth: Auth | null;
  hassUrl: string | null;
  connected: boolean;
  /** Imperative read of the current entity map (not reactive). Prefer useEntity / useEntities. */
  getEntity: (entityId: string) => any | undefined;
  getAllEntities: () => any[];
  error: Error | null;
  loading: boolean;
  retry: () => void;
}

const HAContext = createContext<HAContextType | null>(null);

export interface HAProviderProps {
  haInstance: HAConnection;
  tokenStore: HATokenStore;
  redirectUrl?: string;
  children: ReactNode;
  fallback?: ReactNode;
}

export const HAProvider: React.FC<HAProviderProps> = ({
  haInstance,
  tokenStore,
  redirectUrl,
  children,
}) => {
  const [connection, setConnection] = useState<Connection | null>(null);
  const [auth, setAuth] = useState<Auth | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  const storedUrl = haInstance.hass_url;
  const browserHassUrl = resolveBrowserHassUrl(storedUrl);

  // Persist against the stored LAN URL so server-side health / HACS sensors
  // keep working. Browser traffic uses browserHassUrl instead.
  const persistStore = useMemo<HATokenStore>(
    () => ({
      loadTokens: tokenStore.loadTokens,
      saveTokens: () => async (data: AuthData | null) => {
        const persisted =
          data == null ? null : { ...data, hassUrl: storedUrl };
        await Promise.resolve(tokenStore.saveTokens(storedUrl)(persisted));
      },
    }),
    [tokenStore, storedUrl]
  );

  const run = async () => {
    let unsubscribe: (() => void) | undefined;

    setLoading(true);
    setError(null);
    try {
      const { connection: activeConnection, auth: activeAuth } = await connect({
        haInstance: { hass_url: browserHassUrl },
        tokenStore: persistStore,
        redirectUrl,
      });
      setConnection(activeConnection);
      setAuth(activeAuth);

      const initial = await getStates(activeConnection);
      const initialMap = initial.reduce((acc: any, s: any) => {
        acc[s.entity_id] = s;
        return acc;
      }, {} as Record<string, any>);
      replaceEntitySnapshot(initialMap);

      unsubscribe = subscribeEntities(activeConnection, (ents) => {
        replaceEntitySnapshot(ents as Record<string, any>);
      });

      setLoading(false);
    } catch (e: any) {
      const classified =
        e instanceof Error
          ? e
          : new Error(
              typeof e?.message === "string"
                ? e.message
                : "Home Assistant connection failed"
            );
      setError(classified);
      setConnection(null);
      setAuth(null);
      clearEntitySnapshot();
      setLoading(false);
    }

    return unsubscribe;
  };

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;

    const executeRun = async () => {
      unsubscribe = await run();
    };

    executeRun();

    return () => {
      if (unsubscribe) unsubscribe();
      setConnection(null);
      setAuth(null);
      clearEntitySnapshot();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reconnect on url / retry / token store identity
  }, [browserHassUrl, retryCount, persistStore, redirectUrl]);

  const retry = useCallback(() => {
    setRetryCount((prev) => prev + 1);
  }, []);

  const getEntity = useCallback((entityId: string) => getStoreEntity(entityId), []);
  const getAllEntities = useCallback(
    () => Object.values(getEntitySnapshot()),
    []
  );

  const value = useMemo<HAContextType>(
    () => ({
      connection,
      auth,
      hassUrl: browserHassUrl,
      connected: Boolean(connection),
      getEntity,
      getAllEntities,
      error,
      loading,
      retry,
    }),
    [
      connection,
      auth,
      browserHassUrl,
      getEntity,
      getAllEntities,
      error,
      loading,
      retry,
    ]
  );

  return <HAContext.Provider value={value}>{children}</HAContext.Provider>;
};

export function useHA(): HAContextType {
  const ctx = useContext(HAContext);
  if (!ctx) throw new Error("useHA must be used within a HAProvider");
  return ctx;
}
