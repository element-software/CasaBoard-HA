/** Keys map to CSS variables: background -> --theme-background */

export const THEME_TOKEN_KEYS = [
  "page-background",
  "background",
  "surface",
  "elevated",
  "border",
  "divider",
  "text",
  "text-primary",
  "text-secondary",
  "text-muted",
  "text-on-primary",
  "text-on",
  "primary",
  "secondary",
  "accent",
  "success",
  "warning",
  "error",
  "info",
  "card-background",
  "card-border",
  "card-hover",
  "entity-on",
  "entity-off",
  "entity-on-muted",
  "entity-off-muted",
  "entity-unavailable",
  "entity-unknown",
  "alarm-armed",
  "alarm-disarmed",
  "alarm-triggered",
  "button-primary",
  "button-secondary",
  "button-success",
  "button-warning",
  "button-error",
  "slider-track",
  "slider-thumb",
  "slider-active",
  "interactive-hover",
  "interactive-active",
  "interactive-inactive",
  "focus-ring",
  "disabled-foreground",
  "disabled-background",
  "chart-line",
  "chart-fill",
  "chart-grid",
] as const;

export type ThemeTokenKey = (typeof THEME_TOKEN_KEYS)[number];

export type ThemeTokens = Partial<Record<ThemeTokenKey, string>>;

export type ResolvedThemeTokens = Record<ThemeTokenKey, string>;

/** HomeKit Gold baseline — iOS light surfaces + warm gold light on-state. */
export const DEFAULT_LIGHT_THEME_TOKENS: ResolvedThemeTokens = {
  "page-background": "#f2f2f7",
  background: "#f2f2f7",
  surface: "#ffffff",
  elevated: "#ffffff",
  border: "#e5e5ea",
  divider: "#e5e5ea",
  text: "#1c1c1e",
  "text-primary": "#f2c94c",
  "text-secondary": "#8e8e93",
  "text-muted": "#aeaeb2",
  "text-on-primary": "#ffffff",
  "text-on": "#ffffff",
  primary: "#f2c94c",
  secondary: "#e6b93d",
  accent: "#f2c94c",
  success: "#34c759",
  warning: "#ff9f0a",
  error: "#ff3b30",
  info: "#007aff",
  "card-background": "#ffffff",
  "card-border": "#e5e5ea",
  "card-hover": "#f9f9fb",
  "entity-on": "#f2c94c",
  "entity-off": "#ffffff",
  "entity-on-muted": "#e6b93d",
  "entity-off-muted": "#e5e5ea",
  "entity-unavailable": "#ff3b30",
  "entity-unknown": "#8e8e93",
  "alarm-armed": "#ff9f0a",
  "alarm-disarmed": "#34c759",
  "alarm-triggered": "#ff3b30",
  "button-primary": "#f2c94c",
  "button-secondary": "#efeef0",
  "button-success": "#34c759",
  "button-warning": "#ff9f0a",
  "button-error": "#ff3b30",
  "slider-track": "#e5e5ea",
  "slider-thumb": "#f2c94c",
  "slider-active": "#f2c94c",
  "interactive-hover": "#e5e5ea",
  "interactive-active": "#1c1c1e",
  "interactive-inactive": "#f2f2f7",
  "focus-ring": "#007aff",
  "disabled-foreground": "#aeaeb2",
  "disabled-background": "#f2f2f7",
  "chart-line": "#f2c94c",
  "chart-fill": "#f2c94c",
  "chart-grid": "#e5e5ea",
};

/** Historical dark purple tokens — available for custom themes. */
export const DEFAULT_DARK_THEME_TOKENS: ResolvedThemeTokens = {
  "page-background": "#111827",
  background: "#111827",
  surface: "#120a1f",
  elevated: "#1e0c35",
  border: "#bb37fc",
  divider: "#1e0c35",
  text: "#f9fafb",
  "text-primary": "#8b5cf6",
  "text-secondary": "#a3a3a3",
  "text-muted": "#6b7280",
  "text-on-primary": "#ffffff",
  "text-on": "#ffffff",
  primary: "#8b5cf6",
  secondary: "#333dfe",
  accent: "#bb37fc",
  success: "#10b981",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#3b82f6",
  "card-background": "#120a1f",
  "card-border": "#1e0c35",
  "card-hover": "#1e0c35",
  "entity-on": "#8b5cf6",
  "entity-off": "#1e0c35",
  "entity-on-muted": "#5b21b6",
  "entity-off-muted": "#374151",
  "entity-unavailable": "#ef4444",
  "entity-unknown": "#8b5cf6",
  "alarm-armed": "#7c3aed",
  "alarm-disarmed": "#374151",
  "alarm-triggered": "#ef4444",
  "button-primary": "#8b5cf6",
  "button-secondary": "#1e0c35",
  "button-success": "#8b5cf6",
  "button-warning": "#8b5cf6",
  "button-error": "#ef4444",
  "slider-track": "#1e0c35",
  "slider-thumb": "#8b5cf6",
  "slider-active": "#8b5cf6",
  "interactive-hover": "#1e0c35",
  "interactive-active": "#2d1b4e",
  "interactive-inactive": "#374151",
  "focus-ring": "#8b5cf6",
  "disabled-foreground": "#6b7280",
  "disabled-background": "#1f2937",
  "chart-line": "#8b5cf6",
  "chart-fill": "#8b5cf6",
  "chart-grid": "#374151",
};

export interface Theme {
  id: string;
  name: string;
  tokens: ThemeTokens;
  created_at: string;
  updated_at: string;
}

export interface CreateThemeInput {
  name: string;
  tokens?: ThemeTokens;
}

export interface UpdateThemeInput {
  name?: string;
  tokens?: ThemeTokens;
}

const THEME_TOKEN_LABEL_OVERRIDES: Partial<Record<ThemeTokenKey, string>> = {
  "page-background": "Page background",
  background: "Sidebar / drawers background",
  "text-on": "Light on-state text",
};

/** Human-readable label for a token in the theme editor and preview. */
export function themeTokenLabel(key: ThemeTokenKey): string {
  const override = THEME_TOKEN_LABEL_OVERRIDES[key];
  if (override) return override;
  return key
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Grouped labels for the theme editor UI */
export const THEME_EDITOR_GROUPS: {
  id: string;
  label: string;
  keys: ThemeTokenKey[];
}[] = [
  {
    id: "surfaces",
    label: "Surfaces & structure",
    keys: [
      "page-background",
      "background",
      "surface",
      "elevated",
      "border",
      "divider",
    ],
  },
  {
    id: "text",
    label: "Text",
    keys: [
      "text",
      "text-primary",
      "text-secondary",
      "text-muted",
      "text-on-primary",
    ],
  },
  {
    id: "brand",
    label: "Brand",
    keys: ["primary", "secondary", "accent"],
  },
  {
    id: "semantic",
    label: "Semantic",
    keys: ["success", "warning", "error", "info"],
  },
  {
    id: "cards",
    label: "Cards",
    keys: ["card-background", "card-border", "card-hover"],
  },
  {
    id: "interaction",
    label: "Interaction",
    keys: [
      "interactive-hover",
      "interactive-active",
      "interactive-inactive",
      "focus-ring",
      "disabled-foreground",
      "disabled-background",
    ],
  },
  {
    id: "entities",
    label: "Entity & device states",
    keys: [
      "entity-on",
      "entity-off",
      "entity-on-muted",
      "entity-off-muted",
      "entity-unavailable",
      "entity-unknown",
      "text-on",
    ],
  },
  {
    id: "alarm",
    label: "Alarm",
    keys: ["alarm-armed", "alarm-disarmed", "alarm-triggered"],
  },
  {
    id: "buttons",
    label: "Buttons",
    keys: [
      "button-primary",
      "button-secondary",
      "button-success",
      "button-warning",
      "button-error",
    ],
  },
  {
    id: "sliders",
    label: "Sliders",
    keys: ["slider-track", "slider-thumb", "slider-active"],
  },
  {
    id: "charts",
    label: "Charts",
    keys: ["chart-line", "chart-fill", "chart-grid"],
  },
];
