"use client";

import { Rooms } from "./index";
import { EntityAutocomplete } from "../EntityAutocomplete/EntityAutocomplete";

type RoomEntity = { id: string };
type RoomItem = { id?: string; name: string; entities: RoomEntity[] };

export const RoomsConfig = {
  label: "Rooms",
  fields: {
    title: {
      type: "text",
      label: "Section Title",
    },
    rooms: {
      type: "array",
      label: "Rooms",
      getItemSummary: (item: RoomItem) => item?.name || "Room",
      arrayFields: {
        name: {
          type: "text",
          label: "Room Name",
        },
        entities: {
          type: "array",
          label: "Accessories",
          getItemSummary: (item: RoomEntity) => item?.id || "Entity",
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
          },
        },
      },
    },
  },
  defaultProps: {
    title: "Rooms",
    rooms: [
      {
        name: "Living Room",
        entities: [],
      },
    ],
  },
  render: (props: any) => <Rooms {...props} />,
};
