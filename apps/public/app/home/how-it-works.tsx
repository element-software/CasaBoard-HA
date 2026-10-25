"use client";
import Icon from "@mdi/react";
import { mdiDrag, mdiEye, mdiDocker, mdiHomeAssistant } from "@mdi/js";

const steps = [
  {
    title: "Install",
    description:
      "docker compose up -d for the app — optionally add the HACS integration to embed it in the HA sidebar",
    icon: mdiDocker,
  },
  {
    title: "Connect HA",
    description:
      "Point it at your Home Assistant instance and authorise once. The connection is stored locally, on the same server.",
    icon: mdiHomeAssistant,
  },
  {
    title: "Design",
    description: "Drag and drop components to build your perfect dashboard — no account, no cloud",
    icon: mdiDrag,
  },
  {
    title: "Enjoy",
    description: "Open dashboards on any device on your network, or from the HA sidebar via HACS",
    icon: mdiEye,
  },
];

export const HowItWorks = () => {
  return (
    <div className="mb-16 py-16 px-8 bg-slate-50 rounded-2xl">
      <div className="text-center mb-12">
        <p className="text-violet-600 text-sm font-semibold uppercase tracking-wider mb-3">
          Getting started
        </p>
        <h2 className="text-4xl font-bold text-slate-900 tracking-tight">How It Works</h2>
        <p className="text-slate-500 text-lg mt-3">
          Get started with CasaBoard in just a few simple steps
        </p>
      </div>
      <div className="grid md:grid-cols-4 gap-8 relative">
        {/* Connecting line on desktop */}
        <div className="hidden md:block absolute top-6 left-[12.5%] right-[12.5%] border-t-2 border-dashed border-violet-100" />
        {steps.map((step, index) => (
          <div className="text-center relative" key={index}>
            <div className="w-12 h-12 bg-white border-2 border-violet-200 rounded-full flex items-center justify-center text-lg font-bold text-violet-700 mx-auto mb-4 relative z-10">
              {index + 1}
            </div>
            <div className="w-8 h-8 flex items-center justify-center mx-auto mb-3">
              <Icon path={step.icon} className="w-6 h-6 text-violet-400" />
            </div>
            <h3 className="text-base font-semibold text-slate-900 mb-2">
              {step.title}
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              {step.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};
