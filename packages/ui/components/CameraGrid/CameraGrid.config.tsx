"use client";

import { CameraGrid } from ".";
import { EntityAutocomplete } from "../EntityAutocomplete/EntityAutocomplete";

const MAX_CAMERAS = 16;

const emptyCameras = (count: number) =>
  Array.from({ length: count }, () => ({ id: "" }));

export const CameraGridConfig = {
  label: "Camera Grid",
  fields: {
    layout: {
      type: "select",
      label: "Default layout",
      description:
        "Starting CCTV layout. Viewers can change this on the fly when layout switching is enabled. 7-cam uses one large view on the left, three stacked on the right, and three along the bottom.",
      options: [
        { label: "4 cameras (2×2)", value: "4" },
        { label: "7 cameras (focus + strip)", value: "7" },
        { label: "9 cameras (3×3)", value: "9" },
        { label: "16 cameras (4×4)", value: "16" },
      ],
    },
    allowLayoutSwitch: {
      type: "radio",
      label: "Layout switcher",
      description: "Show 4 / 7 / 9 / 16 controls on the viewer",
      options: [
        { value: true, label: "Show" },
        { value: false, label: "Hide" },
      ],
    },
    cameras: {
      type: "array",
      label: "Cameras",
      description:
        "Cameras in viewing order (up to 16). Slot 1 is the large view in the 7-camera layout. Only the active layout's slots are shown.",
      getItemSummary: (item: { id?: string }, index?: number) =>
        item?.id || `Camera ${(index ?? 0) + 1}`,
      arrayFields: {
        id: {
          type: "custom",
          label: "Camera",
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
              domain="camera"
              label="Search cameras"
              allowClear={true}
              showEntityState={true}
              showEntityIcon={true}
            />
          ),
        },
      },
    },
    showName: {
      type: "radio",
      label: "Show names",
      description: "Display each camera's friendly name over the stream",
      options: [
        { value: true, label: "Show" },
        { value: false, label: "Hide" },
      ],
    },
    audioEnabled: {
      type: "radio",
      label: "Audio",
      description:
        "Allow audio when a camera is expanded. Streams start muted.",
      options: [
        { value: false, label: "Muted only" },
        { value: true, label: "Allow unmute" },
      ],
    },
    gap: {
      type: "select",
      label: "Gap",
      options: [
        { label: "None", value: "gap-0" },
        { label: "2px", value: "gap-0.5" },
        { label: "4px", value: "gap-1" },
        { label: "8px", value: "gap-2" },
      ],
    },
  },
  defaultProps: {
    layout: "4",
    allowLayoutSwitch: true,
    cameras: emptyCameras(MAX_CAMERAS),
    showName: true,
    audioEnabled: false,
    gap: "gap-1",
  },
  resolveData: async ({ props }: { props: Record<string, unknown> }) => {
    const allowSwitch = props.allowLayoutSwitch !== false;
    const layout = Number(props.layout);
    const layoutCount =
      layout === 7 || layout === 9 || layout === 16 || layout === 4
        ? layout
        : 4;
    const target = allowSwitch ? MAX_CAMERAS : layoutCount;
    const cameras = Array.isArray(props.cameras) ? [...props.cameras] : [];
    while (cameras.length < target) {
      cameras.push({ id: "" });
    }
    return {
      props: {
        ...props,
        cameras: allowSwitch ? cameras.slice(0, MAX_CAMERAS) : cameras,
      },
    };
  },
  render: (props: any) => <CameraGrid {...props} />,
};
