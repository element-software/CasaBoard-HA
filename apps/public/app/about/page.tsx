import type { Metadata } from "next";
import { AboutPageContent } from "@repo/ui/components/Content/AboutPageContent";
import Icon from "@mdi/react";
import { mdiInformation, mdiGrid, mdiHomeAssistant, mdiDocker } from "@mdi/js";
import { metadataForRoute } from "../lib/og/content";

export const dynamic = "force-dynamic";
export const metadata: Metadata = metadataForRoute("about");

export default function AboutPage() {
  return (
    <>
      {/* ── Full-width hero ── */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-700 via-violet-800 to-indigo-900" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 60%, rgba(167,139,250,0.35) 0%, transparent 55%), radial-gradient(ellipse at 80% 20%, rgba(99,102,241,0.40) 0%, transparent 55%)",
          }}
        />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-48 pb-20 text-center">
          <p className="text-violet-300 text-xs font-semibold uppercase tracking-widest mb-5">
            About CasaBoard
          </p>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Icon path={mdiInformation} className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            A local-only dashboard builder for Home Assistant
          </h1>
          <p className="text-violet-200/80 text-lg max-w-2xl mx-auto mb-10">
            Design beautiful, responsive pages with a drag‑and‑drop editor — free, MIT-licensed,
            privacy-first, and running entirely on your own hardware. No account, no tracking.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: mdiGrid, label: "Drag & Drop Editor" },
              { icon: mdiHomeAssistant, label: "Live HA Data" },
              { icon: mdiDocker, label: "HA App or Docker" },
            ].map((badge) => (
              <div
                key={badge.label}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 text-sm text-white font-medium"
              >
                <Icon path={badge.icon} className="w-4 h-4 text-violet-300" />
                {badge.label}
              </div>
            ))}
          </div>
        </div>
      </div>

      <AboutPageContent />
    </>
  );
}
