"use client";

import { SidebarNav } from "./index";

export const SidebarNavConfig = {
  label: "Sidebar Nav",
  fields: {
    items: {
      type: "array",
      label: "Links",
      getItemSummary: (item: { label?: string; pageSlug?: string }) =>
        item?.label || item?.pageSlug || "Link",
      arrayFields: {
        label: {
          type: "text",
          label: "Label",
        },
        pageSlug: {
          type: "text",
          label: "Page slug",
        },
        icon: {
          type: "select",
          label: "Icon",
          options: [
            { label: "Home", value: "home" },
            { label: "Media", value: "media" },
            { label: "Cameras", value: "cameras" },
            { label: "Insights", value: "insights" },
            { label: "Upstairs", value: "upstairs" },
            { label: "Kitchen", value: "kitchen" },
          ],
        },
      },
    },
  },
  defaultProps: {
    items: [
      { label: "Home", pageSlug: "home", icon: "home" },
      { label: "Media", pageSlug: "media", icon: "media" },
      { label: "Cameras", pageSlug: "cameras", icon: "cameras" },
      { label: "Insights", pageSlug: "insights", icon: "insights" },
      { label: "Upstairs", pageSlug: "upstairs", icon: "upstairs" },
      { label: "Kitchen", pageSlug: "kitchen", icon: "kitchen" },
    ],
  },
  render: (props: any) => <SidebarNav {...props} />,
};
