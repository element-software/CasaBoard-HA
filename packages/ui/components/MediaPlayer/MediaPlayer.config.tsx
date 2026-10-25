"use client";

import { MediaPlayer } from ".";
import { EntityField } from "../EntityAutocomplete/EntityField";

export const MediaPlayerConfig = {
  label: "Media Player",
  fields: {
    entityId: {
      type: "custom",
      label: "Media Player Entity",
      description: "Select a media player entity from your Home Assistant",
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
          domain="media_player"
          label="Media Player Entity"
          description="Select a media player entity from your Home Assistant"
        />
      ),
    },
  },
  defaultProps: {
    entityId: "",
  },
  render: (props: any) => <MediaPlayer {...props} />,
};
