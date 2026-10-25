"use client";

import { Alarm } from ".";
import EntityField from "../EntityAutocomplete/EntityField";

const ACTION_OPTIONS = [
  { label: "None", value: "none" },
  { label: "Disarm", value: "alarm_disarm" },
  { label: "Arm Home", value: "alarm_arm_home" },
  { label: "Arm Away", value: "alarm_arm_away" },
  { label: "Arm Night", value: "alarm_arm_night" },
  { label: "Arm Vacation", value: "alarm_arm_vacation" },
  { label: "Trigger", value: "alarm_trigger" },
];

export const AlarmConfig = {
  label: "Alarm",
  fields: {
    entityId: {
      type: "custom",
      label: "Alarm Entity",
      description: "Select an alarm control panel entity from your Home Assistant",
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
          domain="alarm_control_panel"
          label="Alarm Entity"
          description="Select an alarm control panel entity from your Home Assistant"
        />
      ),
    },
    tapAction: {
      type: "select",
      label: "Single Tap Action",
      options: ACTION_OPTIONS,
    },
    longPressAction: {
      type: "select",
      label: "Long Press Action",
      options: ACTION_OPTIONS,
    },
    code: {
      type: "text",
      label: "Alarm Code (optional)",
    },
  },
  defaultProps: {
    entityId: "",
    tapAction: "none",
    longPressAction: "none",
    code: "",
  },
  render: (props: any) => <Alarm {...props} />,
};
