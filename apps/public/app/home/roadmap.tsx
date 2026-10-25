"use client";
import { Chip, Link } from "@heroui/react";

import {
  mdiCheckCircle,
  mdiClockOutline,
  mdiRocket,
  mdiChartLine,
  mdiPalette,
  mdiDocker,
  mdiMonitor,
  mdiFileExportOutline,
} from "@mdi/js";
import Icon from "@mdi/react";

export type RoadmapStatus = "completed" | "in-progress" | "planned";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: RoadmapStatus;
  quarter: string;
  icon: string;
}

const roadmapItems: RoadmapItem[] = [
  {
    id: "core-dashboard",
    title: "Core Dashboard",
    description:
      "Core dashboard with entity cards, widgets, and a drag-and-drop editor",
    status: "completed",
    quarter: "Q4 2025",
    icon: mdiCheckCircle,
  },
  {
    id: "custom-themes",
    title: "Custom Themes",
    description: "Custom themes and a layout editor to personalise every dashboard",
    status: "completed",
    quarter: "Q1 2026",
    icon: mdiPalette,
  },
  {
    id: "self-hosted",
    title: "Self-Hosted Release",
    description: "Docker packaging and a HACS Lovelace panel to embed CasaBoard in the HA sidebar",
    status: "completed",
    quarter: "Q3 2026",
    icon: mdiDocker,
  },
  {
    id: "advanced-widgets",
    title: "Advanced Widgets",
    description: "More component types, advanced graphs, and charts",
    status: "in-progress",
    quarter: "Q3 2026",
    icon: mdiChartLine,
  },
  {
    id: "kiosk-mode",
    title: "Kiosk & Display Mode",
    description:
      "Fullscreen display mode for dedicated tablets and wall-mounted screens",
    status: "completed",
    quarter: "Q4 2026",
    icon: mdiMonitor,
  },
  {
    id: "import-export",
    title: "Dashboard Import & Export",
    description:
      "Export your dashboard layout as a file and import it on another instance",
    status: "planned",
    quarter: "Q4 2026",
    icon: mdiFileExportOutline,
  },
];

const getStatusColor = (status: RoadmapStatus) => {
  switch (status) {
    case "completed":
      return "success";
    case "in-progress":
      return "primary";
    case "planned":
      return "default";
    default:
      return "default";
  }
};

const getStatusIcon = (status: RoadmapStatus) => {
  switch (status) {
    case "completed":
      return mdiCheckCircle;
    case "in-progress":
      return mdiClockOutline;
    case "planned":
      return mdiRocket;
    default:
      return mdiClockOutline;
  }
};

export const Roadmap = () => {
  return (
    <div className="space-y-6 p-4 w-full pb-8">
      <div className="text-center mb-8">
        <p className="text-violet-600 text-sm font-semibold uppercase tracking-wider mb-3">
          What&apos;s next
        </p>
        <h2 className="text-4xl font-bold text-slate-900 mb-2 tracking-tight">Roadmap</h2>
        <p className="text-slate-500">
          Upcoming features and improvements
        </p>
      </div>

      <div className="relative mx-auto">
        <div className="space-y-4">
          {roadmapItems.map((item) => (
            <div key={item.id} className="relative flex items-center gap-4">
              {/* Timeline dot */}
              <div className="relative z-10 min-w-12 min-h-12 w-12 h-12 bg-white rounded-full border-2 border-violet-200 flex items-center justify-center shadow-sm">
                <Icon
                  path={getStatusIcon(item.status)}
                  className={`w-5 h-5 ${
                    item.status === "completed"
                      ? "text-success"
                      : item.status === "in-progress"
                        ? "text-primary"
                        : "text-theme-text-secondary"
                  }`}
                />
              </div>

              {/* Content */}
              <div className="flex-1 py-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-violet-50 rounded-lg flex items-center justify-center mt-1">
                      <Icon
                        path={item.icon}
                        className="w-4 h-4 text-violet-600"
                      />
                    </div>
                    <div className="flex flex-col w-full">
                      <h3 className="font-medium text-slate-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-slate-400 mb-1">
                        {item.quarter}
                      </p>
                      <p className="text-sm text-slate-500">
                        {item.description}
                      </p>
                    </div>
                  </div>
                  <Chip
                    color={getStatusColor(item.status)}
                    variant="flat"
                    size="sm"
                    className="flex-shrink-0"
                  >
                    {item.status
                      .replace("-", " ")
                      .replace(/\b\w/g, (l) => l.toUpperCase())}
                  </Chip>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <p className="text-theme-text-secondary">
          Want to see something on the roadmap?{" "}
          <Link href="/contact">Contact us</Link>
        </p>
      </div>
    </div>
  );
};
