"use client";

import { useMemo, useState, useTransition } from "react";
import { Button, Input } from "@heroui/react";
import type { Theme } from "@repo/types/theme";
import { THEME_EDITOR_GROUPS, themeTokenLabel } from "@repo/types/theme";
import { mergeThemeLayers, resolvedTokensToCssVars } from "@repo/lib";
import { updateTheme } from "@repo/lib/actions/themeActions";
import { ThemeScope } from "../ThemeScope/ThemeScope";
import { ThemeFixturePreview } from "./ThemeFixturePreview";
import { useAppRouter } from "@repo/hooks";

type ThemeEditorFormProps = {
  theme: Theme;
};

export function ThemeEditorForm({ theme }: ThemeEditorFormProps) {
  const { push, refresh } = useAppRouter();
  const [name, setName] = useState(theme.name);
  const [tokens, setTokens] = useState(() => mergeThemeLayers(theme.tokens));
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const previewStyle = useMemo(() => resolvedTokensToCssVars(tokens), [tokens]);

  const setToken = (key: string, value: string) => {
    setTokens((prev) => ({ ...prev, [key]: value }));
  };

  const save = () => {
    setError(null);
    startTransition(async () => {
      try {
        await updateTheme(theme.id, {
          name: name.trim(),
          tokens,
        });
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Save failed");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {error && (
        <div className="mb-4 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-800">
          {error}
        </div>
      )}
      <div className="flex flex-col gap-6 lg:flex-row">
        <div className="flex-1 space-y-6">
          <div className="flex flex-wrap items-end gap-3">
            <Input
              id={`te-${theme.id}-name`}
              label="Theme name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="max-w-md"
            />
            <Button color="primary" onPress={save} isLoading={pending}>
              Save
            </Button>
            <Button variant="bordered" onPress={() => push("/setup/themes")}>
              Back
            </Button>
          </div>
          {THEME_EDITOR_GROUPS.map((group) => (
            <section key={group.id} className="rounded-xl border border-theme-border bg-theme-background p-4">
              <h2 className="text-sm font-semibold text-theme-text mb-3">
                {group.label}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {group.keys.map((key) => (
                  <div key={key} className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={themeTokenLabel(key)}
                      className="h-10 w-14 cursor-pointer rounded border border-theme-border bg-transparent"
                      value={
                        /^#([0-9a-f]{6})$/i.test(tokens[key])
                          ? tokens[key]
                          : "#000000"
                      }
                      onChange={(e) => setToken(key, e.target.value)}
                    />
                    <Input
                      id={`te-${theme.id}-token-${key}`}
                      size="sm"
                      label={themeTokenLabel(key)}
                      value={tokens[key] ?? ""}
                      onValueChange={(v) => setToken(key, v)}
                      className="flex-1"
                    />
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
        <div className="w-full lg:w-96 shrink-0">
          <ThemeScope style={previewStyle} className="rounded-xl sticky top-4">
            <ThemeFixturePreview />
          </ThemeScope>
        </div>
      </div>
    </div>
  );
}
