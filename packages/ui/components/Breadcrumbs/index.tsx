"use client";

import {
  BreadcrumbItem,
  Breadcrumbs as HeroBreadcrumbs,
  Skeleton,
} from "@heroui/react";
import { useAppPathname } from "@repo/hooks";
import { AppLink } from "../Shared/AppLink";
import { generateBreadcrumbs } from "./generateBreadcrumbs";

export { generateBreadcrumbs } from "./generateBreadcrumbs";
export type { Crumb } from "./generateBreadcrumbs";

interface BreadcrumbsProps {
  showHome?: boolean;
  startContent?: React.ReactNode;
}

export const Breadcrumbs = ({ showHome = true, startContent }: BreadcrumbsProps) => {
  const pathname = useAppPathname() || "/";
  const breadcrumbItems = generateBreadcrumbs(pathname, showHome);

  if (breadcrumbItems.length === 0) {
    return null;
  }

  return (
    <Skeleton isLoaded={breadcrumbItems.length > 0}>
      <div className="max-w-7xl w-full mx-auto pt-4.5 pb-2 md:pt-4 md:pb-4 flex items-center gap-2">
        {startContent && <div className="md:hidden">{startContent}</div>}
        <HeroBreadcrumbs className="text-sm">
          {breadcrumbItems.map((item, index) => (
            <BreadcrumbItem key={`${item.label}-${index}`}>
              {item.href ? (
                <AppLink href={item.href}>{item.label}</AppLink>
              ) : (
                item.label
              )}
            </BreadcrumbItem>
          ))}
        </HeroBreadcrumbs>
      </div>
    </Skeleton>
  );
};
