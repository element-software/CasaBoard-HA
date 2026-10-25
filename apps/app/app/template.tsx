"use client";
import { HeroUIProvider } from "@heroui/react";

export default function Template({ children }: { children: React.ReactNode }) {
  return <HeroUIProvider>{children}</HeroUIProvider>;
}
