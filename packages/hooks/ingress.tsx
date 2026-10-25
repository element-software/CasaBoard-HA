"use client";

import {
  createContext,
  useCallback,
  useContext,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  stripIngressPrefix,
  withIngressPath,
} from "@repo/lib/ingress/path";

const IngressContext = createContext("");

export function IngressProvider({
  prefix,
  children,
}: {
  prefix: string;
  children: ReactNode;
}) {
  return (
    <IngressContext.Provider value={prefix}>{children}</IngressContext.Provider>
  );
}

export function useIngressPrefix(): string {
  return useContext(IngressContext);
}

export function useAppHref(path: string): string {
  return withIngressPath(useIngressPrefix(), path);
}

/** Browser pathname with any ingress prefix removed for route matching. */
export function useAppPathname(): string {
  const pathname = usePathname() ?? "/";
  return stripIngressPrefix(useIngressPrefix(), pathname);
}

/** next/navigation push/replace with ingress prefix applied. */
export function useAppRouter() {
  const router = useRouter();
  const prefix = useIngressPrefix();

  const push = useCallback(
    (path: string) => router.push(withIngressPath(prefix, path)),
    [prefix, router]
  );

  const replace = useCallback(
    (path: string) => router.replace(withIngressPath(prefix, path)),
    [prefix, router]
  );

  const refresh = useCallback(() => router.refresh(), [router]);

  return { push, replace, refresh, router };
}
