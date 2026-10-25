"use client";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SettingsActions } from "@repo/lib";
import type { ImportMode } from "@repo/lib";
import type { ImportDiff, ImportDiffEntry } from "@repo/types/settingsBundle";
import { Button, Card, CardBody, CardHeader, Chip, Radio, RadioGroup, Spinner } from "@heroui/react";
import Icon from "@mdi/react";
import {
  mdiTrayArrowDown,
  mdiTrayArrowUp,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiFileDocumentOutline,
  mdiShieldLockOutline,
} from "@mdi/js";

interface SettingsCounts {
  pages: number;
  sidebars: number;
  themes: number;
}

interface PendingImport {
  fileName: string;
  bundle: unknown;
  exportedAt: string | null;
  counts: SettingsCounts;
}

interface SettingsBackupProps {
  initialCounts: SettingsCounts;
}

const DIFF_SECTIONS: { key: keyof ImportDiff; label: string }[] = [
  { key: "pages", label: "Pages" },
  { key: "sidebars", label: "Sidebars" },
  { key: "themes", label: "Themes" },
];

const STATUS_ORDER: ImportDiffEntry["status"][] = ["added", "updated", "removed"];

const STATUS_STYLE: Record<ImportDiffEntry["status"], { color: "success" | "warning" | "danger" | "default"; label: string }> = {
  added: { color: "success", label: "Add" },
  updated: { color: "warning", label: "Update" },
  removed: { color: "danger", label: "Remove" },
  unchanged: { color: "default", label: "Unchanged" },
};

function diffTotals(diff: ImportDiff) {
  const all = [...diff.pages, ...diff.sidebars, ...diff.themes];
  return {
    added: all.filter((e) => e.status === "added").length,
    updated: all.filter((e) => e.status === "updated").length,
    removed: all.filter((e) => e.status === "removed").length,
    unchanged: all.filter((e) => e.status === "unchanged").length,
  };
}

function summarize(bundle: unknown): { exportedAt: string | null; counts: SettingsCounts } {
  const b = (bundle ?? {}) as Record<string, unknown>;
  const asArray = (v: unknown) => (Array.isArray(v) ? v.length : 0);
  return {
    exportedAt: typeof b.exported_at === "string" ? b.exported_at : null,
    counts: {
      pages: asArray(b.pages),
      sidebars: asArray(b.sidebars),
      themes: asArray(b.themes),
    },
  };
}

function formatDate(iso: string | null): string {
  if (!iso) return "an unknown date";
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}

function countsLabel(counts: SettingsCounts): string {
  return `${counts.pages} page${counts.pages === 1 ? "" : "s"}, ${counts.sidebars} sidebar${counts.sidebars === 1 ? "" : "s"}, ${counts.themes} theme${counts.themes === 1 ? "" : "s"}`;
}

export const SettingsBackup = ({ initialCounts }: SettingsBackupProps) => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<{ type: "error" | "success"; text: string } | null>(null);
  const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);
  const [importMode, setImportMode] = useState<ImportMode>("merge");
  const [diff, setDiff] = useState<ImportDiff | null>(null);
  const [isDiffing, setIsDiffing] = useState(false);

  const loadDiff = (bundle: unknown, mode: ImportMode) => {
    setIsDiffing(true);
    SettingsActions.previewImport(bundle, mode)
      .then(setDiff)
      .catch((err) => {
        setDiff(null);
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to compare settings" });
      })
      .finally(() => setIsDiffing(false));
  };

  const handleExport = () => {
    startTransition(async () => {
      try {
        setMessage(null);
        const bundle = await SettingsActions.exportSettings();
        const blob = new Blob([JSON.stringify(bundle, null, 2)], {
          type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `casaboard-settings-${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        setMessage({
          type: "success",
          text: `Downloaded a backup of ${countsLabel(initialCounts)}.`,
        });
      } catch (err) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to export settings" });
      }
    });
  };

  const handleChooseFile = () => fileInputRef.current?.click();

  const handleFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setMessage(null);
    setPendingImport(null);
    setDiff(null);

    file
      .text()
      .then((text) => {
        let bundle: unknown;
        try {
          bundle = JSON.parse(text);
        } catch {
          throw new Error(`"${file.name}" is not valid JSON`);
        }
        const { exportedAt, counts } = summarize(bundle);
        if (counts.pages + counts.sidebars + counts.themes === 0) {
          throw new Error(`"${file.name}" doesn't look like a CasaBoard settings file`);
        }
        setImportMode("merge");
        setPendingImport({ fileName: file.name, bundle, exportedAt, counts });
        loadDiff(bundle, "merge");
      })
      .catch((err) => {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to read file" });
      });
  };

  const handleModeChange = (mode: ImportMode) => {
    setImportMode(mode);
    if (pendingImport) loadDiff(pendingImport.bundle, mode);
  };

  const handleCancelImport = () => {
    setPendingImport(null);
    setDiff(null);
  };

  const handleConfirmImport = () => {
    if (!pendingImport) return;
    const { bundle, counts } = pendingImport;

    startTransition(async () => {
      try {
        await SettingsActions.importSettings(bundle, importMode);
        setMessage({
          type: "success",
          text:
            importMode === "replace"
              ? `Replaced your settings with ${countsLabel(counts)}.`
              : `Merged in ${countsLabel(counts)}. Anything not in the file was left alone.`,
        });
        setPendingImport(null);
        setDiff(null);
        router.refresh();
      } catch (err) {
        setMessage({ type: "error", text: err instanceof Error ? err.message : "Failed to import settings" });
      }
    });
  };

  return (
    <div className="flex flex-col gap-6">
      {message && (
        <div
          className={`flex items-center gap-2 rounded-xl px-4 py-3 text-sm ${
            message.type === "error"
              ? "bg-danger-50 text-danger"
              : "bg-success-50 text-success"
          }`}
        >
          <Icon path={message.type === "error" ? mdiAlertCircle : mdiCheckCircle} className="w-4 h-4 flex-shrink-0" />
          {message.text}
        </div>
      )}

      {/* Export */}
      <Card className="bg-content1">
        <CardHeader className="flex flex-col items-start gap-1">
          <h2 className="text-base font-semibold text-theme-text">Export settings</h2>
          <p className="text-sm text-theme-text-secondary">
            Download every page, sidebar, and theme as one JSON file — a snapshot you can restore later or move to another CasaBoard install.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip size="sm" variant="flat">{initialCounts.pages} pages</Chip>
            <Chip size="sm" variant="flat">{initialCounts.sidebars} sidebars</Chip>
            <Chip size="sm" variant="flat">{initialCounts.themes} themes</Chip>
          </div>
          <div className="flex items-center gap-2 text-xs text-theme-text-secondary">
            <Icon path={mdiShieldLockOutline} className="w-4 h-4 flex-shrink-0" />
            Your Home Assistant URL and login are never included in the file.
          </div>
          <div>
            <Button
              color="primary"
              startContent={<Icon path={mdiTrayArrowDown} className="w-4 h-4" />}
              onPress={handleExport}
              isLoading={isPending}
            >
              Download backup
            </Button>
          </div>
        </CardBody>
      </Card>

      {/* Import */}
      <Card className="bg-content1">
        <CardHeader className="flex flex-col items-start gap-1">
          <h2 className="text-base font-semibold text-theme-text">Import settings</h2>
          <p className="text-sm text-theme-text-secondary">
            Restore from a CasaBoard export. Pick the file first — you'll get a chance to review what's in it and choose how it's applied before anything changes.
          </p>
        </CardHeader>
        <CardBody className="gap-4">
          {!pendingImport ? (
            <div>
              <Button
                variant="bordered"
                startContent={<Icon path={mdiTrayArrowUp} className="w-4 h-4" />}
                onPress={handleChooseFile}
                isDisabled={isPending}
              >
                Choose file…
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleFileSelected}
              />
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-start gap-3 rounded-xl border border-theme-border bg-theme-surface px-4 py-3">
                <Icon path={mdiFileDocumentOutline} className="w-5 h-5 flex-shrink-0 text-theme-text-secondary mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-theme-text">{pendingImport.fileName}</p>
                  <p className="text-theme-text-secondary">
                    Exported {formatDate(pendingImport.exportedAt)} · contains {countsLabel(pendingImport.counts)}
                  </p>
                </div>
              </div>

              <RadioGroup
                label="How should this be applied?"
                value={importMode}
                onValueChange={(v) => handleModeChange(v as ImportMode)}
                classNames={{ label: "text-sm text-theme-text" }}
              >
                <Radio value="merge" description="Add or update pages, sidebars, and themes from the file. Anything you have that isn't in the file is left untouched.">
                  Merge into current settings
                </Radio>
                <Radio value="replace" description="Delete all current pages, sidebars, and themes and replace them with exactly what's in the file.">
                  Replace everything
                </Radio>
              </RadioGroup>

              {importMode === "replace" && (
                <div className="flex items-center gap-2 text-sm text-danger">
                  <Icon path={mdiAlertCircle} className="w-4 h-4 flex-shrink-0" />
                  This deletes anything not in the file. This can't be undone.
                </div>
              )}

              <ImportDiffView diff={diff} isLoading={isDiffing} />

              <div className="flex gap-3">
                <Button
                  color={importMode === "replace" ? "danger" : "primary"}
                  onPress={handleConfirmImport}
                  isLoading={isPending}
                  isDisabled={isDiffing}
                >
                  {importMode === "replace" ? "Replace everything" : "Merge settings"}
                </Button>
                <Button variant="light" onPress={handleCancelImport} isDisabled={isPending}>
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
};

function ImportDiffView({ diff, isLoading }: { diff: ImportDiff | null; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-theme-text-secondary py-2">
        <Spinner size="sm" /> Comparing against your current settings…
      </div>
    );
  }

  if (!diff) return null;

  const totals = diffTotals(diff);
  const hasChanges = totals.added + totals.updated + totals.removed > 0;

  return (
    <div className="rounded-xl border border-theme-border px-4 py-3 flex flex-col gap-3">
      <p className="text-sm font-medium text-theme-text">
        {hasChanges
          ? `${totals.added} to add, ${totals.updated} to update, ${totals.removed} to remove`
          : "No changes — this file matches what you already have."}
        {totals.unchanged > 0 && (
          <span className="text-theme-text-secondary font-normal"> ({totals.unchanged} unchanged)</span>
        )}
      </p>

      {hasChanges && (
        <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
          {DIFF_SECTIONS.map(({ key, label }) => {
            const changed = diff[key]
              .filter((e) => e.status !== "unchanged")
              .sort((a, b) => STATUS_ORDER.indexOf(a.status) - STATUS_ORDER.indexOf(b.status));
            if (changed.length === 0) return null;
            return (
              <div key={key}>
                <p className="text-xs font-semibold uppercase tracking-wide text-theme-text-secondary mb-1">
                  {label}
                </p>
                <ul className="flex flex-col gap-1">
                  {changed.map((entry) => (
                    <li key={entry.key} className="flex items-center gap-2 text-sm">
                      <Chip size="sm" variant="flat" color={STATUS_STYLE[entry.status].color}>
                        {STATUS_STYLE[entry.status].label}
                      </Chip>
                      <span className="text-theme-text truncate">{entry.name}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
