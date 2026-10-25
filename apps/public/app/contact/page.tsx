import type { Metadata } from "next";
import ContactPageContent from "./ContactPageContent";
import Icon from "@mdi/react";
import { mdiEmailOutline, mdiClockFast, mdiHeadset } from "@mdi/js";
import { metadataForRoute } from "../lib/og/content";
import { GITHUB_ISSUES_URL } from "../lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = metadataForRoute("contact");

export default function ContactPage() {
  return (
    <>
      {/* ── Full-width hero ── */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-700 via-violet-800 to-indigo-900" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 10% 70%, rgba(167,139,250,0.35) 0%, transparent 55%), radial-gradient(ellipse at 90% 20%, rgba(99,102,241,0.40) 0%, transparent 55%)",
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
            Get in touch
          </p>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Icon path={mdiEmailOutline} className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            We&apos;d love to hear from you
          </h1>
          <p className="text-violet-200/80 text-lg max-w-2xl mx-auto mb-10">
            Have a question or feedback? Use the form below, or open an issue on{" "}
            <a
              href={GITHUB_ISSUES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white underline underline-offset-2 hover:text-violet-100"
            >
              GitHub
            </a>
            {" "}— preferred for bugs.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: mdiClockFast, label: "No account needed" },
              { icon: mdiHeadset, label: "Open source support" },
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

      <ContactPageContent />
    </>
  );
}
