"use client";
import React from "react";
import { usePathname } from "next/navigation";
import { dashboardConfig } from "@repo/config";
import Link from "next/link";
import classNames from "classnames";

interface MobileHeaderProps {
  onMenuClick: () => void;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({ onMenuClick }) => {
  const pathname = usePathname();

  // Extract page name from pathname (remove leading slash and any base path)
  const pathSegments = pathname.split("/").filter(Boolean);
  const currentPageName = pathSegments[pathSegments.length - 1] || "";

  // Get available pages
  const availablePages = Object.keys(dashboardConfig.pages || {});

  // Get page title from config
  const pageConfig = dashboardConfig.pages?.[currentPageName];
  const pageTitle = pageConfig?.title?.value || currentPageName || "Dashboard";

  return (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-theme-background border-b border-theme-border">
      {/* Header with menu button and title */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 text-theme-text hover:bg-theme-secondary rounded-lg transition-colors"
            aria-label="Open menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
          </button>
          {availablePages.length > 0 && (
            <div className="px-4">
              <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
                {availablePages.map((pageName) => {
                  const isActive = pageName === currentPageName;
                  const pageTitle =
                    dashboardConfig.pages[pageName]?.title?.value || pageName;

                  return (
                    <Link
                      key={pageName}
                      href={`/${pageName}`}
                      className={classNames(
                        "px-3 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap",
                        {
                          "bg-theme-primary text-theme-background": isActive,
                          "text-theme-secondary hover:text-theme-text hover:bg-theme-secondary":
                            !isActive,
                        }
                      )}
                    >
                      {pageTitle}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
        
        {/* Actions */}
        <div className="flex items-center space-x-2">          
          <Link
            href="/config"
            className="p-2 text-theme-secondary hover:text-theme-text hover:bg-theme-secondary rounded-lg transition-colors"
            aria-label="Configure dashboard"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  );
};
