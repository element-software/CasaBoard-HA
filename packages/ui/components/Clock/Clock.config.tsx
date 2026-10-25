"use client";

import Clock from ".";

export const ClockConfig = {
  label: "Clock",
  fields: {
    align: {
      type: "radio" as const,
      label: "Alignment",
      options: [
        { label: "Left", value: "left" as const },
        { label: "Center", value: "center" as const },
        { label: "Right", value: "right" as const },
      ],
    },
    hourFormat: {
      type: "radio" as const,
      label: "Time Format",
      description: "Auto follows the device's 12/24-hour preference",
      options: [
        { label: "Auto (device)", value: "auto" as const },
        { label: "12-hour", value: "12" as const },
        { label: "24-hour", value: "24" as const },
      ],
    },
  },
  defaultProps: {
    align: "left" as const,
    hourFormat: "auto" as const,
  },
  render: (props: any) => <Clock {...props} />,
};
