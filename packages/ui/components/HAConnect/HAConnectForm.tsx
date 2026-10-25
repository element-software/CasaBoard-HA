"use client";

import { useState, useTransition, useMemo, useSyncExternalStore } from "react";
import { useAppRouter } from "@repo/hooks";
import { Button, Card, CardBody, CardHeader, Chip, Input, Tab, Tabs } from "@heroui/react";
import Icon from "@mdi/react";
import { mdiCheckCircle, mdiAlertCircle, mdiHomeAssistant } from "@mdi/js";
import {
  HAConnectionActions,
  createServerTokenStore,
} from "@repo/lib";
import {
  classifyConnectionError,
  normalizeHassUrl,
  oauthRedirectUrl,
  reauthenticate,
  testLongLivedTokenConnection,
  useEntityCount,
  useHA,
  type HAConnectionFailure,
} from "@casaboard/ha";
import type { HAConnection } from "@repo/types/ha";
import { HassConnectWrapper } from "../Shared/util/HassConnectWrapper";

function useIsOAuthCallback(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).has("auth_callback"),
    () => false
  );
}

function ConnectionStatus({ haInstance }: { haInstance: HAConnection }) {
  const { connected } = useHA();
  const entityCount = useEntityCount();

  return (
    <div className="flex items-center gap-2">
      <Chip
        size="sm"
        color={connected ? "success" : "warning"}
        variant="flat"
        startContent={
          <Icon path={connected ? mdiCheckCircle : mdiAlertCircle} className="w-3 h-3" />
        }
      >
        {connected ? "Connected" : "Connecting…"}
      </Chip>
      {connected && (
        <Chip size="sm" color="default" variant="flat">
          {entityCount} entities
        </Chip>
      )}
    </div>
  );
}

function FailureBanner({ failure }: { failure: HAConnectionFailure }) {
  return (
    <div
      role="alert"
      className="p-3 bg-red-100 border border-red-300 rounded text-red-700 text-sm"
      data-failure-code={failure.code}
    >
      {failure.message}
    </div>
  );
}

export interface HAConnectFormProps {
  compact?: boolean;
  initialConnection: HAConnection | null;
}

export function HAConnectForm({ compact = false, initialConnection }: HAConnectFormProps) {
  const { replace, refresh } = useAppRouter();
  // Avoid racing CleanAuthUrl: don't open a second getAuth while the code is exchanged.
  const oauthReturning = useIsOAuthCallback();
  const [hassUrl, setHassUrl] = useState(initialConnection?.hass_url ?? "");
  const [token, setToken] = useState("");
  const [method, setMethod] = useState<"token" | "oauth">("token");
  const [connection, setConnection] = useState<HAConnection | null>(initialConnection);
  const [isPending, startTransition] = useTransition();
  const [failure, setFailure] = useState<HAConnectionFailure | null>(null);

  const tokenStore = useMemo(() => createServerTokenStore(), []);
  const redirectUrl = useMemo(() => oauthRedirectUrl("/setup/ha-config"), []);

  const onConnectWithToken = () => {
    setFailure(null);
    startTransition(async () => {
      const result = await testLongLivedTokenConnection(hassUrl, token);
      if (!result.ok) {
        setFailure(result.failure);
        return;
      }
      try {
        await HAConnectionActions.saveHAConnection(result.hassUrl, result.auth);
        setConnection({ hass_url: result.hassUrl });
        setToken("");
      } catch (e) {
        setFailure(classifyConnectionError(e));
      }
    });
  };

  const onConnectWithOAuth = () => {
    setFailure(null);
    startTransition(async () => {
      const normalized = normalizeHassUrl(hassUrl);
      if (!normalized.ok) {
        setFailure(normalized.failure);
        return;
      }
      try {
        await HAConnectionActions.saveHAConnection(normalized.url, null);
        setConnection({ hass_url: normalized.url });
        await reauthenticate({
          haInstance: { hass_url: normalized.url },
          tokenStore,
          redirectUrl,
        });
      } catch (e) {
        setFailure(classifyConnectionError(e));
      }
    });
  };

  const onDisconnect = () => {
    startTransition(async () => {
      await HAConnectionActions.clearHAConnection();
      setConnection(null);
      setHassUrl("");
      setToken("");
      replace("/onboarding");
      refresh();
    });
  };

  const onReconnect = () => {
    if (!connection) return;
    startTransition(async () => {
      try {
        await reauthenticate({
          haInstance: connection,
          tokenStore,
          redirectUrl,
        });
      } catch (e) {
        setFailure(classifyConnectionError(e));
      }
    });
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex items-center gap-3 p-4 sm:p-6">
        <div className="w-10 h-10 bg-violet-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon path={mdiHomeAssistant} className="w-6 h-6 text-violet-600" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold">Home Assistant</h3>
          {connection && (
            <span className="text-sm text-foreground-500 truncate block">
              {connection.hass_url}
            </span>
          )}
        </div>
      </CardHeader>
      <CardBody className="space-y-4">
        {failure && <FailureBanner failure={failure} />}

        {!connection ? (
          <div className="grid gap-3">
            <Input
              label="Home Assistant URL"
              value={hassUrl}
              onValueChange={(v) => {
                setHassUrl(v);
                setFailure(null);
              }}
              description="e.g. homeassistant.local:8123 — protocol optional, defaults to http://"
              placeholder="homeassistant.local:8123"
            />
            <Tabs
              selectedKey={method}
              onSelectionChange={(key) => {
                setMethod(key as "token" | "oauth");
                setFailure(null);
              }}
              aria-label="Authentication method"
              classNames={{ panel: "pt-2" }}
            >
              <Tab key="token" title="Access token">
                <div className="grid gap-3">
                  <Input
                    label="Long-lived access token"
                    type="password"
                    value={token}
                    onValueChange={(v) => {
                      setToken(v);
                      setFailure(null);
                    }}
                    description="HA → Profile → Long-lived access tokens"
                  />
                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      onPress={onConnectWithToken}
                      isDisabled={!hassUrl.trim() || !token.trim()}
                      isLoading={isPending}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </Tab>
              <Tab key="oauth" title="Sign in with HA">
                <div className="flex justify-end">
                  <Button
                    color="primary"
                    onPress={onConnectWithOAuth}
                    isDisabled={!hassUrl.trim()}
                    isLoading={isPending}
                  >
                    Continue to Home Assistant
                  </Button>
                </div>
              </Tab>
            </Tabs>
          </div>
        ) : oauthReturning ? (
          <p className="text-sm text-foreground-500">Completing sign-in…</p>
        ) : (
          <HassConnectWrapper haInstance={connection}>
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <ConnectionStatus haInstance={connection} />
              {!compact && (
                <div className="flex gap-2">
                  <Button size="sm" variant="bordered" onPress={onReconnect} isDisabled={isPending}>
                    Reconnect
                  </Button>
                  <Button size="sm" color="danger" variant="flat" onPress={onDisconnect} isDisabled={isPending}>
                    Disconnect
                  </Button>
                </div>
              )}
            </div>
          </HassConnectWrapper>
        )}
      </CardBody>
    </Card>
  );
}
