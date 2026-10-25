"use client";

import { Weather } from "./Weather";
import EntityField from "../EntityAutocomplete/EntityField";

export const WeatherConfig = {
  label: "Weather",
  fields: {
    entityId: {
      type: "custom",
      label: "Weather Entity",
      description: "Select a weather entity from your Home Assistant",
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
          domain={"weather" as any}
          label="Weather Entity"
          description="Select a weather entity from your Home Assistant"
        />
      ),
    },
    forecastType: {
      type: "select",
      label: "Forecast Type",
      options: [
        { label: "Daily", value: "daily" },
        { label: "Hourly", value: "hourly" },
      ],
    },
    forecastCount: {
      type: "number",
      label: "Forecast Periods",
      min: 1,
      max: 7,
    },
  },
  defaultProps: {
    entityId: "",
    forecastType: "daily",
    forecastCount: 5,
  },
  render: (props: any) => <Weather {...props} />,
};
