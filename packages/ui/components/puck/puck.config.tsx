"use client";
import { LightConfig } from "@repo/ui/components/Light/Light.config";
import { LightGroupConfig } from "@repo/ui/components/LightGroup/LightGroup.config";
import { SwitchConfig } from "@repo/ui/components/Switch/Switch.config";
import { AlarmConfig } from "@repo/ui/components/Alarm/Alarm.config";
import { BinarySensorConfig } from "@repo/ui/components/BinarySensor/BinarySensor.config";
import { EntitiesCardConfig } from "@repo/ui/components/EntitiesCard/EntitiesCard.config";
import { GraphCardConfig } from "@repo/ui/components/GraphCard/GraphCard.config";
import { ClockConfig } from "@repo/ui/components/Clock/Clock.config";
import { ThermostatConfig } from "@repo/ui/components/Thermostat/Thermostat.config";
import { WeatherConfig } from "@repo/ui/components/Weather/Weather.config";
import { CameraConfig } from "@repo/ui/components/Camera/Camera.config";
import { CameraGridConfig } from "@repo/ui/components/CameraGrid/CameraGrid.config";
import { MediaPlayerConfig } from "@repo/ui/components/MediaPlayer/MediaPlayer.config";
import { RoomsConfig } from "@repo/ui/components/Rooms/Rooms.config";
import { SidebarNavConfig } from "@repo/ui/components/SidebarNav/SidebarNav.config";
import { PagePlaceholderConfig } from "@repo/ui/components/PagePlaceholder/PagePlaceholder.config";
import { SectionHeaderConfig } from "@repo/ui/components/SectionHeader/SectionHeader.config";
import { Config } from "@measured/puck";
import { GridConfig } from "@repo/ui/components/Grid/Grid.config";
import { eventPopupsField } from "@repo/ui/components/EventPopup/EventPopup.fields";
import { cn } from "@heroui/react";

type Components = {
  Light: {};
  LightGroup: {};
  Switch: {};
  Alarm: {};
  BinarySensor: {};
  EntitiesCard: {};
  GraphCard: {};
  Clock: {
    align: "left" | "center" | "right";
    hourFormat: "12" | "24" | "auto";
  };
  Grid: {};
  Thermostat: {};
  Weather: {};
  Camera: {};
  CameraGrid: {};
  MediaPlayer: {};
  Rooms: {};
  SidebarNav: {};
  PagePlaceholder: {};
  SectionHeader: {};
};

const GAP_OPTIONS = [
  { label: "None", value: "gap-0" },
  { label: "8px", value: "gap-2" },
  { label: "16px", value: "gap-4" },
  { label: "24px", value: "gap-6" },
  { label: "32px", value: "gap-8" },
] as const;

const PADDING_OPTIONS = [
  { label: "None", value: "p-0" },
  { label: "8px", value: "p-2" },
  { label: "16px", value: "p-4" },
  { label: "24px", value: "p-6" },
  { label: "32px", value: "p-8" },
] as const;

const ALIGN_X_OPTIONS = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
  { label: "Space Between", value: "between" },
  { label: "Space Around", value: "around" },
  { label: "Space Evenly", value: "evenly" },
] as const;

const ALIGN_Y_OPTIONS = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
  { label: "Stretch", value: "stretch" },
  { label: "Baseline", value: "baseline" },
] as const;

const justifyClassMap: Record<string, string> = {
  start: "justify-start",
  center: "justify-center",
  end: "justify-end",
  between: "justify-between",
  around: "justify-around",
  evenly: "justify-evenly",
};

const itemsClassMap: Record<string, string> = {
  start: "items-start",
  center: "items-center",
  end: "items-end",
  stretch: "items-stretch",
  baseline: "items-baseline",
};

// [&>div]: variants — target Puck's single wrapper div so flex layout applies
// to the component container, not the outer root div (which only has one child).
const innerDirectionClassMap: Record<string, string> = {
  column: "[&>div]:flex-col",
  row: "[&>div]:flex-row",
  "column-reverse": "[&>div]:flex-col-reverse",
  "row-reverse": "[&>div]:flex-row-reverse",
};

const innerGapClassMap: Record<string, string> = {
  "gap-0": "[&>div]:gap-0",
  "gap-2": "[&>div]:gap-2",
  "gap-4": "[&>div]:gap-4",
  "gap-6": "[&>div]:gap-6",
  "gap-8": "[&>div]:gap-8",
};

const innerWrapClassMap: Record<string, string> = {
  nowrap: "[&>div]:flex-nowrap",
  wrap: "[&>div]:flex-wrap",
  "wrap-reverse": "[&>div]:flex-wrap-reverse",
};

const innerJustifyClassMap: Record<string, string> = {
  "justify-start": "[&>div]:justify-start",
  "justify-center": "[&>div]:justify-center",
  "justify-end": "[&>div]:justify-end",
  "justify-between": "[&>div]:justify-between",
  "justify-around": "[&>div]:justify-around",
  "justify-evenly": "[&>div]:justify-evenly",
};

const innerItemsClassMap: Record<string, string> = {
  "items-start": "[&>div]:items-start",
  "items-center": "[&>div]:items-center",
  "items-end": "[&>div]:items-end",
  "items-stretch": "[&>div]:items-stretch",
  "items-baseline": "[&>div]:items-baseline",
};

const ITEMS_ONLY = new Set([
  "start",
  "center",
  "end",
  "stretch",
  "baseline",
]);

/** align-items only supports a subset of keys; distribute values are invalid. */
function toItemsClass(align: string | undefined): string {
  const a = align ?? "stretch";
  if (ITEMS_ONLY.has(a)) return itemsClassMap[a] ?? "items-stretch";
  return "items-stretch";
}

function toJustifyClass(align: string | undefined): string {
  const a = align ?? "start";
  return justifyClassMap[a] ?? "justify-start";
}

/** Map screen-horizontal/vertical alignment to flex justify/items for the current direction. */
function rootFlexAlignment(
  direction: string | undefined,
  alignX: string | undefined,
  alignY: string | undefined
): { justify: string; items: string } {
  const ax = alignX ?? "start";
  const ay = alignY ?? "stretch";
  const isRow = direction === "row" || direction === "row-reverse";
  if (isRow) {
    return {
      justify: toJustifyClass(ax),
      items: toItemsClass(ay),
    };
  }
  return {
    justify: toJustifyClass(ay),
    items: toItemsClass(ax),
  };
}

function RootCanvas(props: any) {
  const {
    children,
    layoutDirection = "column",
    layoutGap = "gap-4",
    layoutPadding = "p-0",
    alignX = "start",
    alignY = "stretch",
    layoutWrap = "nowrap",
  } = props;

  const { justify, items } = rootFlexAlignment(
    layoutDirection,
    alignX,
    alignY
  );

  return (
    <div
      className={cn(
        "w-full min-h-0",
        layoutPadding,
        // Stretch Puck's dropzone; when cross-axis is stretch, make each child a
        // full-height flex column so inner cards can fill their cell.
        "[&>div]:w-full [&>div]:flex [&>div>*]:min-h-0 [&>div>*]:w-full [&>div>*]:min-w-0",
        items === "items-stretch" &&
          "[&>div>*]:flex [&>div>*]:h-full [&>div>*]:flex-col",
        innerDirectionClassMap[layoutDirection] ?? "[&>div]:flex-col",
        innerGapClassMap[layoutGap] ?? "[&>div]:gap-4",
        innerWrapClassMap[layoutWrap] ?? "[&>div]:flex-nowrap",
        innerJustifyClassMap[justify] ?? "[&>div]:justify-start",
        innerItemsClassMap[items] ?? "[&>div]:items-stretch",
      )}
    >
      {children}
    </div>
  );
}

// Puck component configuration
export const PuckConfig: Config<Components> = {
  root: {
    label: "Page layout",
    fields: {
      layoutDirection: {
        type: "select",
        label: "Direction",
        options: [
          { label: "Column", value: "column" },
          { label: "Row", value: "row" },
          { label: "Column (reversed)", value: "column-reverse" },
          { label: "Row (reversed)", value: "row-reverse" },
        ],
      },
      layoutGap: {
        type: "select",
        label: "Gap",
        options: [...GAP_OPTIONS],
      },
      layoutPadding: {
        type: "select",
        label: "Padding",
        options: [...PADDING_OPTIONS],
      },
      layoutWrap: {
        type: "select",
        label: "Wrap",
        options: [
          { label: "No wrap", value: "nowrap" },
          { label: "Wrap", value: "wrap" },
          { label: "Wrap reverse", value: "wrap-reverse" },
        ],
      },
      alignX: {
        type: "select",
        label: "Align horizontal",
        options: [...ALIGN_X_OPTIONS],
      },
      alignY: {
        type: "select",
        label: "Align vertical",
        options: [...ALIGN_Y_OPTIONS],
      },
      eventPopups: eventPopupsField,
    },
    defaultProps: {
      layoutDirection: "column",
      layoutGap: "gap-4",
      layoutPadding: "p-0",
      layoutWrap: "nowrap",
      alignX: "start",
      alignY: "stretch",
      eventPopups: [],
    },
    render: (props: any) => <RootCanvas {...props} />,
  },
  components: {
    Light: LightConfig,
    LightGroup: LightGroupConfig,
    Switch: SwitchConfig,
    Alarm: AlarmConfig,
    BinarySensor: BinarySensorConfig,
    EntitiesCard: EntitiesCardConfig,
    GraphCard: GraphCardConfig,
    Clock: ClockConfig,
    Grid: GridConfig,
    Thermostat: ThermostatConfig,
    Weather: WeatherConfig,
    Camera: CameraConfig,
    CameraGrid: CameraGridConfig,
    MediaPlayer: MediaPlayerConfig,
    Rooms: RoomsConfig,
    SidebarNav: SidebarNavConfig,
    PagePlaceholder: PagePlaceholderConfig,
    SectionHeader: SectionHeaderConfig,
  },
  categories: {
    layout: {
      title: "Layout",
      components: ["Grid", "SectionHeader", "PagePlaceholder", "Rooms"],
    },
    navigation: {
      title: "Navigation",
      components: ["SidebarNav"],
    },
    entities: {
      title: "Entities",
      components: [
        "Light",
        "LightGroup",
        "Switch",
        "Clock",
        "BinarySensor",
        "EntitiesCard",
        "GraphCard",
        "Thermostat",
        "Weather",
        "Camera",
        "CameraGrid",
        "MediaPlayer",
        "Alarm",
      ],
    },
  },
};
