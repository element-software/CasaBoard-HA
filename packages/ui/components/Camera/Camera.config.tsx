"use client";

import { Camera } from ".";
import { EntityField } from "../EntityAutocomplete/EntityField";

export const CameraConfig = {
  label: "Camera",
  fields: {
    entityId: {
      type: "custom",
      label: "Camera Entity",
      description: "Select a camera entity from your Home Assistant",
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
          domain="camera"
          label="Camera Entity"
          description="Select a camera entity from your Home Assistant"
        />
      ),
    },
    audioEnabled: {
      type: "radio",
      label: "Audio",
      description:
        "Allow audio from this camera. Streams start muted; use the mute button on the card to unmute.",
      options: [
        { value: false, label: "Muted only" },
        { value: true, label: "Allow unmute" },
      ],
    },
    showName: {
      type: "radio",
      label: "Show name",
      description: "Display the camera friendly name over the stream",
      options: [
        { value: true, label: "Show" },
        { value: false, label: "Hide" },
      ],
    },
  },
  defaultProps: {
    entityId: "",
    audioEnabled: false,
    showName: true,
  },
  render: (props: any) => <Camera {...props} />,
};
