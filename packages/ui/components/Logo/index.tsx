import { cn } from "@heroui/react";
import Image from "next/image";
import { AppLink } from "../Shared/AppLink";

export interface CasaBoardLogoProps {
  className?: string;
  size?: "small" | "medium" | "large";
}

/**
 * CasaBoard Logo Component
 *
 * Usage examples:
 * - Header: <CasaBoardLogo size="small" />
 * - Large: <CasaBoardLogo size="large" />
 * - Medium (default): <CasaBoardLogo size="medium" />
 */

const url =
  process.env.NODE_ENV === "production"
    ? "https://casaboard.dev/casaboard-logo.png"
    : "http://localhost:3001/casaboard-logo.png";

export const CasaBoardLogo = ({
  className,
  size = "medium",
}: CasaBoardLogoProps) => {
  return (
    <AppLink href="/" className="flex items-center justify-center">
      <Image
        src={url}
        alt="CasaBoard Logo"
        width={400}
        height={400}
        className={cn(className, {
          "w-10 h-10": size === "small",
          "w-20 h-20": size === "medium",
          "w-40 h-40": size === "large",
        })}
      />
    </AppLink>
  );
};
