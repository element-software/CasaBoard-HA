import { ReactNode } from "react";
import Icon from "@mdi/react";
import { mdiChevronLeft } from "@mdi/js";

interface SetupPageShellProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  backHref?: string;
  backLabel?: string;
  children: ReactNode;
}

export function SetupPageShell({
  title,
  subtitle,
  action,
  backHref = "/setup",
  backLabel = "Setup",
  children,
}: SetupPageShellProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div>
        {/*
          Plain <a> instead of Next.js Link — keeps SetupPageShell a pure server
          component with no client-component siblings before {children}. Using
          Link here shifts PagesManagement's sibling index in the React fiber
          tree and causes React Aria useId() mismatches on hydration.
        */}
        <a
          href={backHref}
          className="inline-flex items-center gap-1 text-xs font-medium text-theme-text-secondary hover:text-theme-text transition-colors mb-4 group"
        >
          <Icon
            path={mdiChevronLeft}
            className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5"
          />
          {backLabel}
        </a>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-theme-text tracking-tight">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-1 text-sm text-theme-text-secondary">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-shrink-0 mt-0.5">{action}</div>}
        </div>

        <div className="mt-5 border-b border-theme-border" />
      </div>

      <div>{children}</div>
    </div>
  );
}
