"use client";

import { GridRender } from "./index";

const slots = {
  col1: { type: "slot" },
  col2: { type: "slot" },
  col3: { type: "slot" },
  col4: { type: "slot" },
  col5: { type: "slot" },
  col6: { type: "slot" },
};

export const GridConfig = {
  label: "Grid",
  fields: {
    columns_sm: { type: "number", label: "Columns on Mobile" },
    columns_md: { type: "number", label: "Columns on Tablet" },
    columns_lg: { type: "number", label: "Columns on Desktop" },
    columns_xl: { type: "number", label: "Columns on Large Desktop" },
    gap: {
      type: "select",
      options: [
        { label: "None", value: "gap-0" },
        { label: "8px", value: "gap-2" },
        { label: "16px", value: "gap-4" },
        { label: "24px", value: "gap-6" },
        { label: "32px", value: "gap-8" },
      ],
      label: "Gap",
    },
    alignX: {
      type: "select",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Space Between", value: "between" },
        { label: "Space Around", value: "around" },
        { label: "Space Evenly", value: "evenly" },
      ],
      label: "Align Horizontal",
    },
    alignY: {
      type: "select",
      options: [
        { label: "Start", value: "start" },
        { label: "Center", value: "center" },
        { label: "End", value: "end" },
        { label: "Stretch", value: "stretch" },
        { label: "Baseline", value: "baseline" },
      ],
      label: "Align Vertical",
    },
    // Slots for up to 6 columns
    ...slots,
  },
  defaultProps: {
    columns_sm: 2, // 2 columns on mobile
    columns_md: 3, // 3 columns on tablet
    columns_lg: 5, // denser desktop so square tiles stay compact
    columns_xl: 6, // large desktop
    gap: "gap-4",
    alignX: "start",
    alignY: "stretch",
  },
  // Cast to any to satisfy Puck's generic render typing
  render: ((props: any) => <GridRender {...props} />) as any,
};


