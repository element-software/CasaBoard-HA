"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useSearchParams } from "next/navigation";
import { useAppRouter } from "@repo/hooks";
import { Button, Input, Spinner, Tab, Tabs } from "@heroui/react";
import Icon from "@mdi/react";
import { mdiCheckCircle, mdiHomeAssistant } from "@mdi/js";
import {
  classifyConnectionError,
  completeOAuthCallback,
  isOAuthCallbackUrl,
  normalizeHassUrl,
  oauthRedirectUrl,
  reauthenticate,
  testLongLivedTokenConnection,
  type HAConnectionFailure,
} from "@casaboard/ha";
import {
  HAConnectionActions,
  createServerTokenStore,
} from "@repo/lib";

type AuthMethod = "token" | "oauth";

function FailureBanner({ failure }: { failure: HAConnectionFailure }) {
  return (
    <div
      role="alert"
      className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800"
      data-failure-code={failure.code}
    >
      <p className="font-medium">{labelForCode(failure.code)}</p>
      <p className="mt-1 text-red-700/90">{failure.message}</p>
    </div>
  );
}

function labelForCode(code: HAConnectionFailure["code"]): string {
  switch (code) {
    case "invalid_url":
      return "Invalid URL";
    case "unreachable":
      return "Unreachable";
    case "invalid_auth":
      return "Invalid or expired token";
    case "ssl":
      return "SSL certificate problem";
    case "https_to_http":
      return "HTTPS / HTTP mismatch";
    case "host_required":
      return "URL required";
    default:
      return "Connection failed";
  }
}

export function OnboardingWizard({
  initialHassUrl = "",
}: {
  initialHassUrl?: string;
}) {
  const { replace, refresh } = useAppRouter();
  const searchParams = useSearchParams();
  const [step, setStep] = useState<"connect" | "completing" | "done">(
    isOAuthCallbackUrl(searchParams) ? "completing" : "connect"
  );
  const [method, setMethod] = useState<AuthMethod>("token");
  const [hassUrl, setHassUrl] = useState(initialHassUrl);
  const [token, setToken] = useState("");
  const [failure, setFailure] = useState<HAConnectionFailure | null>(null);
  const [isPending, startTransition] = useTransition();
  const callbackStarted = useRef(false);

  const tokenStore = useMemo(() => createServerTokenStore(), []);
  const redirectUrl = useMemo(() => oauthRedirectUrl("/onboarding"), []);

  // Finish OAuth return: exchange code → persist tokens → enter app.
  // Must run while ?auth_callback=&code=&state= are still on the URL.
  useEffect(() => {
    if (!isOAuthCallbackUrl(searchParams) || callbackStarted.current) return;
    callbackStarted.current = true;

    const finish = async () => {
      setStep("completing");
      setFailure(null);
      try {
        const connection = await HAConnectionActions.getHAConnection();
        const url = connection?.hass_url || initialHassUrl;
        if (!url) {
          setFailure({
            code: "host_required",
            message:
              "Home Assistant returned here, but no URL was saved. Enter your HA URL and try again.",
          });
          setStep("connect");
          replace("/onboarding");
          return;
        }

        await completeOAuthCallback({
          haInstance: { hass_url: url },
          tokenStore,
          redirectUrl,
        });

        setStep("done");
        replace("/setup");
        refresh();
      } catch (err) {
        setFailure(classifyConnectionError(err));
        setStep("connect");
        // Strip callback params so a refresh doesn't loop, but keep the form.
        replace("/onboarding");
      }
    };

    void finish();
  }, [searchParams, tokenStore, redirectUrl, initialHassUrl, replace, refresh]);

  const goToSetup = () => {
    setStep("done");
    window.setTimeout(() => {
      replace("/setup");
      refresh();
    }, 500);
  };

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
        goToSetup();
      } catch (err) {
        setFailure(classifyConnectionError(err));
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
        // Persist URL so the return trip can complete even if React state is gone.
        await HAConnectionActions.saveHAConnection(normalized.url, null);
        // Navigates away to HA; resolves only if tokens already exist.
        await reauthenticate({
          haInstance: { hass_url: normalized.url },
          tokenStore,
          redirectUrl,
        });
        const valid = await HAConnectionActions.hasValidHAConnection();
        if (valid) {
          goToSetup();
        }
      } catch (err) {
        setFailure(classifyConnectionError(err));
      }
    });
  };

  return (
    <div className="flex min-h-[calc(100dvh-4rem)] items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-6">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100">
            <Icon path={mdiHomeAssistant} className="h-7 w-7 text-violet-700" />
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-violet-600">
              First-run setup
            </p>
            <h1 className="text-2xl font-bold text-theme-text">
              Connect Home Assistant
            </h1>
          </div>
        </div>

        <p className="text-sm text-theme-text-secondary">
          CasaBoard runs locally and talks to one Home Assistant instance. Enter
          your URL and authorise — you can change this later under Setup → Home
          Assistant.
        </p>

        {step === "completing" ? (
          <div className="flex items-center gap-3 rounded-xl border border-theme-border bg-theme-surface p-5">
            <Spinner size="sm" />
            <div>
              <p className="font-medium text-theme-text">Completing sign-in…</p>
              <p className="text-sm text-theme-text-secondary">
                Exchanging the Home Assistant authorisation code.
              </p>
            </div>
          </div>
        ) : null}

        {step === "done" ? (
          <div className="flex items-center gap-3 rounded-xl border border-green-300 bg-green-50 p-4 text-green-800">
            <Icon path={mdiCheckCircle} className="h-6 w-6 shrink-0" />
            <div>
              <p className="font-medium">Connected</p>
              <p className="text-sm text-green-700/90">
                Opening your setup dashboard…
              </p>
            </div>
          </div>
        ) : null}

        {step === "connect" ? (
          <div className="space-y-4 rounded-2xl border border-theme-border bg-theme-surface p-5 shadow-sm">
            {failure ? <FailureBanner failure={failure} /> : null}

            <Input
              label="Home Assistant URL"
              value={hassUrl}
              onValueChange={(v) => {
                setHassUrl(v);
                setFailure(null);
              }}
              description="e.g. homeassistant.local:8123 or https://ha.example.com"
              placeholder="homeassistant.local:8123"
              isDisabled={isPending}
            />

            <Tabs
              selectedKey={method}
              onSelectionChange={(key) => {
                setMethod(key as AuthMethod);
                setFailure(null);
              }}
              aria-label="Authentication method"
              classNames={{ panel: "pt-3" }}
            >
              <Tab key="token" title="Access token">
                <div className="space-y-3">
                  <Input
                    label="Long-lived access token"
                    type="password"
                    value={token}
                    onValueChange={(v) => {
                      setToken(v);
                      setFailure(null);
                    }}
                    description="HA → your profile → Long-lived access tokens"
                    isDisabled={isPending}
                  />
                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      isLoading={isPending}
                      isDisabled={!hassUrl.trim() || !token.trim()}
                      onPress={onConnectWithToken}
                    >
                      Connect
                    </Button>
                  </div>
                </div>
              </Tab>
              <Tab key="oauth" title="Sign in with HA">
                <div className="space-y-3">
                  <p className="text-sm text-theme-text-secondary">
                    You’ll be redirected to Home Assistant to approve the
                    connection, then returned here.
                  </p>
                  <div className="flex justify-end">
                    <Button
                      color="primary"
                      isLoading={isPending}
                      isDisabled={!hassUrl.trim()}
                      onPress={onConnectWithOAuth}
                    >
                      Continue to Home Assistant
                    </Button>
                  </div>
                </div>
              </Tab>
            </Tabs>
          </div>
        ) : null}
      </div>
    </div>
  );
}
