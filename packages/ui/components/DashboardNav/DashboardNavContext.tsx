"use client";

import {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from "react";

export type DashboardNavConfig = {
  /** Build an href for a dashboard page slug. */
  hrefForSlug: (slug: string) => string;
  /** Current path used for active-link highlighting. */
  pathname: string;
};

const defaultNav: DashboardNavConfig = {
  hrefForSlug: (slug) => `/dashboard/${slug}`,
  pathname: "",
};

const DashboardNavContext = createContext<DashboardNavConfig>(defaultNav);

export function DashboardNavProvider({
  hrefForSlug,
  pathname,
  children,
}: DashboardNavConfig & { children: ReactNode }) {
  const value = useMemo(
    () => ({ hrefForSlug, pathname }),
    [hrefForSlug, pathname]
  );
  return (
    <DashboardNavContext.Provider value={value}>
      {children}
    </DashboardNavContext.Provider>
  );
}

export function useDashboardNav(): DashboardNavConfig {
  return useContext(DashboardNavContext);
}
