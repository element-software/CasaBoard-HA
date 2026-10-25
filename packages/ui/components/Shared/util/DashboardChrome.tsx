"use client";

import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import type { Sidebar } from "@repo/types/sidebar";
import type { StyleId } from "@repo/types/style";
import { Render } from "@measured/puck";
import { PuckConfig } from "../../puck/puck.config";
import { ThemeScope } from "../../ThemeScope/ThemeScope";
import {
  Drawer,
  DrawerContent,
  DrawerBody,
  Button,
  Spinner,
} from "@heroui/react";
import { useDisclosure } from "@heroui/react";
import Icon from "@mdi/react";
import { mdiMenu } from "@mdi/js";
import { useAppPathname } from "@repo/hooks";
import { useHAConnection } from "@repo/hooks";
import { AppLink } from "../AppLink";
import { HassConnectWrapper } from "./HassConnectWrapper";
import { DashboardNavProvider } from "../../DashboardNav/DashboardNavContext";

export type DashboardChromeState = {
  sidebar: Sidebar;
  themeSidebarStyle?: CSSProperties;
  styleSidebarId?: StyleId;
  styleSidebarVars?: CSSProperties;
};

type DashboardChromeContextValue = {
  setChrome: (chrome: DashboardChromeState | null) => void;
};

const DashboardChromeContext = createContext<DashboardChromeContextValue | null>(
  null
);

export function useDashboardChrome() {
  const ctx = useContext(DashboardChromeContext);
  if (!ctx) {
    throw new Error(
      "useDashboardChrome must be used within DashboardChromeProvider"
    );
  }
  return ctx;
}

/**
 * Registers sidebar chrome for the persistent dashboard shell.
 * Prior chrome is kept on unmount so SPA navigations do not flash an empty sidebar.
 * Same sidebar id/updated_at keeps the previous chrome reference (no remount).
 * No-ops when rendered outside DashboardChromeProvider.
 */
export function useRegisterDashboardChrome(
  chrome: DashboardChromeState | null
) {
  const ctx = useContext(DashboardChromeContext);
  const setChrome = ctx?.setChrome;
  const sidebar = chrome?.sidebar;
  const themeSidebarStyle = chrome?.themeSidebarStyle;
  const styleSidebarId = chrome?.styleSidebarId;
  const styleSidebarVars = chrome?.styleSidebarVars;

  useLayoutEffect(() => {
    if (!setChrome || !sidebar?.puck_data) return;
    setChrome({
      sidebar,
      themeSidebarStyle,
      styleSidebarId,
      styleSidebarVars,
    });
  }, [
    setChrome,
    sidebar,
    themeSidebarStyle,
    styleSidebarId,
    styleSidebarVars,
  ]);
}

function SidebarPuck({ sidebar }: { sidebar: Sidebar }) {
  try {
    return <Render config={PuckConfig} data={sidebar.puck_data} />;
  } catch (error) {
    console.error("Error rendering sidebar:", error);
    return (
      <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        <p>
          Error rendering sidebar:{" "}
          {error instanceof Error ? error.message : "Unknown error"}
        </p>
      </div>
    );
  }
}

function PersistentSidebar({
  chrome,
  isOpen,
  onClose,
}: {
  chrome: DashboardChromeState;
  isOpen: boolean;
  onClose: () => void;
}) {
  const pathname = useAppPathname();
  useEffect(() => {
    onClose();
  }, [pathname]); // eslint-disable-line react-hooks/exhaustive-deps -- close on route change only
  return (
    <>
      <ThemeScope
        style={chrome.themeSidebarStyle}
        styleVars={chrome.styleSidebarVars}
        styleId={chrome.styleSidebarId}
        className="min-w-[300px] max-w-[300px] h-full shrink-0 p-4 hidden md:block bg-theme-background overflow-y-auto overscroll-contain"
      >
        <SidebarPuck sidebar={chrome.sidebar} />
      </ThemeScope>

      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        placement="left"
        size="sm"
        style={chrome.themeSidebarStyle}
        classNames={{ base: "bg-theme-background text-theme-text" }}
      >
        <DrawerContent>
          <DrawerBody className="p-4 bg-theme-background overflow-y-auto overscroll-contain">
            <ThemeScope
              style={chrome.themeSidebarStyle}
              styleVars={chrome.styleSidebarVars}
              styleId={chrome.styleSidebarId}
            >
              <SidebarPuck sidebar={chrome.sidebar} />
            </ThemeScope>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
}

export function DashboardChromeProvider({ children }: { children: ReactNode }) {
  const { connection, loading } = useHAConnection();
  const pathname = useAppPathname();
  const [mounted, setMounted] = useState(false);
  const [chrome, setChromeState] = useState<DashboardChromeState | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  useEffect(() => {
    setMounted(true);
  }, []);

  const hrefForSlug = useCallback(
    (slug: string) => `/dashboard/${slug}`,
    []
  );

  const setChrome = useCallback((next: DashboardChromeState | null) => {
    setChromeState((prev) => {
      if (!next) return prev;
      if (
        prev &&
        prev.sidebar.id === next.sidebar.id &&
        prev.sidebar.updated_at === next.sidebar.updated_at &&
        prev.styleSidebarId === next.styleSidebarId
      ) {
        return prev;
      }
      return next;
    });
  }, []);

  const value = useMemo(() => ({ setChrome }), [setChrome]);

  if (!mounted || loading) {
    return (
      <div className="flex justify-center p-16">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!connection) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 p-12 text-center">
        <p className="text-foreground-600 max-w-md">
          This dashboard needs a Home Assistant connection.
        </p>
        <Button as={AppLink} href="/setup/ha-config" color="primary">
          Configure Home Assistant
        </Button>
      </div>
    );
  }

  const hasSidebar = Boolean(chrome?.sidebar?.puck_data);

  return (
    <DashboardNavProvider hrefForSlug={hrefForSlug} pathname={pathname}>
      <HassConnectWrapper haInstance={connection}>
        <DashboardChromeContext.Provider value={value}>
          <div className="flex flex-col md:flex-row gap-4 relative h-dvh max-h-dvh overflow-hidden">
            {hasSidebar && chrome ? (
              <PersistentSidebar
                chrome={chrome}
                isOpen={isOpen}
                onClose={onClose}
              />
            ) : null}
            <div className="w-full grow min-w-0 min-h-0 overflow-y-auto overscroll-contain">
              {hasSidebar ? (
                <div className="md:hidden px-4 pt-4">
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={onOpen}
                    aria-label="Open sidebar"
                  >
                    <Icon path={mdiMenu} className="w-5 h-5" />
                  </Button>
                </div>
              ) : null}
              {children}
            </div>
          </div>
        </DashboardChromeContext.Provider>
      </HassConnectWrapper>
    </DashboardNavProvider>
  );
}
