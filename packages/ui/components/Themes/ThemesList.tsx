"use client";

import { useState, useTransition } from "react";
import {
  Button,
  Card,
  CardBody,
  Input,
  Chip,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";
import type { Theme } from "@repo/types/theme";
import {
  createTheme,
  deleteTheme,
  duplicateTheme,
} from "@repo/lib/actions/themeActions";
import { useAppRouter } from "@repo/hooks";
import { AppLink } from "../Shared/AppLink";
import Icon from "@mdi/react";
import {
  mdiPlus,
  mdiPencil,
  mdiTrashCan,
  mdiDotsVertical,
  mdiContentCopy,
  mdiClock,
} from "@mdi/js";

type ThemesListProps = {
  initialThemes: Theme[];
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInHours = Math.floor(
    (now.getTime() - date.getTime()) / (1000 * 60 * 60)
  );
  if (diffInHours < 1) return "Just now";
  if (diffInHours < 24) return `${diffInHours}h ago`;
  if (diffInHours < 48) return "Yesterday";
  return date.toLocaleDateString("en-GB");
};

export function ThemesList({ initialThemes }: ThemesListProps) {
  const { push, refresh } = useAppRouter();
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const create = () => {
    setError(null);
    startTransition(async () => {
      try {
        const t = await createTheme({ name: name.trim() || "New theme" });
        setName("");
        push(`/setup/themes/${t.id}/edit`);
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not create theme");
      }
    });
  };

  const remove = (id: string) => {
    if (!confirm("Delete this theme? This cannot be undone.")) return;
    startTransition(async () => {
      try {
        await deleteTheme(id);
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not delete");
      }
    });
  };

  const dup = (id: string) => {
    startTransition(async () => {
      try {
        const t = await duplicateTheme(id);
        push(`/setup/themes/${t.id}/edit`);
        refresh();
      } catch (e) {
        setError(e instanceof Error ? e.message : "Could not duplicate");
      }
    });
  };

  return (
    <div className="space-y-4">
      {error && (
        <Card className="border-danger-200 bg-danger-50">
          <CardBody className="p-4">
            <p className="text-sm text-danger-600">{error}</p>
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
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Add theme card — always first in the grid */}
        <Card className="border-dashed border-2 border-theme-border bg-theme-surface">
          <CardBody className="p-4">
            <div className="flex items-end gap-2">
              <Input
                label="New theme name"
                placeholder="e.g. Midnight lounge"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && create()}
                size="sm"
                className="flex-1"
              />
              <Button
                color="primary"
                size="sm"
                startContent={<Icon path={mdiPlus} className="w-4 h-4" />}
                onPress={create}
                isLoading={pending}
                className="shrink-0 mb-0.5"
              >
                Add theme
              </Button>
            </div>
          </CardBody>
        </Card>

        {/* Theme cards */}
        {initialThemes.map((t) => (
          <Card key={t.id} className="hover:shadow-md transition-shadow">
            <CardBody className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className="w-4 h-4 rounded-full border border-theme-border shrink-0"
                      style={{
                        backgroundColor:
                          t.tokens?.primary ?? "var(--theme-primary, #8b5cf6)",
                      }}
                    />
                    <h3 className="font-semibold text-theme-text truncate">
                      {t.name}
                    </h3>
                    <Chip size="sm" color="default" variant="flat">
                      Custom
                    </Chip>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
                    <Icon path={mdiClock} className="w-3.5 h-3.5 shrink-0" />
                    <span>Updated {formatDate(t.updated_at)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    as={AppLink}
                    href={`/setup/themes/${t.id}/edit`}
                    isIconOnly
                    size="sm"
                    variant="light"
                    title="Edit theme"
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
                    <DropdownMenu aria-label="Theme actions">
                      <DropdownItem key="duplicate" className="p-0">
                        <Button
                          variant="flat"
                          size="sm"
                          className="w-full"
                          startContent={
                            <Icon path={mdiContentCopy} className="w-4 h-4" />
                          }
                          onPress={() => dup(t.id)}
                          isDisabled={pending}
                        >
                          Duplicate
                        </Button>
                      </DropdownItem>
                      <DropdownItem key="delete" className="p-0">
                        <Button
                          color="danger"
                          variant="flat"
                          size="sm"
                          className="w-full"
                          startContent={
                            <Icon path={mdiTrashCan} className="w-4 h-4" />
                          }
                          onPress={() => remove(t.id)}
                          isDisabled={pending}
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
    </div>
  );
}
