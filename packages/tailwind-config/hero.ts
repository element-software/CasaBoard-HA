import { heroui } from "@heroui/react";

export default heroui({
  themes: {
    light: {
      colors: {
        background: "#F9FAFB", // UI surface
        foreground: "#111827", // Text on light
        // Primary mapped to brand highlight (Violet)
        primary: {
          "50": "#f5f3ff",
          "100": "#ede9fe",
          "200": "#ddd6fe",
          "300": "#c4b5fd",
          "400": "#a78bfa",
          "500": "#8b5cf6",
          "600": "#7c3aed",
          "700": "#6d28d9",
          "800": "#5b21b6",
          "900": "#4c1d95",
          "DEFAULT": "#8B5CF6",
          foreground: "#F9FAFB"
        },
        // Secondary derived from Accent (dark purple #1e0c35)
        secondary: {
          "50": "#f5f2f8",
          "100": "#eae5f1",
          "200": "#d4cbe3",
          "300": "#b5a6cf",
          "400": "#8f7ab6",
          "500": "#6a529b",
          "600": "#4b357c",
          "700": "#35225f",
          "800": "#261647",
          "900": "#1e0c35",
          "DEFAULT": "#1e0c35",
          foreground: "#F9FAFB"
        },
        // Accent purples are represented via secondary scale; darker variant available via content backgrounds
        
        success: {
          "50": "#ecfdf5",
          "100": "#d1fae5",
          "200": "#a7f3d0",
          "300": "#6ee7b7",
          "400": "#34d399",
          "500": "#10b981",
          "600": "#059669",
          "700": "#047857",
          "800": "#065f46",
          "900": "#064e3b",
          "DEFAULT": "#10b981",
          foreground: "#ffffff"
        },
        warning: {
          "50": "#fffbeb",
          "100": "#fef3c7",
          "200": "#fde68a",
          "300": "#fcd34d",
          "400": "#fbbf24",
          "500": "#f59e0b",
          "600": "#d97706",
          "700": "#b45309",
          "800": "#92400e",
          "900": "#78350f",
          "DEFAULT": "#f59e0b",
          foreground: "#ffffff"
        },
        danger: {
          "50": "#fef2f2",
          "100": "#fee2e2",
          "200": "#fecaca",
          "300": "#fca5a5",
          "400": "#f87171",
          "500": "#ef4444",
          "600": "#dc2626",
          "700": "#b91c1c",
          "800": "#991b1b",
          "900": "#7f1d1d",
          "DEFAULT": "#ef4444",
          foreground: "#ffffff"
        }
      }
    },
    dark: {
      colors: {
        background: "#120a1f", // Deep background
        foreground: "#F9FAFB",
        primary: {
          "50": "#f5f3ff",
          "100": "#ede9fe",
          "200": "#ddd6fe",
          "300": "#c4b5fd",
          "400": "#a78bfa",
          "500": "#8b5cf6",
          "600": "#7c3aed",
          "700": "#6d28d9",
          "800": "#5b21b6",
          "900": "#4c1d95",
          "DEFAULT": "#8B5CF6",
          foreground: "#F9FAFB"
        },
        secondary: {
          "50": "#f5f2f8",
          "100": "#eae5f1",
          "200": "#d4cbe3",
          "300": "#b5a6cf",
          "400": "#8f7ab6",
          "500": "#6a529b",
          "600": "#4b357c",
          "700": "#35225f",
          "800": "#261647",
          "900": "#1e0c35",
          "DEFAULT": "#1e0c35",
          foreground: "#F9FAFB"
        },
        
        success: {
          "50": "#ecfdf5",
          "100": "#d1fae5",
          "200": "#a7f3d0",
          "300": "#6ee7b7",
          "400": "#34d399",
          "500": "#10b981",
          "600": "#059669",
          "700": "#047857",
          "800": "#065f46",
          "900": "#064e3b",
          "DEFAULT": "#10b981",
          foreground: "#ffffff"
        },
        warning: {
          "50": "#fffbeb",
          "100": "#fef3c7",
          "200": "#fde68a",
          "300": "#fcd34d",
          "400": "#fbbf24",
          "500": "#f59e0b",
          "600": "#d97706",
          "700": "#b45309",
          "800": "#92400e",
          "900": "#78350f",
          "DEFAULT": "#f59e0b",
          foreground: "#000000"
        },
        danger: {
          "50": "#fef2f2",
          "100": "#fee2e2",
          "200": "#fecaca",
          "300": "#fca5a5",
          "400": "#f87171",
          "500": "#ef4444",
          "600": "#dc2626",
          "700": "#b91c1c",
          "800": "#991b1b",
          "900": "#7f1d1d",
          "DEFAULT": "#ef4444",
          foreground: "#ffffff"
        }
      }
    }
  }
});