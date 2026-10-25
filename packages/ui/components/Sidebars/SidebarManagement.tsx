"use client";
import { useState, useTransition } from "react";
import { SidebarActions } from "@repo/lib";
import { Sidebar } from "@repo/types/sidebar";
import Icon from "@mdi/react";
import {
  mdiPlus,
  mdiPencil,
  mdiTrashCan,
  mdiMenu,
  mdiDotsVertical,
  mdiClock,
  mdiCheckCircle,
  mdiAlertCircle,
  mdiContentCopy,
} from "@mdi/js";
import {
  Button,
  Card,
  CardBody,
  Chip,
  Spinner,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from "@heroui/react";
import { useHAConnection, useAppRouter } from "@repo/hooks";
import { AppLink } from "../Shared/AppLink";

interface SidebarManagementProps {
  showAllSidebars?: boolean;
  showHeader?: boolean;
  initialSidebars?: Sidebar[];
  initialError?: string | null;
  compact?: boolean;
}

export const SidebarManagement = ({
  showAllSidebars = false,
  showHeader = true,
  initialSidebars = [],
  initialError = null,
  compact = false,
}: SidebarManagementProps) => {
  const { connection } = useHAConnection();
  const { push, refresh } = useAppRouter();
  const [sidebars, setSidebars] = useState<Sidebar[]>(initialSidebars);
  const [error, setError] = useState<string | null>(initialError);
  const [isPending, startTransition] = useTransition();

  const canCreateSidebar = () => true;

  const handleDeleteSidebar = async (slug: string, sidebarName: string) => {
    if (
      !confirm(
        `Are you sure you want to delete "${sidebarName}"? This action cannot be undone.`
      )
    ) {
      return;
    }

    startTransition(async () => {
      try {
        await SidebarActions.deleteSidebar(slug);
        setSidebars(sidebars.filter((sidebar) => sidebar.slug !== slug));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete sidebar");
      }
    });
  };

  const handleDuplicateSidebar = (slug: string) => {
    startTransition(async () => {
      try {
        const sidebar = await SidebarActions.duplicateSidebar(slug);
        push(`/setup/sidebars/edit/${sidebar.slug}`);
        refresh();
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to duplicate sidebar"
        );
      }
    });
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return "Yesterday";
    return date.toLocaleDateString("en-GB");
  };

  // Filter sidebars based on showAllSidebars
  const maxDisplaySidebars = compact ? 3 : 6;
  const displaySidebars = showAllSidebars 
    ? sidebars 
    : sidebars.slice(0, maxDisplaySidebars);

  // Error state
  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50">
        <CardBody className="p-4">
          <div className="flex items-center gap-2 text-danger-600">
            <Icon path={mdiAlertCircle} className="w-5 h-5" />
            <span className="font-medium">Error loading sidebars</span>
          </div>
          <p className="text-sm text-danger-500 mt-1">{error}</p>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            className="mt-2"
            onPress={() => setError(null)}
          >
            Dismiss
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Empty state
  if (sidebars.length === 0) {
    return (
      <Card className="border-dashed border-2 border-theme-border">
        <CardBody className="p-6 text-center">
          <Icon path={mdiMenu} className="w-12 h-12 text-theme-text-secondary mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-theme-text mb-2">
            No sidebars yet
          </h3>
          {!connection ? (
            <>
            <p className="text-theme-text-secondary mb-4">
              You need to have at least one Home Assistant instance to create a sidebar.
            </p>
            <Button
              as={AppLink}
              href="/onboarding"
              color="primary"
              startContent={<Icon path={mdiPlus} className="w-4 h-4" />}
            >
              Connect Home Assistant
            </Button>
            </>
          ) : (
            <>
            <p className="text-theme-text-secondary mb-4">
              Create your first sidebar to get started
            </p>
            <Button
              as={AppLink}
              href="/setup/sidebars/create"
              color="primary"
              startContent={<Icon path={mdiPlus} className="w-4 h-4" />}
              isDisabled={!canCreateSidebar()}
            >
              Create Sidebar
            </Button>
            </>
          )}

        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header — same structure regardless of showHeader to keep React Aria IDs stable */}
      <div className={cn("flex items-center", showHeader ? "justify-between" : "justify-end")}>
        {showHeader && (
          <div>
            <h2
              className={cn("font-semibold text-theme-text", {
                "text-lg": compact,
                "text-xl": !compact,
              })}
            >
              Sidebars
            </h2>
            {!compact && (
              <p className="text-sm text-theme-text-secondary">
                {sidebars.length} sidebar{sidebars.length !== 1 ? "s" : ""} total
              </p>
            )}
          </div>
        )}
        <Button
          as={AppLink}
          href="/setup/sidebars/create"
          color="primary"
          size="sm"
          startContent={<Icon path={mdiPlus} className="w-4 h-4" />}
          isDisabled={!canCreateSidebar()}
        >
          {compact ? "New" : "New Sidebar"}
        </Button>
      </div>

      {/* Sidebars List */}
      <div
        className={cn(
          compact ? "space-y-2" : "grid grid-cols-1 sm:grid-cols-2 gap-3"
        )}
      >
        {displaySidebars.map((sidebar) => (
          <Card key={sidebar.id} className="hover:shadow-md transition-shadow">
            <CardBody className={cn(compact ? "p-3" : "p-4")}>
              <div
                className={cn(
                  "flex justify-between",
                  compact ? "items-center gap-3" : "items-start gap-4"
                )}
              >
                {/* Sidebar Info */}
                <div className="flex-1 min-w-0">
                  <div
                    className={cn(
                      "flex items-center gap-2",
                      !compact && "mb-2"
                    )}
                  >
                    <h3
                      className={cn(
                        "text-theme-text truncate",
                        compact ? "font-medium text-sm" : "font-semibold"
                      )}
                    >
                      {sidebar.name}
                    </h3>
                    <Chip
                      size="sm"
                      color="primary"
                      variant="flat"
                      className={compact ? "text-xs" : ""}
                      startContent={
                        !compact && (
                          <Icon
                            path={mdiCheckCircle}
                            className="w-3 h-3"
                          />
                        )
                      }
                    >
                      Active
                    </Chip>
                  </div>

                  {/* Metadata */}
                  {compact ? (
                    <div className="flex items-center gap-3 mt-1 text-xs text-theme-text-secondary">
                      <span className="font-mono">/{sidebar.slug}</span>
                      <span>•</span>
                      <span>{formatDate(sidebar.updated_at)}</span>
                    </div>
                  ) : (
                    <div className="space-y-1 text-sm text-theme-text-secondary">
                      <div className="flex items-center gap-2">
                        <Icon path={mdiMenu} className="w-4 h-4 flex-shrink-0" />
                        <span className="font-mono text-xs">/{sidebar.slug}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Icon
                          path={mdiClock}
                          className="w-4 h-4 flex-shrink-0"
                        />
                        <span className="text-xs">
                          Updated {formatDate(sidebar.updated_at)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Button
                    as={AppLink}
                    href={`/setup/sidebars/edit/${sidebar.slug}`}
                    isIconOnly
                    size="sm"
                    variant="light"
                    title="Edit sidebar"
                  >
                    <Icon path={mdiPencil} className="w-4 h-4" />
                  </Button>

                  <Dropdown>
                    <DropdownTrigger>
                      <Button
                        isIconOnly
                        size="sm"
                        variant="light"
                        title="More actions"
                      >
                        <Icon path={mdiDotsVertical} className="w-4 h-4" />
                      </Button>
                    </DropdownTrigger>
                    <DropdownMenu aria-label="Sidebar actions">
                      <DropdownItem key="duplicate" className="p-0">
                        <Button
                          variant="flat"
                          size="sm"
                          title="Duplicate sidebar"
                          className="w-full"
                          onPress={() => handleDuplicateSidebar(sidebar.slug)}
                          startContent={
                            <Icon path={mdiContentCopy} className="w-4 h-4" />
                          }
                          isDisabled={isPending}
                        >
                          Duplicate
                        </Button>
                      </DropdownItem>
                      <DropdownItem key="delete" className="p-0">
                        <Button
                          color="danger"
                          variant="flat"
                          size="sm"
                          title="Delete sidebar"
                          className="w-full"
                          onPress={() => handleDeleteSidebar(sidebar.slug, sidebar.name)}
                          startContent={
                            <Icon path={mdiTrashCan} className="w-4 h-4" />
                          }
                          isLoading={isPending}
                        >
                          Delete
                        </Button>
                      </DropdownItem>
                    </DropdownMenu>
                  </Dropdown>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>

      {/* Footer Info */}
      {!showAllSidebars && sidebars.length > maxDisplaySidebars && (
        <div className={cn("text-center", compact ? "py-2" : "py-3")}>
          <p
            className={cn(
              "text-theme-text-secondary",
              compact ? "text-xs" : "text-sm"
            )}
          >
            And {sidebars.length - maxDisplaySidebars} more sidebars
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {!showAllSidebars && (
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            as={AppLink}
            href="/setup/sidebars"
            variant="bordered"
            className="flex-1"
            startContent={<Icon path={mdiMenu} className="w-4 h-4" />}
          >
            Manage All Sidebars
          </Button>
        </div>
      )}
    </div>
  );
};
