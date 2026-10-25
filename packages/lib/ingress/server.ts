import { cookies, headers } from "next/headers";
import {
  INGRESS_COOKIE,
  INGRESS_HEADER,
  normalizeIngressPrefix,
  withIngressPath,
} from "./path";

export async function getIngressPrefix(): Promise<string> {
  const headerStore = await headers();
  const fromHeader = headerStore.get(INGRESS_HEADER);
  if (fromHeader) {
    return normalizeIngressPrefix(fromHeader);
  }

  const cookieStore = await cookies();
  return normalizeIngressPrefix(cookieStore.get(INGRESS_COOKIE)?.value);
}

export async function withIngressRedirectPath(path: string): Promise<string> {
  const prefix = await getIngressPrefix();
  return withIngressPath(prefix, path);
}
