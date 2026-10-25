"use client";

import { cn } from "@heroui/react";
import { JSX } from "react";

type SlotRenderer = (props?: any) => JSX.Element;

export type GridProps = {
  columns_sm?: number;
  columns_md?: number;
  columns_lg?: number;
  columns_xl?: number;
  gap?: string;
  alignX?: "start" | "center" | "end" | "between" | "around" | "evenly";
  alignY?: "start" | "center" | "end" | "stretch" | "baseline";
  className?: string;

  col1?: SlotRenderer;
  col2?: SlotRenderer;
  col3?: SlotRenderer;
  col4?: SlotRenderer;
  col5?: SlotRenderer;
  col6?: SlotRenderer;
};

const justifyClassMap: Record<NonNullable<GridProps["alignX"]>, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const itemsClassMap: Record<NonNullable<GridProps["alignY"]>, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

export const GridRender = (props: GridProps) => {
  const {
    columns_sm = 2,
    columns_md = 3,
    columns_lg = 5,
    columns_xl = 6,
    gap = "gap-4",
    alignX = "start",
    alignY = "stretch",
    className,
    ...rest
  } = props as any;

  // All class strings are full static literals so Tailwind JIT can detect them.
  // Dynamic class construction (e.g. `col-span-${n}`) is intentionally avoided.
  const containerClass = cn(
    "grid w-full",
    {
      "grid-cols-1": columns_sm === 1,
      "grid-cols-2": columns_sm === 2,
      "grid-cols-3": columns_sm === 3,
      "grid-cols-4": columns_sm === 4,
      "grid-cols-5": columns_sm === 5,
      "grid-cols-6": columns_sm === 6,
      "md:grid-cols-1": columns_md === 1,
      "md:grid-cols-2": columns_md === 2,
      "md:grid-cols-3": columns_md === 3,
      "md:grid-cols-4": columns_md === 4,
      "md:grid-cols-5": columns_md === 5,
      "md:grid-cols-6": columns_md === 6,
      "lg:grid-cols-1": columns_lg === 1,
      "lg:grid-cols-2": columns_lg === 2,
      "lg:grid-cols-3": columns_lg === 3,
      "lg:grid-cols-4": columns_lg === 4,
      "lg:grid-cols-5": columns_lg === 5,
      "lg:grid-cols-6": columns_lg === 6,
      "xl:grid-cols-1": columns_xl === 1,
      "xl:grid-cols-2": columns_xl === 2,
      "xl:grid-cols-3": columns_xl === 3,
      "xl:grid-cols-4": columns_xl === 4,
      "xl:grid-cols-5": columns_xl === 5,
      "xl:grid-cols-6": columns_xl === 6,
    },
    gap,
    justifyClassMap[alignX as NonNullable<GridProps["alignX"]>],
    itemsClassMap[alignY as NonNullable<GridProps["alignY"]>],
    className
  );

  const slots: (keyof GridProps)[] = ["col1", "col2", "col3", "col4", "col5", "col6"];

  const renderColumn = (index: number, key: number) => {
    const slotKey = slots[index - 1];
    const Slot = (rest as any)[slotKey] as SlotRenderer | undefined;
    if (!Slot) return null;

    return (
      <div key={key} className="flex flex-col w-full h-full min-w-0 min-h-0">
        <Slot className="flex flex-col flex-1 h-full min-h-0 w-full [&>*]:flex [&>*]:flex-col [&>*]:flex-1 [&>*]:min-h-0 [&>*]:w-full" />
      </div>
    );
  };

  const maxCols = Math.min(
    Math.max(columns_sm || 1, columns_md || 1, columns_lg || 1, columns_xl || 1),
    6
  );

  return (
    <div className={containerClass}>
      {Array.from({ length: maxCols }).map((_, i) => renderColumn(i + 1, i))}
    </div>
  );
};


