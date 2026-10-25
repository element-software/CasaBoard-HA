"use client";
import React, { useState } from "react";
import { CasaBoardLogo } from "../Logo";
import { getPublicLinks, NavLink } from "./NavLinks";
import Link from "next/link";
import {
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
} from "@heroui/react";
import Icon from "@mdi/react";
import { mdiMenu } from "@mdi/js";

export const Header = () => {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-30 max-w-7xl mx-auto px-4 pt-3">
        <div className="px-0 mx-auto bg-white border border-slate-200 shadow-sm rounded-2xl">
          <div className="flex items-center h-14 sm:px-4 px-2 sm:h-16">
            <div className="flex items-center gap-2 sm:gap-4 min-w-0 w-full justify-between">
              <div className="min-w-0 flex items-center gap-2">
                <CasaBoardLogo size="small" />
                <Link href="/" className="text-slate-900 font-semibold tracking-tight hover:text-violet-700 transition-colors">CasaBoard</Link>
              </div>
              {/* Desktop Navigation */}
              <div className="hidden sm:flex items-center gap-1">
                {getPublicLinks().map((link: NavLink) => (
                  <Button
                    key={link.href}
                    as={Link}
                    href={link.href}
                    target={link.href.startsWith("http") ? "_blank" : undefined}
                    rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                    variant="light"
                    color="default"
                    size="sm"
                    className="text-slate-600 hover:text-slate-900 font-medium"
                  >
                    {link.label}
                  </Button>
                ))}
              </div>
              {/* Mobile Menu Button */}
              <Button
                isIconOnly
                variant="light"
                className="sm:hidden text-theme-text"
                onPress={() => setIsDrawerOpen(true)}
                aria-label="Open menu"
              >
                <Icon path={mdiMenu} className="w-6 h-6" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <Drawer
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        placement="right"
        backdrop="blur"
        className="sm:hidden"
      >
        <DrawerContent className="bg-white text-slate-900 border-l border-slate-100">
          <DrawerHeader className="border-b border-slate-100 flex flex-col items-center gap-2 py-6">
            <CasaBoardLogo size="small" />
            <Link href="/" className="text-slate-900 font-semibold text-lg hover:text-violet-700 transition-colors">CasaBoard</Link>
          </DrawerHeader>
          <DrawerBody className="flex flex-col gap-2 py-4">
            {getPublicLinks().map((link: NavLink) => (
              <Button
                key={link.href}
                as={Link}
                href={link.href}
                target={link.href.startsWith("http") ? "_blank" : undefined}
                rel={link.href.startsWith("http") ? "noopener noreferrer" : undefined}
                variant="light"
                color="default"
                className="justify-start text-slate-600"
                startContent={link.icon}
                onPress={() => setIsDrawerOpen(false)}
              >
                {link.label}
              </Button>
            ))}
          </DrawerBody>
          <DrawerFooter className="border-t border-slate-100 flex flex-col items-center gap-2 py-4">
            <div className="text-xs text-slate-500 text-center">
              <a
                href="mailto:support@casaboard.dev"
                className="text-violet-600 hover:underline"
              >
                support@casaboard.dev
              </a>
            </div>
            <div className="text-xs text-slate-500 text-center">
              © {new Date().getFullYear()} CasaBoard. MIT licensed.
            </div>
            <div className="text-xs text-slate-500 text-center">
              Powered by{" "}
              <a
                href="https://element-software.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline"
              >
                Element Software
              </a>{" "}
              and{" "}
              <a
                href="https://element-connect.co.uk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline"
              >
                Element Connect
              </a>
            </div>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
};
