import type { Metadata } from "next";
import Icon from "@mdi/react";
import Link from "next/link";
import {
  mdiShieldCheck,
  mdiFolderLockOutline,
  mdiEyeOff,
  mdiCheckCircle,
  mdiCloseCircle,
  mdiEmail,
  mdiServer,
  mdiCloudOffOutline,
  mdiArrowRight,
  mdiWifiOff,
  mdiLanConnect,
} from "@mdi/js";
import { metadataForRoute } from "../lib/og/content";

export const metadata: Metadata = metadataForRoute("security");

// ── Reusable primitives ──────────────────────────────────────────────────────

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-mono text-xs text-violet-400 tracking-widest select-none">{n}</span>
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function CheckItem({ children, color = "emerald" }: { children: React.ReactNode; color?: "emerald" | "red" | "slate" }) {
  const icon = color === "red" ? mdiCloseCircle : mdiCheckCircle;
  const iconColor = color === "emerald" ? "text-emerald-500" : color === "red" ? "text-red-400" : "text-slate-400";
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
      <Icon path={icon} className={`w-4 h-4 ${iconColor} shrink-0 mt-0.5`} />
      {children}
    </li>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function SecurityPage() {
  return (
    <>
      {/* ── Full-width hero ── */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-700 via-violet-800 to-indigo-900" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 15% 60%, rgba(167,139,250,0.35) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(99,102,241,0.40) 0%, transparent 55%)",
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
            Security & Privacy
          </p>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Icon path={mdiShieldCheck} className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Self-hosted by design
          </h1>
          <p className="text-violet-200/80 text-lg max-w-2xl mx-auto mb-10">
            Your Home Assistant credentials and dashboards live only on the server you run
            CasaBoard on. There are no CasaBoard servers in the picture at all.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: mdiFolderLockOutline, label: "Local files only" },
              { icon: mdiShieldCheck, label: "No accounts" },
              { icon: mdiEyeOff, label: "Zero telemetry" },
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

      {/* ── Page content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-20">

        {/* ── 01 · Core guarantee ── */}
        <section>
          <SectionLabel n="01" label="Core guarantee" />
          <div className="border-l-4 border-violet-600 pl-6 mb-10">
            <p className="text-2xl font-bold text-slate-900 leading-snug mb-2">
              Your Home Assistant credentials never leave your server.
            </p>
            <p className="text-slate-500">
              This isn&apos;t a policy promise — it&apos;s the way the software is built. There is no
              CasaBoard backend to send data to; the only network endpoint the app talks to is the
              Home Assistant instance you configure.
            </p>
          </div>

          {/* Data map */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Local */}
            <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <Icon path={mdiCloudOffOutline} className="w-4 h-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">Stays on your server</p>
                  <p className="text-xs text-emerald-600/70">Everything, always</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                <CheckItem color="emerald">Home Assistant URL and access token</CheckItem>
                <CheckItem color="emerald">Dashboard, sidebar, and theme layouts</CheckItem>
                <CheckItem color="emerald">All stored as JSON files on your mounted data volume</CheckItem>
              </ul>
            </div>

            {/* Server */}
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-7 h-7 bg-slate-200 rounded-lg flex items-center justify-center">
                  <Icon path={mdiServer} className="w-4 h-4 text-slate-600" />
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-widest">Stored by CasaBoard (the maintainers)</p>
                  <p className="text-xs text-slate-400">Nothing — there is no hosted service</p>
                </div>
              </div>
              <ul className="space-y-2.5">
                <CheckItem color="red">No accounts</CheckItem>
                <CheckItem color="red">No dashboard data</CheckItem>
                <CheckItem color="red">No Home Assistant credentials</CheckItem>
              </ul>
            </div>
          </div>
        </section>

        {/* ── 02 · Direct connection ── */}
        <section>
          <SectionLabel n="02" label="Direct connection" />
          <p className="text-slate-600 mb-8 max-w-2xl">
            When you open a dashboard, the CasaBoard server opens a WebSocket directly to your
            Home Assistant instance. Live entity data flows between the two — there is no third
            server anywhere in between.
          </p>

          {/* Flow diagram */}
          <div className="flex flex-col sm:flex-row items-center gap-0 sm:gap-0 rounded-2xl overflow-hidden border border-slate-100">
            <div className="flex-1 bg-white p-6 text-center">
              <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon path={mdiLanConnect} className="w-5 h-5 text-violet-600" />
              </div>
              <p className="font-semibold text-slate-900 text-sm mb-0.5">CasaBoard container</p>
              <p className="text-xs text-slate-400">Runs on your network</p>
            </div>

            <div className="flex flex-row sm:flex-col items-center justify-center px-4 py-4 sm:py-6 bg-emerald-50 border-y sm:border-y-0 sm:border-x border-emerald-100 w-full sm:w-auto">
              <div className="flex flex-col sm:flex-row items-center gap-2">
                <Icon path={mdiArrowRight} className="w-4 h-4 text-emerald-500 rotate-90 sm:rotate-0" />
                <div className="text-center">
                  <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">WebSocket</p>
                  <p className="text-xs text-emerald-600/70">Direct · no proxy</p>
                </div>
                <Icon path={mdiArrowRight} className="w-4 h-4 text-emerald-500 rotate-90 sm:rotate-0" />
              </div>
            </div>

            <div className="flex-1 bg-white p-6 text-center">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Icon path={mdiServer} className="w-5 h-5 text-indigo-600" />
              </div>
              <p className="font-semibold text-slate-900 text-sm mb-0.5">Your Home Assistant</p>
              <p className="text-xs text-slate-400">On your network</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2.5 p-4 bg-slate-50 rounded-xl border border-slate-100">
            <Icon path={mdiWifiOff} className="w-4 h-4 text-slate-400 shrink-0" />
            <p className="text-xs text-slate-500">
              <strong className="text-slate-700">There is no third party in this diagram.</strong>{" "}
              The maintainers have no route to intercept or read live entity data from your home.
            </p>
          </div>
        </section>

        {/* ── 03 · Access control ── */}
        <section>
          <SectionLabel n="03" label="Access control" />
          <div className="grid md:grid-cols-[1fr_1.2fr] gap-8 items-start">
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">There is no login screen</h2>
              <p className="text-slate-600 text-sm leading-relaxed mb-4">
                CasaBoard doesn&apos;t implement user accounts. Anyone who can reach the app over the
                network can view and edit dashboards — the same trust model as Home Assistant
                itself when accessed directly.
              </p>
              <p className="text-slate-600 text-sm leading-relaxed">
                Restricting who can reach it is therefore a network-level decision: keep it on your
                LAN, put it behind a reverse proxy with its own auth, or expose it only through the
                HACS panel embedded in your already-authenticated Home Assistant session.
              </p>
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">
                Recommended setups
              </p>
              <ul className="space-y-2.5">
                <CheckItem color="slate">Run it on a trusted home network only</CheckItem>
                <CheckItem color="slate">Put a reverse proxy with auth in front if exposing it externally</CheckItem>
                <CheckItem color="slate">Embed it via the HACS panel so it&apos;s only reachable through Home Assistant&apos;s UI</CheckItem>
              </ul>
            </div>
          </div>
        </section>

        {/* ── Contact ── */}
        <section className="bg-slate-50 border border-slate-100 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon path={mdiEmail} className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Questions about security?</h2>
              <p className="text-slate-500 text-sm mb-5">
                Found a potential issue, or want a deeper technical explanation of any of the
                above? Reach out directly.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
                >
                  Contact form
                  <Icon path={mdiArrowRight} className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-6 pt-5 border-t border-slate-200">
            Last reviewed July 2026.
          </p>
        </section>

      </div>
    </>
  );
}
