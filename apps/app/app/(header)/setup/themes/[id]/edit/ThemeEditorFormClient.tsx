"use client";

import nextDynamic from "next/dynamic";
import type { Theme } from "@repo/types/theme";

const ThemeEditorForm = nextDynamic(
  () =>
    import("@repo/ui/components/Themes/ThemeEditorForm").then(
      (m) => m.ThemeEditorForm
    ),
  {
    // HeroUI/React Aria uses useId for label/description wiring; SSR + React 19 can mismatch.
    ssr: false,
    loading: () => (
      <div className="max-w-6xl mx-auto px-4 py-8 animate-pulse text-sm text-neutral-500">
        Loading editor…
      </div>
    ),
  }
);

export function ThemeEditorFormClient({ theme }: { theme: Theme }) {
  return <ThemeEditorForm theme={theme} />;
}
