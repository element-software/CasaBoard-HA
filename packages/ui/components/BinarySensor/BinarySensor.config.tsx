"use client";

import { BinarySensor } from ".";
import { EntityField } from "../EntityAutocomplete/EntityField";

export const BinarySensorConfig = {
  label: "Binary Sensor",
  fields: {
    entityId: {
      type: "custom",
      label: "Binary Sensor Entity",
      description: "Select a binary sensor entity from your Home Assistant",
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
          domain="binary_sensor"
          label="Binary Sensor Entity"
          description="Select a binary sensor entity from your Home Assistant"
        />
      ),
    },
  },
  defaultProps: {
    entityId: "",
  },
  render: (props: any) => <BinarySensor {...props} />,
};
