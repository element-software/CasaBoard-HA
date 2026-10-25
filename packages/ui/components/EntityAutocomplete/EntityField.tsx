"use client";
import React from 'react';
import { EntityAutocomplete } from './EntityAutocomplete';
type DefinedDomain =
  | "light"
  | "switch"
  | "sensor"
  | "binary_sensor"
  | "alarm_control_panel"
  | "climate"
  | "fan"
  | "camera"
  | "lock"
  | "cover"
  | "window"
  | "water_heater"
  | "media_player";

interface EntityFieldProps {
  value?: string;
  onChange: (value: string | null) => void;
  domain?: DefinedDomain | "binary_sensor";
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const EntityField: React.FC<EntityFieldProps> = ({
  value,
  onChange,
  domain,
  label = "Entity",
  description,
  disabled = false,
}) => {
  return (
    <EntityAutocomplete
      value={value}
      onChange={onChange}
      domain={domain}
      label={label}
      description={description}
      disabled={disabled}
      allowClear={true}
      showEntityState={true}
      showEntityIcon={true}
    />
  );
};

export default EntityField;
