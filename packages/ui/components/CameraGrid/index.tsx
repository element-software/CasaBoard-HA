"use client";

import { useEffect, useState, type CSSProperties } from "react";
import Icon from "@mdi/react";
import { mdiCamera } from "@mdi/js";
import { Button, cn } from "@heroui/react";
import { Camera } from "../Camera";

export type CameraGridLayout = 4 | 7 | 9 | 16;

export interface CameraGridItem {
  id?: string;
}

export interface CameraGridProps {
  /** Default layout; users can change this on the fly when the switcher is shown. */
  layout?: CameraGridLayout | `${CameraGridLayout}`;
  cameras?: CameraGridItem[];
  showName?: boolean;
  audioEnabled?: boolean;
  gap?: "gap-0" | "gap-0.5" | "gap-1" | "gap-2";
  /** Show 4 / 7 / 9 / 16 controls on the viewer. */
  allowLayoutSwitch?: boolean;
  [key: string]: unknown;
}

const LAYOUT_OPTIONS: CameraGridLayout[] = [4, 7, 9, 16];

const LAYOUT_COUNTS: Record<CameraGridLayout, number> = {
  4: 4,
  7: 7,
  9: 9,
  16: 16,
};

function resolveLayout(
  layout: CameraGridProps["layout"]
): CameraGridLayout {
  const n = Number(layout);
  if (n === 4 || n === 7 || n === 9 || n === 16) return n;
  return 4;
}

/** Named areas for the 7-cam CCTV layout: large left, 3 stacked right, 3 bottom. */
const LAYOUT_7_STYLE: CSSProperties = {
  gridTemplateColumns: "1fr 1fr 1fr",
  gridTemplateRows: "1fr 1fr 1fr 1fr",
  gridTemplateAreas: `
    "main main s1"
    "main main s2"
    "main main s3"
    "b1   b2   b3"
  `,
};

const LAYOUT_7_AREAS = ["main", "s1", "s2", "s3", "b1", "b2", "b3"] as const;

function normalizeCameras(
  cameras: CameraGridItem[] | undefined,
  count: number
): string[] {
  const ids = (cameras ?? []).map((c) => c?.id ?? "");
  const padded = [...ids];
  while (padded.length < count) padded.push("");
  return padded.slice(0, count);
}

function EmptySlot() {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 bg-neutral-950 text-white/30">
      <Icon path={mdiCamera} className="h-5 w-5 opacity-50" />
    </div>
  );
}

function CameraCell({
  entityId,
  showName,
  audioEnabled,
}: {
  entityId: string;
  showName: boolean;
  audioEnabled: boolean;
}) {
  if (!entityId) return <EmptySlot />;
  return (
    <Camera
      entityId={entityId}
      showName={showName}
      audioEnabled={audioEnabled}
      fill
    />
  );
}

function LayoutSwitcher({
  value,
  onChange,
}: {
  value: CameraGridLayout;
  onChange: (layout: CameraGridLayout) => void;
}) {
  return (
    <div
      className="flex items-center gap-1 rounded-lg bg-black/70 p-1 backdrop-blur-sm"
      role="group"
      aria-label="Camera grid layout"
    >
      {LAYOUT_OPTIONS.map((option) => {
        const selected = value === option;
        return (
          <Button
            key={option}
            size="sm"
            variant="flat"
            className={cn(
              "min-w-10 px-3 font-medium",
              selected
                ? "bg-white text-black"
                : "bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
            )}
            aria-pressed={selected}
            onPress={() => onChange(option)}
          >
            {option}
          </Button>
        );
      })}
    </div>
  );
}

export const CameraGrid = ({
  layout = 4,
  cameras = [],
  showName = true,
  audioEnabled = false,
  gap = "gap-1",
  allowLayoutSwitch = true,
}: CameraGridProps) => {
  const defaultLayout = resolveLayout(layout);
  const [activeLayout, setActiveLayout] = useState<CameraGridLayout>(defaultLayout);

  useEffect(() => {
    setActiveLayout(resolveLayout(layout));
  }, [layout]);

  const count = LAYOUT_COUNTS[activeLayout];
  const entityIds = normalizeCameras(cameras, count);

  const cells = entityIds.map((entityId, index) => {
    const area =
      activeLayout === 7 ? LAYOUT_7_AREAS[index] : undefined;
    return (
      <div
        key={entityId ? `cam-${entityId}` : `empty-${index}`}
        className="min-h-0 min-w-0 overflow-hidden"
        style={area ? { gridArea: area } : undefined}
      >
        <CameraCell
          entityId={entityId}
          showName={showName}
          audioEnabled={audioEnabled}
        />
      </div>
    );
  });

  const gridClass = cn(
    "grid w-full aspect-video overflow-hidden rounded-xl bg-black",
    gap,
    {
      "grid-cols-2 grid-rows-2": activeLayout === 4,
      "grid-cols-3 grid-rows-3": activeLayout === 9,
      "grid-cols-4 grid-rows-4": activeLayout === 16,
    }
  );

  return (
    <div className="relative w-full">
      {allowLayoutSwitch && (
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-end p-2 sm:p-3">
          <div className="pointer-events-auto">
            <LayoutSwitcher value={activeLayout} onChange={setActiveLayout} />
          </div>
        </div>
      )}

      {activeLayout === 7 ? (
        <div
          className={cn(
            "grid w-full aspect-video overflow-hidden rounded-xl bg-black",
            gap
          )}
          style={LAYOUT_7_STYLE}
          role="group"
          aria-label="Camera grid"
        >
          {cells}
        </div>
      ) : (
        <div className={gridClass} role="group" aria-label="Camera grid">
          {cells}
        </div>
      )}
    </div>
  );
};

export default CameraGrid;
