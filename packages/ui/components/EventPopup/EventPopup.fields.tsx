"use client";

import {
  DEFAULT_EVENT_POPUP_RULE,
  type EventPopupRule,
} from "@repo/types/eventPopup";
import { EntityAutocomplete } from "../EntityAutocomplete/EntityAutocomplete";
import { EntityField } from "../EntityAutocomplete/EntityField";

type EntityRenderProps = {
  value?: string;
  onChange: (value: string) => void;
};

/** Puck root field: per-page rules that open a camera popup on entity changes. */
export const eventPopupsField = {
  type: "array",
  label: "Event popups",
  getItemSummary: (item: EventPopupRule) =>
    item.name?.trim() || item.triggerEntityId || "New popup",
  defaultItemProps: DEFAULT_EVENT_POPUP_RULE,
  arrayFields: {
    name: {
      type: "text",
      label: "Title (optional)",
    },
    enabled: {
      type: "radio",
      label: "Enabled",
      options: [
        { value: true, label: "On" },
        { value: false, label: "Off" },
      ],
    },
    triggerEntityId: {
      type: "custom",
      label: "Trigger entity",
      render: ({ value, onChange }: EntityRenderProps) => (
        <EntityAutocomplete
          value={value}
          onChange={(v) => onChange(v ?? "")}
          label="Trigger entity"
          description="Popup opens when this entity changes"
          allowClear={true}
          showEntityState={true}
          showEntityIcon={true}
        />
      ),
    },
    triggerMode: {
      type: "select",
      label: "Trigger when",
      options: [
        { label: "State becomes…", value: "to_state" },
        { label: "Any state change", value: "any_change" },
      ],
    },
    toState: {
      type: "text",
      label: "To state (for “State becomes…”, e.g. on)",
    },
    fromState: {
      type: "text",
      label: "From state (optional, e.g. off)",
    },
    cameraEntityId: {
      type: "custom",
      label: "Camera",
      render: ({ value, onChange }: EntityRenderProps) => (
        <EntityField
          value={value}
          onChange={(v) => onChange(v ?? "")}
          domain="camera"
          label="Camera"
          description="Stream shown in the popup"
        />
      ),
    },
    allowAudio: {
      type: "radio",
      label: "Camera audio",
      options: [
        { value: false, label: "Muted only" },
        { value: true, label: "Allow unmute" },
      ],
    },
    autoCloseSeconds: {
      type: "number",
      label: "Auto-close after (seconds, 0 = never)",
      min: 0,
    },
    cooldownSeconds: {
      type: "number",
      label: "Cooldown (seconds)",
      min: 0,
    },
  },
} as const;
