"use client";

import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import {
  Button,
  Card,
  CardBody,
  Checkbox,
  Chip,
  Input,
  Spinner,
} from "@heroui/react";
import Icon from "@mdi/react";
import {
  mdiAlertCircle,
  mdiBroom,
  mdiOpenInNew,
  mdiRefresh,
  mdiTrashCan,
} from "@mdi/js";
import {
  findProblematicEntities,
  ignoreRepairIssue,
  listEntityRegistry,
  listRepairIssues,
  removeEntityRegistryEntries,
  serviceErrorMessage,
  useHA,
  type EntityRegistryEntry,
  type ProblematicEntity,
  type ProblematicEntityReason,
  type RepairIssue,
} from "@casaboard/ha";
import type { HAConnection } from "@repo/types/ha";
import { HassConnectWrapper } from "../Shared/util/HassConnectWrapper";
import { ConfirmActionModal } from "./ConfirmActionModal";

type EntityFilter = "all" | ProblematicEntityReason;

type PendingAction =
  | { type: "remove-entities"; items: ProblematicEntity[] }
  | { type: "ignore-repair"; issue: RepairIssue; ignore: boolean };

const REASON_LABEL: Record<ProblematicEntityReason, string> = {
  unavailable: "Unavailable",
  unknown: "Unknown",
  orphaned: "Orphaned",
};

const REASON_COLOR: Record<
  ProblematicEntityReason,
  "warning" | "default" | "danger"
> = {
  unavailable: "warning",
  unknown: "default",
  orphaned: "danger",
};

function severityColor(
  severity: string
): "danger" | "warning" | "default" {
  if (severity === "critical" || severity === "error") return "danger";
  if (severity === "warning") return "warning";
  return "default";
}

function issueTitle(issue: RepairIssue): string {
  const key = issue.translation_key?.replace(/_/g, " ");
  return key ? key.charAt(0).toUpperCase() + key.slice(1) : issue.issue_id;
}

function HACleanupInner() {
  const {
    connection,
    connected,
    loading: haLoading,
    getAllEntities,
  } = useHA();

  const [registry, setRegistry] = useState<EntityRegistryEntry[]>([]);
  const [states, setStates] = useState<Record<string, { state?: string }>>({});
  const [issues, setIssues] = useState<RepairIssue[]>([]);
  const [entityError, setEntityError] = useState<string | null>(null);
  const [repairError, setRepairError] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(false);

  const [filter, setFilter] = useState<EntityFilter>("all");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const [pending, setPending] = useState<PendingAction | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!connection) return;
    setLoadingData(true);
    setEntityError(null);
    setRepairError(null);

    const [registryResult, repairsResult] = await Promise.allSettled([
      listEntityRegistry(connection),
      listRepairIssues(connection),
    ]);

    if (registryResult.status === "fulfilled") {
      setRegistry(registryResult.value);
    } else {
      setEntityError(
        serviceErrorMessage(
          registryResult.reason,
          "Failed to load the entity registry. An admin Home Assistant token is required."
        )
      );
    }

    if (repairsResult.status === "fulfilled") {
      setIssues(repairsResult.value);
    } else {
      setRepairError(
        serviceErrorMessage(
          repairsResult.reason,
          "Failed to load repairs."
        )
      );
    }

    const stateMap: Record<string, { state?: string }> = {};
    for (const entity of getAllEntities()) {
      const id = entity?.entity_id as string | undefined;
      if (id) stateMap[id] = entity;
    }
    setStates(stateMap);

    setLoadingData(false);
  }, [connection, getAllEntities]);

  useEffect(() => {
    if (!connected || !connection || haLoading) return;
    void load();
  }, [connected, connection, haLoading, load]);

  const problematic = useMemo(
    () => findProblematicEntities(registry, states),
    [registry, states]
  );

  const counts = useMemo(() => {
    const next = {
      all: problematic.length,
      unavailable: 0,
      unknown: 0,
      orphaned: 0,
    };
    for (const item of problematic) next[item.reason] += 1;
    return next;
  }, [problematic]);

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return problematic.filter((item) => {
      if (filter !== "all" && item.reason !== filter) return false;
      if (!needle) return true;
      return (
        item.entry.entity_id.toLowerCase().includes(needle) ||
        item.displayName.toLowerCase().includes(needle) ||
        (item.entry.platform ?? "").toLowerCase().includes(needle)
      );
    });
  }, [problematic, filter, query]);

  const visibleIds = useMemo(
    () => visible.map((item) => item.entry.entity_id),
    [visible]
  );
  const selectedVisibleCount = visibleIds.filter((id) => selected.has(id)).length;
  const allVisibleSelected =
    visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;

  const toggleAllVisible = (isSelected: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      for (const id of visibleIds) {
        if (isSelected) next.add(id);
        else next.delete(id);
      }
      return next;
    });
  };

  const toggleOne = (entityId: string, isSelected: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (isSelected) next.add(entityId);
      else next.delete(entityId);
      return next;
    });
  };

  const closeModal = () => {
    if (actionLoading) return;
    setPending(null);
    setActionError(null);
  };

  const handleConfirm = async () => {
    if (!connection || !pending) return;
    setActionLoading(true);
    setActionError(null);

    try {
      if (pending.type === "remove-entities") {
        const ids = pending.items.map((item) => item.entry.entity_id);
        const result = await removeEntityRegistryEntries(connection, ids);
        const removed = new Set(result.removed);
        setRegistry((prev) =>
          prev.filter((entry) => !removed.has(entry.entity_id))
        );
        setSelected((prev) => {
          const next = new Set(prev);
          for (const id of result.removed) next.delete(id);
          return next;
        });
        if (result.failed.length > 0) {
          setActionError(
            `Removed ${result.removed.length}. Failed: ${result.failed
              .map((row) => `${row.entityId} (${row.error})`)
              .join("; ")}`
          );
          setPending({
            type: "remove-entities",
            items: pending.items.filter(
              (item) => !removed.has(item.entry.entity_id)
            ),
          });
          return;
        }
        setPending(null);
      } else {
        await ignoreRepairIssue(
          connection,
          pending.issue.domain,
          pending.issue.issue_id,
          pending.ignore
        );
        setIssues((prev) =>
          prev.map((issue) =>
            issue.domain === pending.issue.domain &&
            issue.issue_id === pending.issue.issue_id
              ? { ...issue, ignored: pending.ignore }
              : issue
          )
        );
        setPending(null);
      }
    } catch (err) {
      setActionError(
        serviceErrorMessage(err, "The action failed. An admin token may be required.")
      );
    } finally {
      setActionLoading(false);
    }
  };

  const modalCopy = (() => {
    if (!pending) {
      return {
        title: "",
        body: null as ReactNode,
        confirmLabel: "Confirm",
        confirmColor: "primary" as const,
      };
    }
    if (pending.type === "remove-entities") {
      const count = pending.items.length;
      const names = pending.items.slice(0, 8).map((item) => item.entry.entity_id);
      return {
        title: count === 1 ? "Remove entity" : `Remove ${count} entities`,
        body: (
          <div className="space-y-2">
            <p>
              Remove {count === 1 ? "this entity" : "these entities"} from the
              Home Assistant entity registry? This cannot be undone. Integrations
              may recreate them if the devices still exist.
            </p>
            <ul className="list-disc pl-5 font-mono text-xs text-theme-text-secondary space-y-1">
              {names.map((id) => (
                <li key={id}>{id}</li>
              ))}
              {count > names.length && (
                <li>and {count - names.length} more</li>
              )}
            </ul>
          </div>
        ),
        confirmLabel: count === 1 ? "Remove entity" : `Remove ${count} entities`,
        confirmColor: "danger" as const,
      };
    }
    const verb = pending.ignore ? "Ignore" : "Restore";
    return {
      title: `${verb} repair`,
      body: (
        <p>
          {pending.ignore
            ? "Ignore this repair in Home Assistant? It will stay hidden until you restore it."
            : "Restore this repair so it shows again in Home Assistant?"}{" "}
          <span className="font-medium text-theme-text">
            {pending.issue.domain} / {pending.issue.issue_id}
          </span>
        </p>
      ),
      confirmLabel: verb,
      confirmColor: "primary" as const,
    };
  })();

  if (haLoading || !connected) {
    return (
      <div className="flex items-center gap-3 text-sm text-theme-text-secondary py-8">
        <Spinner size="sm" />
        Connecting to Home Assistant…
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-end">
        <Button
          size="sm"
          variant="bordered"
          startContent={<Icon path={mdiRefresh} className="w-4 h-4" />}
          onPress={() => void load()}
          isLoading={loadingData}
        >
          Refresh
        </Button>
      </div>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-theme-text">Entities</h2>
          <p className="text-sm text-theme-text-secondary">
            Unavailable, unknown, and orphaned registry entries. Disabled
            entities are left alone.
          </p>
        </div>

        {entityError && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {entityError}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2">
          {(
            [
              ["all", "All"],
              ["unavailable", "Unavailable"],
              ["unknown", "Unknown"],
              ["orphaned", "Orphaned"],
            ] as const
          ).map(([key, label]) => (
            <Button
              key={key}
              size="sm"
              variant={filter === key ? "solid" : "flat"}
              color={filter === key ? "primary" : "default"}
              onPress={() => setFilter(key)}
            >
              {label} ({counts[key]})
            </Button>
          ))}
          <Input
            size="sm"
            className="max-w-xs ml-auto"
            placeholder="Search entity, name, platform"
            value={query}
            onValueChange={setQuery}
          />
        </div>

        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-theme-text-secondary">
            {selected.size} selected
          </p>
          <Button
            size="sm"
            color="danger"
            startContent={<Icon path={mdiTrashCan} className="w-4 h-4" />}
            isDisabled={selected.size === 0}
            onPress={() => {
              const items = problematic.filter((item) =>
                selected.has(item.entry.entity_id)
              );
              if (items.length === 0) return;
              setActionError(null);
              setPending({ type: "remove-entities", items });
            }}
          >
            Remove selected
          </Button>
        </div>

        {loadingData && problematic.length === 0 ? (
          <div className="flex items-center gap-3 text-sm text-theme-text-secondary py-6">
            <Spinner size="sm" />
            Loading entity registry…
          </div>
        ) : visible.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10">
              <div className="w-12 h-12 mx-auto mb-3 bg-violet-50 rounded-full flex items-center justify-center">
                <Icon path={mdiBroom} className="w-6 h-6 text-violet-500" />
              </div>
              <p className="font-medium text-theme-text">No matching entities</p>
              <p className="text-sm text-theme-text-secondary mt-1">
                {problematic.length === 0
                  ? "Nothing looks unused or unknown right now."
                  : "Try a different filter or search."}
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="rounded-lg border border-theme-border divide-y divide-theme-border overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-2 bg-slate-50 text-xs font-medium text-theme-text-secondary">
              <Checkbox
                size="sm"
                isSelected={allVisibleSelected}
                isIndeterminate={
                  selectedVisibleCount > 0 && !allVisibleSelected
                }
                onValueChange={toggleAllVisible}
                aria-label="Select all visible entities"
              />
              <span className="flex-1">Entity</span>
              <span className="w-28 hidden sm:block">Platform</span>
              <span className="w-28">Status</span>
              <span className="w-20" />
            </div>
            {visible.map((item) => {
              const id = item.entry.entity_id;
              return (
                <div
                  key={id}
                  className="flex items-center gap-3 px-4 py-3 bg-white"
                >
                  <Checkbox
                    size="sm"
                    isSelected={selected.has(id)}
                    onValueChange={(isSelected) => toggleOne(id, isSelected)}
                    aria-label={`Select ${id}`}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-theme-text truncate">
                      {item.displayName}
                    </p>
                    <p className="text-xs font-mono text-theme-text-secondary truncate">
                      {id}
                    </p>
                  </div>
                  <span className="w-28 hidden sm:block text-xs text-theme-text-secondary truncate">
                    {item.entry.platform || "—"}
                  </span>
                  <span className="w-28">
                    <Chip
                      size="sm"
                      variant="flat"
                      color={REASON_COLOR[item.reason]}
                    >
                      {REASON_LABEL[item.reason]}
                    </Chip>
                  </span>
                  <span className="w-20 flex justify-end">
                    <Button
                      size="sm"
                      color="danger"
                      variant="light"
                      onPress={() => {
                        setActionError(null);
                        setPending({ type: "remove-entities", items: [item] });
                      }}
                    >
                      Remove
                    </Button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-theme-text">Repairs</h2>
          <p className="text-sm text-theme-text-secondary">
            Open issues from Home Assistant. Fixable repairs still need to be
            completed in HA.
          </p>
        </div>

        {repairError && (
          <div
            role="alert"
            className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {repairError}
          </div>
        )}

        {loadingData && issues.length === 0 && !repairError ? (
          <div className="flex items-center gap-3 text-sm text-theme-text-secondary py-6">
            <Spinner size="sm" />
            Loading repairs…
          </div>
        ) : issues.length === 0 ? (
          <Card>
            <CardBody className="text-center py-10">
              <div className="w-12 h-12 mx-auto mb-3 bg-violet-50 rounded-full flex items-center justify-center">
                <Icon path={mdiAlertCircle} className="w-6 h-6 text-violet-500" />
              </div>
              <p className="font-medium text-theme-text">No open repairs</p>
              <p className="text-sm text-theme-text-secondary mt-1">
                Home Assistant is not reporting any active issues.
              </p>
            </CardBody>
          </Card>
        ) : (
          <div className="space-y-3">
            {issues.map((issue) => (
              <Card key={`${issue.domain}:${issue.issue_id}`}>
                <CardBody className="flex flex-col sm:flex-row sm:items-center gap-3 p-4">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-medium text-theme-text">
                        {issueTitle(issue)}
                      </p>
                      <Chip
                        size="sm"
                        variant="flat"
                        color={severityColor(issue.severity)}
                      >
                        {issue.severity}
                      </Chip>
                      {issue.ignored && (
                        <Chip size="sm" variant="flat" color="default">
                          Ignored
                        </Chip>
                      )}
                      {issue.is_fixable && (
                        <Chip size="sm" variant="flat" color="secondary">
                          Fix in HA
                        </Chip>
                      )}
                    </div>
                    <p className="text-xs font-mono text-theme-text-secondary">
                      {issue.domain} / {issue.issue_id}
                    </p>
                    {issue.is_fixable && (
                      <p className="text-xs text-theme-text-secondary">
                        This issue has a fix flow in Home Assistant Settings →
                        Repairs.
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {issue.learn_more_url && (
                      <Button
                        size="sm"
                        variant="light"
                        as="a"
                        href={issue.learn_more_url}
                        target="_blank"
                        rel="noreferrer"
                        startContent={
                          <Icon path={mdiOpenInNew} className="w-4 h-4" />
                        }
                      >
                        Learn more
                      </Button>
                    )}
                    <Button
                      size="sm"
                      color="primary"
                      variant={issue.ignored ? "bordered" : "flat"}
                      onPress={() => {
                        setActionError(null);
                        setPending({
                          type: "ignore-repair",
                          issue,
                          ignore: !issue.ignored,
                        });
                      }}
                    >
                      {issue.ignored ? "Restore" : "Ignore"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        )}
      </section>

      <ConfirmActionModal
        isOpen={pending !== null}
        title={modalCopy.title}
        body={modalCopy.body}
        confirmLabel={modalCopy.confirmLabel}
        confirmColor={modalCopy.confirmColor}
        isLoading={actionLoading}
        error={actionError}
        onConfirm={() => void handleConfirm()}
        onClose={closeModal}
      />
    </div>
  );
}

export function HACleanup({ haInstance }: { haInstance: HAConnection }) {
  return (
    <HassConnectWrapper haInstance={haInstance}>
      <HACleanupInner />
    </HassConnectWrapper>
  );
}
