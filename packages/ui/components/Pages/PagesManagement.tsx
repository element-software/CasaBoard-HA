"use client";
import { useState, useTransition } from "react";
import { PageActions } from "@repo/lib";
import { Page } from "@repo/types/page";
import Icon from "@mdi/react";
import { mdiPlus, mdiWeb } from "@mdi/js";
import { Button, cn } from "@heroui/react";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { PageCard } from "./PageCard";
import { useAppRouter, useHAConnection } from "@repo/hooks";
import { AppLink } from "../Shared/AppLink";

interface PagesManagementProps {
  showAllPages?: boolean;
  showHeader?: boolean;
  initialPages?: Page[];
  initialError?: string | null;
  compact?: boolean;
}

export const PagesManagement = ({
  showAllPages = false,
  showHeader = true,
  initialPages = [],
  initialError = null,
  compact = false,
}: PagesManagementProps) => {
  const { connection } = useHAConnection();
  const { push, refresh } = useAppRouter();
  const [pages, setPages] = useState<Page[]>(initialPages);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const canCreateDashboard = () => !!connection;

  const handleCreatePage = () => {
    if (!connection) {
      push("/onboarding");
    } else {
      push("/setup/pages/create");
    }
  };

  const handleDeletePage = async (slug: string, pageName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${pageName}"? This action cannot be undone.`
      )
    )
      return;

    startTransition(async () => {
      try {
        await PageActions.deletePage(slug);
        setPages(pages.filter((page) => page.slug !== slug));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete page");
      }
    });
  };

  const handleDuplicatePage = (slug: string) => {
    startTransition(async () => {
      try {
        const page = await PageActions.duplicatePage(slug);
        push(`/setup/pages/edit/${page.slug}`);
        refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to duplicate page"
        );
      }
    });
  };

  const maxDisplayPages = compact ? 3 : 6;
  const displayPages = showAllPages
    ? pages
    : pages.slice(0, Math.max(maxDisplayPages, pages.length));

  if (error) return <ErrorState error={error} />;
  if (pages.length === 0)
    return (
      <EmptyState
        canCreate={canCreateDashboard()}
        onCreate={handleCreatePage}
      />
    );

  return (
    <div className="space-y-4">
      <div
        className={cn(
          "flex items-center",
          showHeader ? "justify-between" : "justify-end"
        )}
      >
        {showHeader && (
          <div>
            <h2
              className={cn(
                "font-semibold text-theme-text",
                compact ? "text-lg" : "text-xl"
              )}
            >
              Dashboard Pages
            </h2>
            {!compact && (
              <p className="text-sm text-theme-text-secondary">
                {pages.length} page{pages.length !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
        )}
        <Button
          color="primary"
          size="sm"
          startContent={<Icon path={mdiPlus} className="w-4 h-4" />}
          isDisabled={!canCreateDashboard()}
          onPress={handleCreatePage}
        >
          {compact ? "New" : "New Page"}
        </Button>
      </div>

      <div
        className={cn(
          compact ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 gap-3"
        )}
      >
        {displayPages.map((page) => (
          <PageCard
            key={page.id}
            page={page}
            compact={compact}
            onDelete={handleDeletePage}
            onDuplicate={handleDuplicatePage}
            isPending={isPending}
          />
        ))}
      </div>

      {!showAllPages && pages.length > maxDisplayPages && (
        <div className={cn("text-center", compact ? "py-2" : "py-3")}>
          <p
            className={cn(
              "text-theme-text-secondary",
              compact ? "text-xs" : "text-sm"
            )}
          >
            And {pages.length - maxDisplayPages} more pages
          </p>
        </div>
      )}

      {!showAllPages && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            as={AppLink}
            href="/setup/pages"
            variant="bordered"
            className="flex-1"
            startContent={<Icon path={mdiWeb} className="w-4 h-4" />}
          >
            Manage All Pages
          </Button>
        </div>
      )}
    </div>
  );
};
