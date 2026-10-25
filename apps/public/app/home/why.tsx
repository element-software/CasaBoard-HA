"use client";
import { Card, CardBody, Chip } from "@heroui/react";
import Icon from "@mdi/react";
import {
  mdiCloudOffOutline,
  mdiDrag,
  mdiPalette,
  mdiCodeTags,
  mdiDocker,
  mdiShieldLock,
  mdiEyeOff,
} from "@mdi/js";

interface WhyFeature {
  icon: string;
  title: string;
  description: string;
  highlight: string;
  color: "primary" | "secondary" | "success" | "warning" | "danger";
}

const whyFeatures: WhyFeature[] = [
  {
    icon: mdiShieldLock,
    title: "Local-only, always",
    description:
      "CasaBoard runs on your own hardware. Your Home Assistant connection and dashboard layouts stay on your server — nothing is sent anywhere else.",
    highlight: "Your data, your server",
    color: "success",
  },
  {
    icon: mdiEyeOff,
    title: "Privacy-first, no tracking",
    description:
      "No analytics, no telemetry, no phone-home — in the app or on this site. We don't collect usage data because there's nothing to collect.",
    highlight: "Zero telemetry",
    color: "primary",
  },
  {
    icon: mdiCloudOffOutline,
    title: "No account, no cloud",
    description:
      "There's no sign-up, no login, and no subscription. Anyone who can reach the app on your network can open and edit dashboards.",
    highlight: "Nothing to sign up for",
    color: "primary",
  },
  {
    icon: mdiDocker,
    title: "Docker Compose or HACS",
    description:
      "Run the app with one docker compose up, and optionally install the HACS integration to embed CasaBoard in the Home Assistant sidebar.",
    highlight: "Two install paths",
    color: "secondary",
  },
  {
    icon: mdiDrag,
    title: "Drag & drop editor",
    description:
      "Build dashboards without code. Arrange cards and widgets with a simple drag-and-drop interface.",
    highlight: "No code required",
    color: "success",
  },
  {
    icon: mdiCodeTags,
    title: "Open source (MIT)",
    description:
      "The full source is on public GitHub under the MIT license. Fork it, contribute, or just read how it works — no black box.",
    highlight: "Free & forkable",
    color: "success",
  },
];

export const Why = () => {
  return (
    <div className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <p className="text-violet-600 text-sm font-semibold uppercase tracking-wider mb-3">
            Why CasaBoard
          </p>
          <h2 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            Powerful dashboards, without giving up control
          </h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">
            Free forever: local-only, privacy-first, and MIT licensed. Your Home Assistant
            credentials and dashboards never leave the server you run CasaBoard on.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {whyFeatures.map((feature, index) => (
            <Card
              key={index}
              className="group hover:shadow-md transition-all duration-300 bg-white border border-slate-100 shadow-sm"
            >
              <CardBody className="p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center group-hover:bg-violet-100 transition-colors duration-300">
                    <Icon
                      path={feature.icon}
                      className="w-6 h-6 text-violet-600"
                    />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-slate-900 group-hover:text-violet-700 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-slate-500 leading-relaxed text-sm">
                      {feature.description}
                    </p>
                  </div>

                  <Chip
                    color={feature.color}
                    variant="flat"
                    size="sm"
                    className="font-medium"
                  >
                    {feature.highlight}
                  </Chip>
                </div>
              </CardBody>
            </Card>
          ))}
        </div>

        <div className="mt-12">
          <div className="bg-violet-50 border border-violet-100 rounded-2xl p-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-sm">
                <Icon path={mdiPalette} className="w-5 h-5 text-violet-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">
                No coding experience required
              </h3>
            </div>
            <p className="text-slate-500 text-base max-w-2xl mx-auto">
              CasaBoard is for everyone—from power users to newcomers. An intuitive
              drag-and-drop interface helps you create polished dashboards, entirely on
              infrastructure you control.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
