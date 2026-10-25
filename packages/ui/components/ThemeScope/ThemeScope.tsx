"use client";

import type { CSSProperties, ReactNode } from "react";
import { useLayoutEffect, useRef } from "react";
import type { StyleId } from "@repo/types/style";

export type ThemeScopeProps = {
  style?: CSSProperties;
  styleVars?: CSSProperties;
  styleId?: StyleId;
  className?: string;
  children: ReactNode;
};

/**
 * Applies resolved CSS custom properties to a subtree (dashboard / preview).
 * Custom properties are mirrored with `setProperty` so hyphenated `--theme-*`
 * and `--style-*` vars reliably update (the `style` prop alone can miss
 * updates in some cases). Also carries the active component `style` preset
 * (`data-casaboard-style`) alongside the color `theme` — two independent axes
 * scoped to the same subtree.
 */
export function ThemeScope({
  style,
  styleVars,
  styleId,
  className,
  children,
}: ThemeScopeProps) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const applied: string[] = [];
    const applyVars = (vars?: CSSProperties) => {
      if (!vars) return;
      for (const [k, v] of Object.entries(vars)) {
        if (typeof v === "string" && k.startsWith("--")) {
          el.style.setProperty(k, v);
          applied.push(k);
        }
      }
    };
    applyVars(style);
    applyVars(styleVars);

    return () => {
      for (const k of applied) {
        el.style.removeProperty(k);
      }
    };
  }, [style, styleVars]);

  const mergedStyle: CSSProperties = { ...style, ...styleVars };

  return (
    <div
      ref={ref}
      data-casaboard-theme
      data-casaboard-style={styleId}
      className={className}
      style={mergedStyle}
    >
      {children}
    </div>
  );
}
