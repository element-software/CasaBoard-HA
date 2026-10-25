"use client";
import React, { useMemo } from "react";
import { HAProvider, useHA, reauthenticate, oauthRedirectUrl } from "@casaboard/ha";
import { HAConnection } from "@repo/types/ha";
import { ConnectionErrorIndicator } from "./ConnectionErrorFallback";
import { createServerTokenStore, clientLogger } from "@repo/lib";

interface HassConnectWrapperProps {
  children: React.ReactNode;
  haInstance: HAConnection;
}

const HassConnectWrapperContent = ({
  children,
  haInstance,
}: HassConnectWrapperProps) => {
  const { error, loading, retry } = useHA();
  const tokenStore = useMemo(() => createServerTokenStore(), []);
  const redirectUrl = useMemo(() => oauthRedirectUrl("/setup/ha-config"), []);

  const handleReauthenticate = async () => {
    try {
      clientLogger.info(
        "HassConnectWrapper",
        "initiating re-authentication for",
        haInstance.hass_url
      );
      await reauthenticate({
        haInstance,
        tokenStore,
        redirectUrl,
      });
    } catch (error) {
      clientLogger.error(
        "HassConnectWrapper",
        "re-authentication failed",
        error
      );
    }
  };

  if (error && !loading) {
    return (
      <ConnectionErrorIndicator
        instanceName={haInstance.hass_url}
        instanceUrl={haInstance.hass_url}
        error={error}
        onRetry={retry}
        onReauthenticate={handleReauthenticate}
      />
    );
  }

  return children;
};

export const HassConnectWrapper = ({
  children,
  haInstance,
}: HassConnectWrapperProps) => {
  const tokenStore = useMemo(() => createServerTokenStore(), []);
  const redirectUrl = useMemo(() => oauthRedirectUrl("/setup/ha-config"), []);

  return (
    <HAProvider
      haInstance={haInstance}
      tokenStore={tokenStore}
      redirectUrl={redirectUrl}
    >
      <HassConnectWrapperContent haInstance={haInstance}>
        {children}
      </HassConnectWrapperContent>
    </HAProvider>
  );
};
