"use client";
import { mdiCog } from "@mdi/js";
import Icon from "@mdi/react";
import { AppLink } from "@repo/ui/components/Shared/AppLink";

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-8 bg-theme-background">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-theme-text mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-theme-text mb-4">
          Page Not Found
        </h2>
        <p className="text-theme-text-secondary mb-8">
          The page doesn&apos;t exist or hasn&apos;t been created yet.
        </p>
        <div className="flex gap-4 justify-center">
          <AppLink
            href="/setup"
            className="flex items-center gap-2 px-4 py-2 bg-theme-secondary border border-theme-border text-theme-text rounded-lg hover:bg-theme-background transition-colors"
          >
            <Icon path={mdiCog} className="h-4 w-4" />
            Setup
          </AppLink>
        </div>
      </div>
    </main>
  );
}
