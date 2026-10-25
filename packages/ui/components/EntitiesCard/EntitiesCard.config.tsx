"use client";

import EntitiesCard from "./index";
import { Entity } from "@repo/types/shared";
import { EntityAutocomplete } from "../EntityAutocomplete/EntityAutocomplete";

interface EntitiesCardProps {
  title: string;
  entities: Entity[];
  columns: number;
  showTitles: boolean;
  showLastChanged: boolean;
  showAllOn: boolean;
}

export const EntitiesCardConfig = {
  label: "Entities Card",
  fields: {
    title: {
      type: "text",
      label: "Card Title",
    },
    entities: {
      type: "array",
      label: "Entities",
      getItemSummary: (item: Entity) => item.id || "Entity",
      arrayFields: {
        id: {
          type: "custom",
          label: "Entity",
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
              label="Search entities"
              allowClear={false}
              showEntityState={true}
              showEntityIcon={true}
            />
          ),
        },
        icon: {
          type: "text",
          label: "Override Icon (optional)",
        },
      },
    },
    columns: {
      type: "number",
      label: "Columns",
      min: 1,
      max: 10,
    },
    showTitles: {
      type: "radio",
      label: "Show Entity Titles",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },
    showLastChanged: {
      type: "radio",
      label: "Show Last Changed",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },
    showAllOn: {
      type: "radio",
      label: "Show All On Button",
      options: [
        { value: true, label: "Yes" },
        { value: false, label: "No" },
      ],
    },
  },
  defaultProps: {
    title: "Entities",
    entities: [],
    columns: 4,
    showTitles: true,
    showLastChanged: false,
    showAllOn: false,
  },
  render: (props: any) => <EntitiesCard {...props} />
};
