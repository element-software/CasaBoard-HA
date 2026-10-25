"use client";

import { useCallback, useEffect, useState } from "react";
import type { HAConnection } from "@repo/types/ha";
import { HAConnectionActions } from "@repo/lib";

export function useHAConnection() {
  const [connection, setConnection] = useState<HAConnection | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const connection = await HAConnectionActions.getHAConnection();
    setConnection(connection);
    setLoading(false);
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { connection, loading, refresh };
}
