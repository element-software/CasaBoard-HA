"use client";

import { Light } from ".";
import { EntityField } from "../EntityAutocomplete/EntityField";

export const LightConfig = {
  label: "Light",
  fields: {
    entityId: {
      type: "custom",
      label: "Light Entity",
      description: "Select a light entity from your Home Assistant",
      render: ({
        value,
        onChange,
      }: {
        value?: string;
        onChange: (value: string | null) => void;
      }) => (
        <EntityField
          value={value}
          onChange={onChange}
          domain="light"
          label="Light Entity"
          description="Select a light entity from your Home Assistant"
        />
      ),
    },
    dimmer: {
      type: "radio",
      label: "Brightness in modal",
      description: "Show brightness slider in the long-press control modal",
      options: [
        { value: true, label: "Enabled" },
        { value: false, label: "Disabled" },
      ],
    },
    temperature: {
      type: "radio",
      label: "Temperature Control",
      description: "Show color temperature in the long-press modal",
      options: [
        { value: true, label: "Enabled" },
        { value: false, label: "Disabled" },
      ],
    },
    color: {
      type: "radio",
      label: "Color Control",
      description: "Show color picker in the long-press modal",
      options: [
        { value: true, label: "Enabled" },
        { value: false, label: "Disabled" },
      ],
    },
  },
  defaultProps: {
    entityId: "",
    dimmer: true,
    temperature: true,
    color: true,
  },
  render: (props: any) => <Light {...props} />,
};
