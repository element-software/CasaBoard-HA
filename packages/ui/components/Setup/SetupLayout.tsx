"use client";

import { useState } from "react";
import { useDisclosure } from "@heroui/react";
import { cn } from "@heroui/react";
import { SetupSidebar, MobileMenuButton } from "./SetupSidebar";
import { Breadcrumbs } from "../Breadcrumbs";
import { Footer } from "../Shared/Footer";

interface SetupLayoutProps {
  children: React.ReactNode;
}

export const SetupLayout = ({ children }: SetupLayoutProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="flex min-h-screen overflow-x-hidden">
      <SetupSidebar
        className="fixed hidden md:flex"
        isOpen={isOpen}
        onClose={onClose}
        isCollapsed={isCollapsed}
        onToggleCollapse={() => setIsCollapsed((c) => !c)}
      />

      <div
        className={cn(
          "flex flex-1 flex-col w-full transition-[margin] duration-300 ease-in-out",
          isCollapsed ? "md:ml-16" : "md:ml-64"
        )}
      >
        <Breadcrumbs startContent={<MobileMenuButton onOpen={onOpen} />} />
        <main className="flex-1">{children}</main>
        <Footer />
      </div>
    </div>
  );
};
