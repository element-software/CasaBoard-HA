"use client";
import React, { useTransition, useState } from "react";
import { Button, Card, CardBody } from "@heroui/react";
import { useAppRouter } from "@repo/hooks";

export default function HassErrorFallback({ error }: { error: unknown }) {
  const { replace, refresh } = useAppRouter();
  const [pending, startTransition] = useTransition();
  const [localError, setLocalError] = useState<string | null>(null);

  const handleReset = async () => {
    startTransition(async () => {
      try {
        replace("/setup/ha-config");
      } catch (e: any) {
        setLocalError(e?.message || "Failed to delete settings");
      }
    });
  };

  return (
    <div className="flex justify-center items-center h-screen">
      <Card className="bg-theme-background border border-theme-border max-w-4xl mx-auto justify-center items-center">
        <CardBody className="p-6 space-y-4">
          <div className="text-red-500 font-medium">
            Home Assistant connection error
          </div>
          <pre className="whitespace-pre-wrap text-sm text-theme-text-secondary">
            {String((error as any)?.message || error)}
          </pre>
          {localError && (
            <div className="text-sm text-red-500">{localError}</div>
          )}
          <div className="flex gap-3">
            <Button color="danger" onPress={handleReset} isLoading={pending}>
              Delete HA settings and reconfigure
            </Button>
            <Button variant="bordered" onPress={() => refresh()}>
              Try again
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
