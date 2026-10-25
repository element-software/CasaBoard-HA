"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@repo/hooks";
import { Spinner } from "@heroui/react";
import {
  completeOAuthCallback,
  isOAuthCallbackUrl,
  oauthRedirectUrl,
} from "@casaboard/ha";
import {
  HAConnectionActions,
  createServerTokenStore,
} from "@repo/lib";

/**
 * After HA OAuth returns to ha-config, exchange the code and persist tokens
 * before stripping `auth_callback` from the URL.
 */
export function CleanAuthUrl() {
  const { replace, refresh } = useAppRouter();
  const searchParams = useSearchParams();
  const started = useRef(false);
  const [status, setStatus] = useState<"idle" | "working" | "done">("idle");
  const tokenStore = useMemo(() => createServerTokenStore(), []);
  const redirectUrl = useMemo(
    () => oauthRedirectUrl("/setup/ha-config"),
    []
  );

  useEffect(() => {
    if (!isOAuthCallbackUrl(searchParams) || started.current) return;
    started.current = true;
    setStatus("working");

    const finish = async () => {
      try {
        const connection = await HAConnectionActions.getHAConnection();
        if (connection?.hass_url) {
          await completeOAuthCallback({
            haInstance: connection,
            tokenStore,
            redirectUrl,
          });
        }
      } catch {
        // Form / HassConnectWrapper will surface connection issues after reload.
      } finally {
        setStatus("done");
        replace("/setup/ha-config");
        refresh();
      }
    };

    void finish();
  }, [searchParams, replace, refresh, tokenStore, redirectUrl]);

  if (status !== "working") return null;

  return (
    <div className="mb-4 flex items-center gap-2 rounded-lg border border-theme-border bg-theme-surface px-3 py-2 text-sm text-theme-text-secondary">
      <Spinner size="sm" />
      Completing Home Assistant sign-in…
    </div>
  );
}
