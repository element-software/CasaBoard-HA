"use client";

import Icon from "@mdi/react";
import {
  mdiHome,
  mdiPlayBox,
  mdiCctv,
  mdiChartBar,
  mdiStairs,
  mdiCountertop,
  mdiCircle,
  mdiChevronRight,
} from "@mdi/js";
import classNames from "classnames";
import { AppLink } from "../Shared/AppLink";
import { useDashboardNav } from "../DashboardNav/DashboardNavContext";

export type SidebarNavItem = {
  label: string;
  pageSlug: string;
  icon?: string;
};

export type SidebarNavProps = {
  items?: SidebarNavItem[];
};

const ICON_MAP: Record<string, string> = {
  home: mdiHome,
  media: mdiPlayBox,
  cameras: mdiCctv,
  insights: mdiChartBar,
  upstairs: mdiStairs,
  kitchen: mdiCountertop,
  play: mdiPlayBox,
  camera: mdiCctv,
  chart: mdiChartBar,
  stairs: mdiStairs,
  countertop: mdiCountertop,
};

function resolveIcon(icon?: string, slug?: string): string {
  if (icon && ICON_MAP[icon.toLowerCase()]) return ICON_MAP[icon.toLowerCase()];
  if (icon && icon.startsWith("M")) return icon; // raw MDI path
  if (slug && ICON_MAP[slug.toLowerCase()]) return ICON_MAP[slug.toLowerCase()];
  return mdiCircle;
}

export function SidebarNav({ items }: SidebarNavProps) {
  const { hrefForSlug, pathname } = useDashboardNav();
  const navItems =
    items && items.length > 0
      ? items
      : [
          { label: "Home", pageSlug: "home", icon: "home" },
          { label: "Media", pageSlug: "media", icon: "media" },
          { label: "Cameras", pageSlug: "cameras", icon: "cameras" },
          { label: "Insights", pageSlug: "insights", icon: "insights" },
          { label: "Upstairs", pageSlug: "upstairs", icon: "upstairs" },
          { label: "Kitchen", pageSlug: "kitchen", icon: "kitchen" },
        ];

  return (
    <nav className="flex flex-col gap-1.5 w-full mt-2" aria-label="Dashboard">
      {navItems.map((item) => {
        const href = hrefForSlug(item.pageSlug);
        const active =
          pathname === href || pathname.startsWith(`${href}/`);
        const path = resolveIcon(item.icon, item.pageSlug);

        return (
          <AppLink
            key={item.pageSlug}
            href={href}
            aria-current={active ? "page" : undefined}
            className={classNames(
              "group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-[15px] font-semibold cursor-pointer select-none transition-colors duration-150",
              active
                ? "bg-theme-interactive-active text-theme-text-on shadow-sm"
                : "bg-theme-surface text-theme-text-secondary hover:bg-theme-interactive-hover hover:text-theme-text active:bg-theme-interactive-active active:text-theme-text-on"
            )}
          >
            <Icon
              path={path}
              className={classNames(
                "h-5 w-5 shrink-0 transition-opacity",
                active ? "opacity-100" : "opacity-80 group-hover:opacity-100"
              )}
            />
            <span className="flex-1 truncate text-left">{item.label}</span>
            {!active && (
              <Icon
                path={mdiChevronRight}
                className="h-4 w-4 shrink-0 opacity-50 group-hover:opacity-70"
              />
            )}
          </AppLink>
        );
      })}
    </nav>
  );
}

export default SidebarNav;
