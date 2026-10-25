"use client";

import { SectionHeader } from "./index";

export const SectionHeaderConfig = {
  label: "Section Header",
  fields: {
    title: {
      type: "text",
      label: "Title",
    },
  },
  defaultProps: {
    title: "Favorites",
  },
  render: (props: any) => <SectionHeader {...props} />,
};
