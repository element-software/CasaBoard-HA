"use client";
export type AppTarget = "app" | "public";

function ensureLeadingSlash(path: string): string {
  if (!path) return "/";
  return path.startsWith("/") ? path : `/${path}`;
}

export function getAppOrigin(target: AppTarget): string {
  const app = process.env.NEXT_PUBLIC_APP_ORIGIN || "http://localhost:3000";
  const pub = process.env.NEXT_PUBLIC_PUBLIC_ORIGIN || "http://localhost:3001";
  return target === "app" ? app : pub;
}

export function crossAppHref(target: AppTarget, path: string): string {
  const origin = getAppOrigin(target);
  return `${origin}${ensureLeadingSlash(path)}`;
}

/**
 * Resolve a URL to the other app based on current origin if envs are not set.
 * Useful on the client where window.location is available.
 */
export function crossAppHrefClient(target: AppTarget, path: string): string {
  try {
    const href = crossAppHref(target, path);
    return href;
  } catch {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    const fallback = target === "app" ? origin.replace("3001", "3000") : origin.replace("3000", "3001");
    return `${fallback}${ensureLeadingSlash(path)}`;
  }
}


