"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Drawer,
  DrawerContent,
  DrawerBody,
} from "@heroui/react";
import Icon from "@mdi/react";
import {
  mdiViewDashboard,
  mdiCog,
  mdiHome,
  mdiMenu,
  mdiChevronDown,
  mdiChevronRight,
  mdiChevronLeft,
  mdiInformation,
  mdiBookOpen,
  mdiPaletteSwatch,
  mdiBroom,
} from "@mdi/js";
import { cn } from "@heroui/react";
import { CasaBoardLogo } from "../Logo";
import { useAppPathname, useAppRouter } from "@repo/hooks";
import { AppLink } from "../Shared/AppLink";

interface NavLeaf {
  title: string;
  href: string;
  icon: string;
}

interface NavSection {
  id: string;
  title: string;
  icon: string;
  href?: string;
  selfClick?: boolean;
  items?: NavLeaf[];
}

interface SetupSidebarProps {
  className?: string;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const SetupSidebar = ({
  className,
  isOpen = false,
  onClose,
  isCollapsed = false,
  onToggleCollapse,
}: SetupSidebarProps) => {
  const pathname = useAppPathname();
  const { push } = useAppRouter();
  const [isMobileView, setIsMobileView] = useState(false);
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["screens", "manage"])
  );

  useEffect(() => {
    const checkMobile = () => setIsMobileView(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const toggleSection = (section: string) => {
    const next = new Set(expandedSections);
    if (next.has(section)) next.delete(section);
    else next.add(section);
    setExpandedSections(next);
  };

  /** Exact match for `/setup`; prefix match for other setup paths (e.g. theme editor). */
  const isActivePath = (path: string) => {
    if (path === "/setup") return pathname === path;
    return pathname === path || pathname.startsWith(`${path}/`);
  };

  const navigationSections: NavSection[] = [
    {
      id: "dashboard",
      title: "Dashboard",
      icon: mdiViewDashboard,
      href: "/setup",
      selfClick: true,
    },
    {
      id: "screens",
      title: "Screens",
      icon: mdiHome,
      items: [
        { title: "Pages", href: "/setup/pages", icon: mdiHome },
        { title: "Sidebars", href: "/setup/sidebars", icon: mdiMenu },
        { title: "Themes", href: "/setup/themes", icon: mdiPaletteSwatch },
      ],
    },
    {
      id: "manage",
      title: "Manage",
      icon: mdiCog,
      items: [
        { title: "Home Assistant", href: "/setup/ha-config", icon: mdiHome },
        { title: "HA Cleanup", href: "/setup/ha-cleanup", icon: mdiBroom },
      ],
    },
  ];

  const flatNavItems: NavLeaf[] = navigationSections.flatMap((s) =>
    s.selfClick && s.href
      ? [{ title: s.title, href: s.href, icon: s.icon }]
      : (s.items ?? [])
  );

  const bottomItems: NavLeaf[] = [
    { title: "About", href: "/setup/about", icon: mdiInformation },
    { title: "Docs", href: "/setup/docs", icon: mdiBookOpen },
  ];

  // ── Collapsed icon button with tooltip ────────────────────────────────────
  const CollapsedItem = ({
    item,
    onClick,
    exactMatch = false,
  }: {
    item: NavLeaf;
    onClick?: () => void;
    exactMatch?: boolean;
  }) => {
    const active = exactMatch ? pathname === item.href : isActivePath(item.href);
    return (
    <div className="relative group px-2">
      <button
        onClick={() => {
          push(item.href);
          onClick?.();
        }}
        title={item.title}
        className={cn(
          "w-full h-10 flex items-center justify-center rounded-lg transition-all duration-150",
          active
            ? "bg-violet-50 text-violet-600"
            : "text-slate-400 hover:bg-slate-50 hover:text-slate-700"
        )}
      >
        <Icon path={item.icon} className="w-5 h-5 flex-shrink-0" />
        {active && (
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-violet-500 rounded-r-full" />
        )}
      </button>
      {/* Tooltip */}
      <div className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-2.5 py-1.5 bg-slate-900 text-white text-xs font-medium rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-[100] shadow-xl">
        {item.title}
        <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-slate-900" />
      </div>
    </div>
    );
  };

  // ── Main sidebar content (expanded) ───────────────────────────────────────
  const renderExpandedContent = (closeMobile?: () => void) => (
    <div className="h-full flex flex-col bg-white">
      {/* Accent strip */}
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 to-indigo-500 flex-shrink-0" />

      {/* Logo */}
      <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
        <CasaBoardLogo size="small" />
        <span className="text-slate-900 text-base font-semibold tracking-tight">CasaBoard</span>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-0.5 px-2">
        {navigationSections.map((section) => (
          <div key={section.id}>
            <button
              onClick={() =>
                section.selfClick && section.href
                  ? push(section.href)
                  : toggleSection(section.id)
              }
              className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150 text-left",
                section.selfClick && section.href && isActivePath(section.href)
                  ? "bg-violet-50 text-violet-700"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <Icon
                path={section.icon}
                className={cn(
                  "w-4 h-4 flex-shrink-0",
                  section.selfClick && section.href && isActivePath(section.href)
                    ? "text-violet-600"
                    : "text-slate-400"
                )}
              />
              <span className="flex-1">{section.title}</span>
              {!section.selfClick && (
                <Icon
                  path={expandedSections.has(section.id) ? mdiChevronDown : mdiChevronRight}
                  className="w-4 h-4 text-slate-300"
                />
              )}
              {section.selfClick && (
                <Icon path={mdiChevronRight} className="w-4 h-4 text-slate-300" />
              )}
            </button>

            {!section.selfClick && expandedSections.has(section.id) && (
              <div className="mt-0.5 ml-3 pl-3 border-l border-slate-100 space-y-0.5">
                {section.items?.map((item) => (
                  <button
                    key={item.href}
                    onClick={() => {
                      push(item.href);
                      closeMobile?.();
                    }}
                    className={cn(
                      "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 text-left",
                      isActivePath(item.href)
                        ? "bg-violet-50 text-violet-700 font-medium"
                        : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
                    )}
                  >
                    <Icon
                      path={item.icon}
                      className={cn(
                        "w-4 h-4 flex-shrink-0",
                        isActivePath(item.href) ? "text-violet-500" : "text-slate-300"
                      )}
                    />
                    {item.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {/* Divider */}
        <div className="my-2 h-px bg-slate-100 mx-2" />

        {/* Bottom links */}
        {bottomItems.map((item) => (
          <AppLink
            key={item.href}
            href={item.href}
            onClick={closeMobile}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150",
              pathname === item.href
                ? "bg-violet-50 text-violet-700 font-medium"
                : "text-slate-500 hover:bg-slate-50 hover:text-slate-800"
            )}
          >
            <Icon path={item.icon} className="w-4 h-4 flex-shrink-0 text-slate-300" />
            {item.title}
          </AppLink>
        ))}
      </div>

    </div>
  );

  // ── Collapsed icon rail ────────────────────────────────────────────────────
  const renderCollapsedContent = () => (
    <div className="h-full flex flex-col bg-white items-center">
      {/* Accent strip */}
      <div className="h-[3px] w-full bg-gradient-to-r from-violet-500 to-indigo-500 flex-shrink-0" />

      {/* Logo */}
      <div className="py-3 flex items-center justify-center border-b border-slate-100 w-full">
        <CasaBoardLogo size="small" />
      </div>

      {/* Nav icons */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 w-full space-y-1">
        {flatNavItems.map((item) => (
          <CollapsedItem key={item.href} item={item} />
        ))}

        <div className="my-2 h-px bg-slate-100 mx-3" />

        {bottomItems.map((item) => (
          <CollapsedItem key={item.href} item={item} exactMatch />
        ))}
      </div>

      {/* Collapsed footer: expand toggle */}
      <div className="py-2 border-t border-slate-100 w-full flex flex-col items-center gap-1">
        <button
          onClick={onToggleCollapse}
          title="Expand sidebar"
          className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-700 transition-all duration-150"
        >
          <Icon path={mdiChevronRight} className="w-4 h-4" />
        </button>
      </div>
    </div>
  );

  // Mobile drawer
  if (isMobileView) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose || (() => {})}
        placement="left"
        size="xs"
        className="md:hidden"
      >
        <DrawerContent>
          <DrawerBody className="p-0">
            {renderExpandedContent(onClose)}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    );
  }

  // Desktop sidebar
  return (
    <nav
      className={cn(
        "h-screen flex-col border-r border-slate-100 bg-white transition-[width] duration-300 ease-in-out overflow-hidden",
        isCollapsed ? "w-16" : "w-64",
        className
      )}
    >
      {isCollapsed ? renderCollapsedContent() : (
        <div className="h-full flex flex-col">
          {renderExpandedContent()}
          {/* Collapse toggle */}
          <div className="px-4 py-2 border-t border-slate-50">
            <button
              onClick={onToggleCollapse}
              title="Collapse sidebar"
              className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition-all duration-150"
            >
              <Icon path={mdiChevronLeft} className="w-4 h-4" />
              <span>Collapse</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export const MobileMenuButton = ({ onOpen }: { onOpen: () => void }) => (
  <Button
    isIconOnly
    variant="light"
    className="md:hidden"
    onPress={onOpen}
    aria-label="Open menu"
  >
    <Icon path={mdiMenu} className="w-5 h-5" />
  </Button>
);
