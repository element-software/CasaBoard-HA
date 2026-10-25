"use client";

import { LightGroup } from ".";
import { EntityAutocomplete } from "../EntityAutocomplete/EntityAutocomplete";

export const LightGroupConfig = {
  label: "Light Group",
  fields: {
    title: {
      type: "text",
      label: "Group Name",
    },
    lights: {
      type: "array",
      label: "Lights",
      getItemSummary: (item: { id?: string }) => item.id || "Light",
      arrayFields: {
        id: {
          type: "custom",
          label: "Light",
          render: ({
            value,
            onChange,
          }: {
            value?: string;
            onChange: (value: string) => void;
          }) => (
            <EntityAutocomplete
              value={value}
              onChange={(v) => onChange(v ?? "")}
              domain="light"
              label="Search lights"
              allowClear={false}
              showEntityState={true}
              showEntityIcon={true}
            />
          ),
        },
      },
    },
    columns: {
      type: "number",
      label: "Columns",
      min: 1,
      max: 10,
    },
    showAllOn: {
      type: "radio",
      label: "Show All On/Off Button",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },
    dimmer: {
      type: "radio",
      label: "Brightness in modal",
      description: "Show brightness slider in each light's long-press control modal",
      options: [
        { value: true, label: "Enabled" },
        { value: false, label: "Disabled" },
      ],
    },
    temperature: {
      type: "radio",
      label: "Temperature Control",
      description: "Show color temperature in each light's long-press modal",
      options: [
        { value: true, label: "Enabled" },
        { value: false, label: "Disabled" },
      ],
    },
    color: {
      type: "radio",
      label: "Color Control",
      description: "Show color picker in each light's long-press modal",
      options: [
        { value: true, label: "Enabled" },
        { value: false, label: "Disabled" },
      ],
    },
  },
  defaultProps: {
    title: "Light Group",
    lights: [],
    columns: 4,
    showAllOn: true,
    dimmer: true,
    temperature: true,
    color: true,
  },
  render: (props: any) => (
    <LightGroup
      title={props.title}
      entityIds={(props.lights || []).map((l: { id?: string }) => l.id).filter(Boolean)}
      columns={props.columns}
      showAllOn={props.showAllOn}
      dimmer={props.dimmer}
      temperature={props.temperature}
      color={props.color}
    />
  ),
};
