"use client";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
} from "@heroui/react";
import Link from "next/link";
import { getPublicLinks, getAppLinks } from "./NavLinks";
interface HeaderDrawerProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isPublic: boolean;
}

export function HeaderDrawer({
  isOpen,
  onOpenChange,
  isPublic,
}: HeaderDrawerProps) {
  const publicLinks = getPublicLinks();
  const appLinks = getAppLinks();

  return (
    <Drawer
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="right"
      backdrop="blur"
    >
      <DrawerContent className="bg-theme-background text-theme-text border-l border-theme-border">
        <DrawerHeader className="border-b border-theme-border flex flex-row items-center justify-between">
          <h2 className="text-lg font-semibold">Menu</h2>
        </DrawerHeader>
        <DrawerBody className="flex flex-col gap-2">
          {publicLinks.map((link) => (
            <Button
              key={link.href}
              as={Link}
              href={link.href}
              target={link.external ? "_blank" : undefined}
              rel={link.external ? "noopener noreferrer" : undefined}
              variant="light"
              className="justify-start text-theme-text"
              onPress={() => onOpenChange(false)}
            >
              {link.label}
            </Button>
          ))}
          {!isPublic &&
            appLinks.map((link) => (
              <Button
                key={link.href}
                as={Link}
                href={link.href}
                variant="light"
                className="justify-start text-theme-text"
                onPress={() => onOpenChange(false)}
              >
                {link.label}
              </Button>
            ))}
        </DrawerBody>
        <DrawerFooter />
      </DrawerContent>
    </Drawer>
  );
}
