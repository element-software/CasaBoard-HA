"use client";

import { EntityField } from "../EntityAutocomplete/EntityField";
import GraphCard from "./index";

export const GraphCardConfig = {
  label: "Graph Card",
  fields: {
    entityId: {
      type: "custom",
      label: "Sensor Entity",
      description: "Select a sensor entity from your Home Assistant",
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
          domain="sensor"
          label="Sensor Entity"
          description="Select a sensor entity from your Home Assistant"
        />
      ),
    },
    name: {
      type: "text",
      label: "Display Name",
      description:
        "Optional custom name. Leave blank to use the entity friendly name.",
    },
    showStatistics: {
      type: "radio",
      label: "Show Statistics",
      description: "Show statistics on the graph card",
      options: [
        { value: true, label: "Enabled" },
        { value: false, label: "Disabled" },
      ],
    },
  },
  defaultProps: {
    entityId: "",
    name: "",
    showStatistics: false,
  },
  render: (props: any) => (
    <GraphCard
      {...props}
      name={props.name}
      showStatistics={props.showStatistics}
    />
  ),
};  
