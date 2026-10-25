"use client";

import { PagePlaceholder } from "./index";

export const PagePlaceholderConfig = {
  label: "Page Placeholder",
  fields: {
    title: {
      type: "text",
      label: "Title",
    },
    description: {
      type: "textarea",
      label: "Description",
    },
  },
  defaultProps: {
    title: "Coming soon",
    description:
      "This section is ready for your layout. Add components in the page editor.",
  },
  render: (props: any) => <PagePlaceholder {...props} />,
};
