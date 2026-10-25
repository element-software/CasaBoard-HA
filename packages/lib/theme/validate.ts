import { THEME_TOKEN_KEYS, type ThemeTokens } from "@repo/types/theme";

const ALLOWED_KEYS = new Set<string>(THEME_TOKEN_KEYS);

const HEX = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$/;
const RGB =
  /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(,\s*[\d.]+\s*)?\)$/;
const HSL =
  /^hsla?\(\s*\d+\s*,\s*[\d.]+%\s*,\s*[\d.]+%\s*(,\s*[\d.]+\s*)?\)$/;

export function isValidColorValue(value: string): boolean {
  const v = value.trim();
  if (!v) return false;
  return HEX.test(v) || RGB.test(v) || HSL.test(v);
}

/** Whitelist keys and valid colors; drops unknown keys. */
export function sanitizeThemeTokens(input: unknown): ThemeTokens {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }
  const out: ThemeTokens = {};
  for (const [k, val] of Object.entries(input as Record<string, unknown>)) {
    if (!ALLOWED_KEYS.has(k)) continue;
    if (typeof val !== "string") continue;
    if (!isValidColorValue(val)) continue;
    (out as Record<string, string>)[k] = val.trim();
  }
  return out;
}

export function assertThemeTokenKeys(tokens: ThemeTokens): void {
  for (const k of Object.keys(tokens)) {
    if (!ALLOWED_KEYS.has(k)) {
      throw new Error(`Unknown theme token: ${k}`);
    }
    const v = tokens[k as keyof ThemeTokens];
    if (v !== undefined && !isValidColorValue(v)) {
      throw new Error(`Invalid color for ${k}`);
    }
  }
}
