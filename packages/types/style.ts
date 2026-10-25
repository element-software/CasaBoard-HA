export const STYLE_IDS = ["default", "flat", "glassy", "homekit", "3d"] as const;
export type StyleId = (typeof STYLE_IDS)[number];

export const STYLE_TOKEN_KEYS = [
  "radius",
  "shell-padding",
  "shadow",
  "blur",
  "border-width",
] as const;
export type StyleTokenKey = (typeof STYLE_TOKEN_KEYS)[number];
export type ResolvedStyleTokens = Record<StyleTokenKey, string>;

export interface StylePreset {
  id: StyleId;
  name: string;
  tokens: ResolvedStyleTokens;
}

export const DEFAULT_STYLE_ID: StyleId = "homekit";

export const STYLE_PRESETS: Record<StyleId, StylePreset> = {
  default: {
    id: "default",
    name: "Default",
    tokens: {
      radius: "0.75rem",
      "shell-padding": "0.75rem",
      shadow: "none",
      blur: "0px",
      "border-width": "0px",
    },
  },
  flat: {
    id: "flat",
    name: "Flat",
    tokens: {
      radius: "0.5rem",
      "shell-padding": "0.75rem",
      shadow: "none",
      blur: "0px",
      "border-width": "1px",
    },
  },
  glassy: {
    id: "glassy",
    name: "Glassy",
    tokens: {
      radius: "1rem",
      "shell-padding": "0.875rem",
      shadow: "0 8px 24px rgba(0, 0, 0, 0.25)",
      blur: "12px",
      "border-width": "1px",
    },
  },
  homekit: {
    id: "homekit",
    name: "HomeKit",
    tokens: {
      radius: "1.75rem",
      "shell-padding": "1.125rem",
      shadow: "0 1px 3px rgba(0, 0, 0, 0.06), 0 1px 2px rgba(0, 0, 0, 0.04)",
      blur: "0px",
      "border-width": "0px",
    },
  },
  "3d": {
    id: "3d",
    name: "3D",
    tokens: {
      radius: "0.75rem",
      "shell-padding": "0.75rem",
      shadow:
        "0 8px 16px rgba(0, 0, 0, 0.35), 0 2px 4px rgba(0, 0, 0, 0.25)",
      blur: "0px",
      "border-width": "0px",
    },
  },
};
