"use client";

import type { CSSProperties, MouseEventHandler, PointerEventHandler, ReactNode } from "react";
import classNames from "classnames";

export interface CardShellProps {
  status?: "on" | "off" | "unavailable" | "loading";
  domain?: string;
  tileLayout?: "tile" | "row";
  interactive?: boolean;
  className?: string;
  style?: CSSProperties;
  onClick?: MouseEventHandler<HTMLDivElement>;
  onPointerDown?: PointerEventHandler<HTMLDivElement>;
  onPointerUp?: PointerEventHandler<HTMLDivElement>;
  onPointerLeave?: PointerEventHandler<HTMLDivElement>;
  onPointerCancel?: PointerEventHandler<HTMLDivElement>;
  onMouseMove?: MouseEventHandler<HTMLDivElement>;
  onMouseDown?: MouseEventHandler<HTMLDivElement>;
  onMouseUp?: MouseEventHandler<HTMLDivElement>;
  onMouseLeave?: MouseEventHandler<HTMLDivElement>;
  children: ReactNode;
}

/**
 * Shared outer card chrome (radius/padding/shadow/blur/interactive state).
 * Owns shape only — callers still supply color via `style`/className, same
 * as before this component existed. Structural look differences between
 * component "Style" presets (HomeKit, Glassy, Flat, 3D, ...) are expressed
 * as CSS rules keyed off `[data-casaboard-style]` against this fixed markup
 * skeleton, not as branches in this component.
 */
export function CardShell({
  status,
  domain,
  tileLayout,
  interactive,
  className,
  style,
  children,
  ...handlers
}: CardShellProps) {
  return (
    <div
      data-card-state={status}
      data-domain={domain}
      data-tile-layout={tileLayout}
      className={classNames(
        "card-shell",
        "w-full h-full overflow-hidden select-none transition-all duration-200",
        interactive && "card-shell--interactive cursor-pointer hover:brightness-110",
        status === "unavailable" && "opacity-50",
        className
      )}
      style={style}
      {...handlers}
    >
      <div className="card-shell__blur" aria-hidden="true" />
      <div className="card-shell__content">{children}</div>
    </div>
  );
}
