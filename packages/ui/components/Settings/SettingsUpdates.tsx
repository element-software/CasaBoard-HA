"use client";

import { useCallback, useState } from "react";
import { Button, Card, CardBody, Chip } from "@heroui/react";
import { useAppHref } from "@repo/hooks";

type UpdateCheckResponse = {
  ok: boolean;
  installed?: string;
  latest?: string;
  update_available?: boolean;
  managed_by_supervisor?: boolean;
  instructions?: string[];
  error?: string;
};

export function SettingsUpdates() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<UpdateCheckResponse | null>(null);
  const checkUrl = useAppHref("/api/updates/check");

  const runCheck = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(checkUrl, { cache: "no-store" });
      const data = (await response.json()) as UpdateCheckResponse;
      setResult(data);
    } catch (error) {
      setResult({
        ok: false,
        error: error instanceof Error ? error.message : "Update check failed",
      });
    } finally {
      setLoading(false);
    }
  }, [checkUrl]);

  return (
    <Card className="border border-theme-border shadow-sm">
      <CardBody className="gap-4">
        <div>
          <h2 className="text-lg font-semibold text-theme-text">Updates</h2>
          <p className="text-sm text-theme-text-secondary">
            Check whether a newer CasaBoard release is published on GitHub.
          </p>
        </div>

        <Button color="primary" onPress={runCheck} isLoading={loading}>
          Check for updates
        </Button>

        {result && (
          <div className="space-y-3 text-sm">
            {!result.ok && (
              <p className="text-danger">{result.error ?? "Update check failed."}</p>
            )}

            {result.ok && result.managed_by_supervisor && (
              <p className="text-theme-text-secondary">
                This instance runs as a Home Assistant App. Use{" "}
                <strong>Settings → System → Updates</strong> in Home Assistant to
                upgrade CasaBoard.
              </p>
            )}

            {result.ok && result.installed && (
              <p>
                Installed: <code>{result.installed}</code>
                {result.latest && (
                  <>
                    {" "}
                    · Latest release: <code>{result.latest}</code>
                  </>
                )}
              </p>
            )}

            {result.ok && result.update_available === false && (
              <Chip color="success" variant="flat">
                Up to date
              </Chip>
            )}

            {result.ok && result.update_available && !result.managed_by_supervisor && (
              <>
                <Chip color="warning" variant="flat">
                  Update available
                </Chip>
                <div>
                  <p className="mb-2 text-theme-text-secondary">
                    Run these commands on the host:
                  </p>
                  <pre className="rounded-lg bg-slate-950 text-slate-100 p-4 overflow-x-auto text-xs">
                    {(result.instructions ?? []).join("\n")}
                  </pre>
                </div>
              </>
            )}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
