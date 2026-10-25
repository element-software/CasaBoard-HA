"use client";

import { Page } from "@repo/types/page";
import {
  Card,
  CardBody,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  cn,
} from "@heroui/react";
import Icon from "@mdi/react";
import {
  mdiWeb,
  mdiClock,
  mdiEye,
  mdiPencil,
  mdiDotsVertical,
  mdiTrashCan,
  mdiContentCopy,
} from "@mdi/js";
import { AppLink } from "../Shared/AppLink";

export const PageCard = ({
  page,
  compact,
  onDelete,
  onDuplicate,
  isPending,
}: {
  page: Page;
  compact: boolean;
  onDelete: (slug: string, name: string) => void;
  onDuplicate: (slug: string) => void;
  isPending: boolean;
}) => {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody className={cn(compact ? "p-3" : "p-4")}>
        <div
          className={cn(
            "flex justify-between",
            compact ? "items-center gap-3" : "items-start gap-4"
          )}
        >
          <div className="flex-1 min-w-0">
            <div className={cn("flex items-center gap-2", !compact && "mb-2")}>
              <h3
                className={cn(
                  "text-theme-text truncate",
                  compact ? "font-medium text-sm" : "font-semibold"
                )}
              >
                {page.name}
              </h3>
            </div>

            {compact ? (
              <div className="flex items-center gap-3 mt-1 text-xs text-theme-text-secondary">
                <span className="font-mono">/{page.slug}</span>
                <span>•</span>
                <span>{formatDate(page.updated_at)}</span>
              </div>
            ) : (
              <div className="space-y-1 text-sm text-theme-text-secondary">
                <div className="flex items-center gap-2">
                  <Icon path={mdiWeb} className="w-4 h-4 flex-shrink-0" />
                  <span className="font-mono text-xs">/{page.slug}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon path={mdiClock} className="w-4 h-4 flex-shrink-0" />
                  <span className="text-xs">
                    Updated {formatDate(page.updated_at)}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1">
            <Button
              as={AppLink}
              href={`/dashboard/${page.slug}`}
              isIconOnly
              size="sm"
              variant="light"
              title="Open dashboard"
            >
              <Icon path={mdiEye} className="w-4 h-4" />
            </Button>
            <Button
              as={AppLink}
              href={`/setup/pages/edit/${page.slug}`}
              isIconOnly
              size="sm"
              variant="light"
              title="Edit page"
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
              <DropdownMenu aria-label="Page actions">
                <DropdownItem key="duplicate" className="p-0">
                  <Button
                    variant="flat"
                    size="sm"
                    title="Duplicate page"
                    className="w-full"
                    onPress={() => onDuplicate(page.slug)}
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
                    title="Delete page"
                    className="w-full"
                    onPress={() => onDelete(page.slug, page.name)}
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
  );
};
