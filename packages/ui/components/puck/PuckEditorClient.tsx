"use client";

import type { CSSProperties } from "react";
import { Puck, Data } from "@measured/puck";
import { PuckConfig } from "./puck.config";
import { useEffect, useMemo, useState, useTransition } from "react";
import {
  Button,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Input,
  Link,
  Textarea,
} from "@heroui/react";
import "@measured/puck/puck.css";
import "./puck-editor-theme.css";
import { useAppRouter } from "@repo/hooks";
import { AppLink } from "../Shared/AppLink";
import { countPuckDataWidgets } from "@repo/lib/puck/countPuckDataWidgets";
import {
  clientLogger,
  mergeThemeLayers,
  resolvedTokensToCssVars,
} from "@repo/lib";
import type { ThemeTokens } from "@repo/types/theme";
import {
  STYLE_PRESETS,
  DEFAULT_STYLE_ID,
  type StyleId,
} from "@repo/types/style";
import { ThemeScope } from "../ThemeScope/ThemeScope";

type ThemePickerOption = { id: string; name: string };
type ThemeLibraryEntry = { id: string; tokens: ThemeTokens };

type PuckEditorClientProps = {
  type: "page" | "sidebar";
  initialData?: Data;
  itemId?: string | null;
  sidebars?: { id: string; name: string; slug: string }[];
  initialSlug?: string;
  maxItemsPerDashboard?: number;
  themePickerThemes?: ThemePickerOption[];
  themeLibrary?: ThemeLibraryEntry[];
  initialThemeId?: string | null;
  initialThemeOverrides?: ThemeTokens | null;
  initialStyleId?: StyleId | null;
  onCreateItem: (data: {
    name: string;
    slug: string;
    puck_data: Data;
    [key: string]: unknown;
  }) => Promise<{ id: string; slug: string }>;
  onUpdateItem: (
    slug: string,
    data: { name?: string; slug?: string; puck_data?: Data; [key: string]: unknown }
  ) => Promise<{ id: string; slug: string } | unknown>;
  editUrlTemplate: string;
  viewUrlTemplate?: string;
  backUrl: string;
};

function parseThemeOverridesJson(json: string): ThemeTokens | null {
  const raw = json.trim();
  if (!raw) return null;
  const parsed = JSON.parse(raw) as unknown;
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    Array.isArray(parsed)
  ) {
    throw new Error("Theme overrides must be a JSON object");
  }
  if (Object.keys(parsed).length === 0) return null;
  return parsed as ThemeTokens;
}

export default function PuckEditorClient({
  type,
  initialData,
  itemId,
  sidebars = [],
  initialSlug,
  maxItemsPerDashboard = -1,
  themePickerThemes = [],
  themeLibrary = [],
  initialThemeId = null,
  initialThemeOverrides = null,
  initialStyleId = null,
  onCreateItem,
  onUpdateItem,
  editUrlTemplate,
  viewUrlTemplate,
  backUrl,
}: PuckEditorClientProps) {
  const [data, setData] = useState<Data>(
    initialData || { content: [], root: { props: {} } }
  );
  const [lastSavedJson, setLastSavedJson] = useState<string>(
    JSON.stringify(initialData || { content: [], root: { props: {} } })
  );
  const [currentItemId, setCurrentItemId] = useState<string | null>(
    itemId || null
  );
  const [savedSlug, setSavedSlug] = useState<string | null>(initialSlug || null);
  const [isSavePending, startSaveTransition] = useTransition();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isApplyingSettings, setIsApplyingSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<{
    title: string;
    slug: string;
    sidebarId?: string | null;
    themeId: string | null;
    themeOverridesJson: string;
    styleId: StyleId;
  }>(() => {
    const props = (initialData?.root?.props as Record<string, unknown>) || {};
    return {
      title:
        (props.title as string) ||
        `New ${type === "page" ? "Page" : "Sidebar"}`,
      slug: initialSlug || (props.slug as string) || `new-${type}`,
      sidebarId: (props.sidebarId as string | null) || null,
      themeId: initialThemeId ?? null,
      themeOverridesJson: JSON.stringify(initialThemeOverrides ?? {}, null, 2),
      styleId: initialStyleId ?? DEFAULT_STYLE_ID,
    };
  });

  const { push, replace, refresh } = useAppRouter();

  const editorThemeStyle = useMemo((): CSSProperties => {
    const layerFromLibrary = settings.themeId
      ? themeLibrary.find((t) => t.id === settings.themeId)?.tokens ?? {}
      : {};
    let overrides: ThemeTokens = {};
    if (type === "page") {
      try {
        const parsed = parseThemeOverridesJson(settings.themeOverridesJson);
        if (parsed) overrides = parsed;
      } catch {
        // Invalid JSON while typing — preview uses library / defaults only
      }
    }
    const resolved = mergeThemeLayers(layerFromLibrary, overrides);
    return resolvedTokensToCssVars(resolved);
  }, [
    settings.themeId,
    settings.themeOverridesJson,
    themeLibrary,
    type,
  ]);

  const editorStyleVars = useMemo((): CSSProperties => {
    const preset = STYLE_PRESETS[settings.styleId] ?? STYLE_PRESETS[DEFAULT_STYLE_ID];
    const vars: Record<string, string> = {};
    for (const [key, value] of Object.entries(preset.tokens)) {
      vars[`--style-${key}`] = value;
    }
    return vars as CSSProperties;
  }, [settings.styleId]);

  useEffect(() => {
    if (!currentItemId) {
      setIsSettingsOpen(true);
    }
  }, [currentItemId]);

  const generateSlug = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/(^-|-$)/g, "")
      .trim();

  const resolveSlug = (slug: string, title: string) => {
    const fromSlug = generateSlug(slug);
    if (fromSlug) return fromSlug;
    const fromTitle = generateSlug(title);
    if (fromTitle) return fromTitle;
    throw new Error("Slug is required");
  };

  const isDirty = useMemo(() => {
    try {
      return JSON.stringify(data) !== lastSavedJson;
    } catch {
      return true;
    }
  }, [data, lastSavedJson]);

  const itemCount = useMemo(() => countPuckDataWidgets(data), [data]);
  const isAtLimit =
    maxItemsPerDashboard !== -1 && itemCount >= maxItemsPerDashboard;
  const isNearLimit =
    maxItemsPerDashboard !== -1 &&
    !isAtLimit &&
    itemCount >= Math.max(0, maxItemsPerDashboard - 3);

  const getItemLimitError = (): string | null => {
    if (maxItemsPerDashboard !== -1 && itemCount > maxItemsPerDashboard) {
      return `This dashboard has ${itemCount} items but your plan allows a maximum of ${maxItemsPerDashboard}. Please remove some items before saving.`;
    }
    return null;
  };

  const buildThemePayload = (): {
    theme_id: string | null;
    theme_overrides?: ThemeTokens | null;
    style_id: StyleId;
  } => {
    if (type === "page") {
      const theme_overrides = parseThemeOverridesJson(
        settings.themeOverridesJson
      );
      return {
        theme_id: settings.themeId || null,
        theme_overrides,
        style_id: settings.styleId,
      };
    }
    return { theme_id: settings.themeId || null, style_id: settings.styleId };
  };

  const saveItem = async () => {
    setError(null);
    const limitError = getItemLimitError();
    if (limitError) {
      setError(limitError);
      return;
    }
    try {
      let themePayload: ReturnType<typeof buildThemePayload>;
      try {
        themePayload = buildThemePayload();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Invalid theme overrides JSON"
        );
        return;
      }
      const nextSlug = resolveSlug(settings.slug, settings.title);
      const createData = {
        name: settings.title,
        slug: nextSlug,
        puck_data: data,
        ...(sidebars.length > 0 && { sidebar_id: settings.sidebarId }),
        ...themePayload,
      };

      const result = await onCreateItem(createData);
      setCurrentItemId(result.id);
      setSavedSlug(result.slug);
      setSettings((prev) => ({ ...prev, slug: result.slug }));
      setLastSavedJson(JSON.stringify(data));
      clientLogger.info(
        "PuckEditorClient",
        `${type} created successfully`,
        result
      );
      push(editUrlTemplate.replace("{slug}", result.slug));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to save";
      setError(errorMessage);
      clientLogger.error("PuckEditorClient", "Save failed", err);
    }
  };

  const updateItem = async () => {
    setError(null);
    const limitError = getItemLimitError();
    if (limitError) {
      setError(limitError);
      return;
    }
    try {
      let themePayload: ReturnType<typeof buildThemePayload>;
      try {
        themePayload = buildThemePayload();
      } catch (e) {
        setError(
          e instanceof Error ? e.message : "Invalid theme overrides JSON"
        );
        return;
      }
      const nextSlug = resolveSlug(settings.slug, settings.title);
      const updateData = {
        name: settings.title,
        slug: nextSlug,
        puck_data: data,
        ...(sidebars.length > 0 && { sidebar_id: settings.sidebarId }),
        ...themePayload,
      };

      const slugToUse = savedSlug || settings.slug;
      const result = await onUpdateItem(slugToUse, updateData);
      const resultSlug =
        result &&
        typeof result === "object" &&
        "slug" in result &&
        typeof result.slug === "string"
          ? result.slug
          : nextSlug;
      setSettings((prev) => ({ ...prev, slug: resultSlug }));
      setLastSavedJson(JSON.stringify(data));
      if (savedSlug && resultSlug !== savedSlug) {
        setSavedSlug(resultSlug);
        replace(editUrlTemplate.replace("{slug}", resultSlug));
      } else {
        setSavedSlug(resultSlug);
      }
      clientLogger.info("PuckEditorClient", `${type} updated successfully`);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update";
      setError(errorMessage);
      clientLogger.error("PuckEditorClient", "Update failed", err);
    }
  };

  const applySettings = async () => {
    setError(null);
    let nextSlug: string;
    try {
      nextSlug = resolveSlug(settings.slug, settings.title);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Slug is required");
      return;
    }

    if (currentItemId) {
      setIsApplyingSettings(true);
      try {
        const themePayload = buildThemePayload();
        const slugToUse = savedSlug || settings.slug;
        const patch: Record<string, unknown> = {
          name: settings.title,
          slug: nextSlug,
          ...themePayload,
        };
        if (type === "page" && sidebars.length > 0) {
          patch.sidebar_id = settings.sidebarId;
        }
        const result = await onUpdateItem(slugToUse, patch);
        const resultSlug =
          result &&
          typeof result === "object" &&
          "slug" in result &&
          typeof result.slug === "string"
            ? result.slug
            : nextSlug;
        nextSlug = resultSlug;
        if (savedSlug && resultSlug !== savedSlug) {
          setSavedSlug(resultSlug);
          replace(editUrlTemplate.replace("{slug}", resultSlug));
        } else {
          setSavedSlug(resultSlug);
          refresh();
        }
        clientLogger.info("PuckEditorClient", "Settings (incl. theme) saved");
      } catch (e) {
        const msg =
          e instanceof Error ? e.message : "Failed to save settings to server";
        setError(msg);
        clientLogger.error("PuckEditorClient", "applySettings save failed", e);
        return;
      } finally {
        setIsApplyingSettings(false);
      }
    }

    setSettings((prev) => ({ ...prev, slug: nextSlug }));

    setData((prev) => ({
      ...prev,
      root: {
        ...prev.root,
        props: {
          ...prev.root.props,
          title: settings.title,
          slug: nextSlug,
          sidebarId: settings.sidebarId,
        },
      },
    }));
    setIsSettingsOpen(false);
  };

  const getHeaderTitle = () => {
    return `${type} Editor - ${data.root.props?.title || settings.title}`;
  };

  const getHeaderPath = () => {
    return data.root.title || settings.slug;
  };

  return (
    <div className="h-screen flex flex-col">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-4 shrink-0">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      <ThemeScope
        className="flex-1 min-h-0 flex flex-col bg-theme-page-background text-theme-text"
        style={editorThemeStyle}
        styleVars={editorStyleVars}
        styleId={settings.styleId}
      >
        <Puck
          config={PuckConfig}
          data={data}
          onPublish={saveItem}
          onChange={setData}
          headerTitle={getHeaderTitle()}
          headerPath={getHeaderPath()}
          iframe={{ enabled: false }}
          overrides={{
          headerActions: () => {
            const rightLabel = !currentItemId ? "Create" : "Save";
            const rightHandler = () => {
              startSaveTransition(async () => {
                if (!currentItemId) {
                  await saveItem();
                } else {
                  await updateItem();
                }
              });
            };

            return (
              <div className="flex items-center gap-2">
                {maxItemsPerDashboard !== -1 && (
                  <Chip
                    size="sm"
                    color={
                      isAtLimit
                        ? "danger"
                        : isNearLimit
                          ? "warning"
                          : "default"
                    }
                    variant="flat"
                  >
                    {itemCount}/{maxItemsPerDashboard} items
                  </Chip>
                )}
                {viewUrlTemplate && savedSlug && (
                  <Link
                    href={viewUrlTemplate.replace("{slug}", savedSlug)}
                    size="sm"
                    color="secondary"
                    target="_blank"
                  >
                    View {type}
                  </Link>
                )}
                <Button
                  size="sm"
                  variant="bordered"
                  color="secondary"
                  onPress={() => push(backUrl)}
                >
                  Back to {type}s
                </Button>
                <Button
                  size="sm"
                  variant="bordered"
                  color="secondary"
                  onPress={() => setIsSettingsOpen(true)}
                >
                  Settings
                </Button>
                <Button
                  size="sm"
                  color="primary"
                  onPress={rightHandler}
                  isLoading={isSavePending}
                  isDisabled={Boolean(currentItemId) && !isDirty}
                >
                  {rightLabel}
                </Button>
              </div>
            );
          },
        }}
        />
      </ThemeScope>

      <Modal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>{type} Settings</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <Input
                label="Name"
                placeholder={`Enter ${type} name`}
                value={settings.title}
                onChange={(e) => {
                  const title = e.target.value;
                  setSettings((prev) => {
                    const shouldSyncSlug =
                      !currentItemId &&
                      prev.slug === generateSlug(prev.title);
                    return {
                      ...prev,
                      title,
                      slug: shouldSyncSlug ? generateSlug(title) : prev.slug,
                    };
                  });
                }}
              />
              <Input
                label="Slug"
                placeholder={`${type}-slug`}
                value={settings.slug}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, slug: e.target.value }))
                }
                description="URL-friendly identifier used in links. Changing it updates the URL."
              />
              {type === "page" && sidebars.length > 0 && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    Sidebar (Optional)
                  </label>
                  <select
                    className="w-full p-2 border border-gray-300 rounded-md"
                    value={settings.sidebarId || ""}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        sidebarId: e.target.value || null,
                      }))
                    }
                  >
                    <option value="">No sidebar</option>
                    {sidebars.map((sidebar) => (
                      <option key={sidebar.id} value={sidebar.id}>
                        {sidebar.name} ({sidebar.slug})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <label className="block text-sm font-medium">Theme</label>
                  <AppLink href="/setup/themes" className="text-sm">
                    Manage themes
                  </AppLink>
                </div>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={settings.themeId || ""}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      themeId: e.target.value || null,
                    }))
                  }
                >
                  <option value="">Default (built-in dark)</option>
                  {themePickerThemes.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  {type === "sidebar"
                    ? "Optional. Leave default to use the page theme when this sidebar is shown with a page."
                    : "Optional library theme for this page."}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Style</label>
                <select
                  className="w-full p-2 border border-gray-300 rounded-md"
                  value={settings.styleId}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      styleId: e.target.value as StyleId,
                    }))
                  }
                >
                  {Object.values(STYLE_PRESETS).map((preset) => (
                    <option key={preset.id} value={preset.id}>
                      {preset.name}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Controls the shape/chrome of components (radius, shadow,
                  icon layout) — independent of the color Theme above.
                </p>
              </div>
              {type === "page" && (
                <Textarea
                  label="Per-page color overrides (JSON)"
                  placeholder='{ "primary": "#7c3aed", "entity-on": "#22c55e" }'
                  value={settings.themeOverridesJson}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      themeOverridesJson: e.target.value,
                    }))
                  }
                  minRows={4}
                  description="Optional. Keys match theme token names (without --theme-). Invalid JSON will block save."
                />
              )}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={() => setIsSettingsOpen(false)}>
              Cancel
            </Button>
            <Button
              color="primary"
              isLoading={isApplyingSettings}
              onPress={() => {
                void applySettings();
              }}
            >
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
