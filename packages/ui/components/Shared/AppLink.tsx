"use client";

import NextLink from "next/link";
import { forwardRef, type ComponentProps } from "react";
import { useAppHref } from "@repo/hooks";

export type AppLinkProps = Omit<ComponentProps<typeof NextLink>, "href"> & {
  href: string;
};

/** next/link wrapper that applies the Home Assistant ingress path prefix when set. */
export const AppLink = forwardRef<HTMLAnchorElement, AppLinkProps>(
  function AppLink({ href, ...props }, ref) {
    const resolvedHref = useAppHref(href);
    return <NextLink ref={ref} href={resolvedHref} {...props} />;
  }
);
