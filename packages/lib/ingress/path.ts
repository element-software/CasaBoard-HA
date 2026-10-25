export const INGRESS_HEADER = "x-ingress-path";
export const INGRESS_COOKIE = "casaboard-ingress-path";

/** Normalize HA ingress prefix (no trailing slash; empty when at root). */
export function normalizeIngressPrefix(raw: string | null | undefined): string {
  if (!raw) return "";
  const trimmed = raw.trim();
  if (!trimmed || trimmed === "/") return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

/** Strip a known ingress prefix from the browser pathname. */
export function stripIngressPrefix(prefix: string, path: string): string {
  const normalizedPrefix = normalizeIngressPrefix(prefix);
  if (!normalizedPrefix) return path;
  if (path === normalizedPrefix) return "/";
  if (path.startsWith(`${normalizedPrefix}/`)) {
    const stripped = path.slice(normalizedPrefix.length);
    return stripped.startsWith("/") ? stripped : `/${stripped}`;
  }
  return path;
}

/** Prefix an app-relative path with the ingress base when present. */
export function withIngressPath(prefix: string, path: string): string {
  const normalizedPrefix = normalizeIngressPrefix(prefix);
  if (!normalizedPrefix) return path;
  if (path === normalizedPrefix || path.startsWith(`${normalizedPrefix}/`)) {
    return path;
  }
  if (!path.startsWith("/")) {
    return `${normalizedPrefix}/${path}`;
  }
  return `${normalizedPrefix}${path}`;
}
