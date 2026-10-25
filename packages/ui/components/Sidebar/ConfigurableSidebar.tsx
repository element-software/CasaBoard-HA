"use client";
import { useEntity } from "@casaboard/ha";
import Clock from "@repo/ui/components/Clock/index";
import Thermostat from "@repo/ui/components/Thermostat/index";
import Image from "next/image";
import { MobileHeader } from "@repo/ui/components/Header/MobileHeader";
import { useState, useEffect } from "react";
import { useConfiguration } from "@/components/Shared/util/ConfigurationProvider";
import { SidebarConfig } from "@repo/config";

interface ConfigurableSidebarProps {
  children: React.ReactNode;
  fallbackConfig: SidebarConfig;
  currentPage?: string; // Current page identifier
}

export const ConfigurableSidebar = ({ children, fallbackConfig, currentPage }: ConfigurableSidebarProps) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { config } = useConfiguration();

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Use per-page sidebar config if available, otherwise use global config, fallback during SSR
  const sidebarConfig = isClient 
    ? (currentPage && config.pages[currentPage]?.sidebar) || config.sidebar 
    : fallbackConfig;


  // Thermostat component with optional rendering
  const ThermostatComponent = ({ entityId }: { entityId: string }) => {
    const thermostatEntity = useEntity(entityId as string);
    
    // Don't render if no entityId provided or if entity doesn't exist or is unavailable
    if (!entityId || typeof entityId !== 'string' || !thermostatEntity || thermostatEntity.state === 'unavailable' || thermostatEntity.state === 'unknown') {
      return null;
    }

    return <Thermostat entityId={entityId as string} />;
  };

  // Close mobile menu when screen size changes to desktop
  useEffect(() => {
    // Check if we're on the client side
    if (typeof window === 'undefined') return;
    
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const SidebarContent = () => (
    <div className="flex flex-col gap-y-5 overflow-y-auto p-8 pb-4 h-full">
      {sidebarConfig?.showClock && (
        <div className="flex flex-col">
          <Clock />
        </div>
      )}
      
      {sidebarConfig?.showThermostat && sidebarConfig.thermostat && (
        <div className="flex flex-1 flex-col w-full">
          <ThermostatComponent entityId={sidebarConfig.thermostat} />
        </div>
      )}
      
      {sidebarConfig?.showBranding && (
        <div className="flex flex-1 flex-row w-full text-center items-center justify-center gap-2 text-theme-text text-xs">
          {sidebarConfig.brandingText}
          {sidebarConfig.brandingImage && (
            <Image 
              src={sidebarConfig.brandingImage} 
              alt="branding" 
              width={100} 
              height={100} 
            />
          )}
        </div>
      )}
      
    </div>
  );

  return (
    <>
      <div className="min-h-screen">
        {/* Mobile header */}
        <MobileHeader onMenuClick={() => setIsMobileMenuOpen(true)} />

        {/* Mobile sidebar overlay */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            {/* Overlay backdrop */}
            <div 
              className="fixed inset-0 bg-black/50" 
              onClick={() => setIsMobileMenuOpen(false)}
            />
            
            {/* Sidebar panel */}
            <div className="relative flex flex-col w-80 max-w-sm bg-theme-background border-r border-theme-border">
              {/* Close button */}
              <div className="absolute top-1 right-1">
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-2 text-theme-text hover:bg-theme-secondary rounded-lg transition-colors"
                  aria-label="Close menu"
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
              <SidebarContent />
            </div>
          </div>
        )}

        {/* Desktop sidebar */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col bg-theme-background border-r border-theme-border">
          <SidebarContent />
        </div>

        {/* Main content */}
        <div className="lg:pl-72">
          <div className="relative min-h-screen pt-24 lg:pt-0">
            <div className="absolute bg-theme-background left-0 top-0 w-full h-full opacity-35 pointer-events-none" style={{ zIndex: "-1" }} />
            <div className="relative z-10">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
