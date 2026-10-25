"use client";

import Icon from "@mdi/react";
import {
  mdiHomeAssistant,
  mdiShieldCheck,
  mdiDrag,
  mdiDocker,
  mdiEye,
  mdiCloudOffOutline,
  mdiArrowRight,
  mdiCheckCircle,
  mdiTabletDashboard,
} from "@mdi/js";
import { AppLink } from "../Shared/AppLink";

export type AboutPageContentProps = {
  /** In-app docs live at /setup/docs; the website uses /docs. */
  docsHref?: string;
  /** Security overview — website path or absolute casaboard.dev URL. */
  securityHref?: string;
};

function ContentLink({
  href,
  className,
  children,
}: {
  href: string;
  className?: string;
  children: React.ReactNode;
}) {
  if (href.startsWith("http://") || href.startsWith("https://")) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
        {children}
      </a>
    );
  }
  return (
    <AppLink href={href} className={className}>
      {children}
    </AppLink>
  );
}

export function AboutPageContent({
  docsHref = "/docs",
  securityHref = "/security",
}: AboutPageContentProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">

      {/* ── What is CasaBoard ── */}
      <section className="mb-20">
        <div className="grid md:grid-cols-[1fr_1.4fr] gap-12 items-start">
          <div>
            <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-4">What is CasaBoard?</p>
            <h2 className="text-3xl font-bold text-slate-900 leading-tight">
              Dashboard builder for Home Assistant
            </h2>
          </div>
          <div className="space-y-4 text-slate-600 leading-relaxed">
            <p>
              CasaBoard lets you design beautiful, fully custom smart home dashboards with a drag-and-drop editor — no coding required. It runs as a self-hosted app alongside your own Home Assistant, and displays live entity data on any screen.
            </p>
            <p>
              CasaBoard pages are URLs served from your own server. Open them in a kiosk browser on a wall display, on a tablet in the kitchen, or through the Home Assistant App Ingress sidebar. Free, MIT-licensed, and open on{" "}
              <a
                href="https://github.com/element-software/CasaBoard-HA"
                target="_blank"
                rel="noopener noreferrer"
                className="text-violet-600 hover:underline"
              >
                GitHub
              </a>
              .
            </p>
          </div>
        </div>
      </section>

      {/* ── Divider ── */}
      <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-20" />

      {/* ── Core features ── */}
      <section className="mb-20">
        <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-3">Features</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-10">Built for real smart home users</h2>

        <div className="space-y-4">
          {[
            {
              icon: mdiDrag,
              iconBg: "bg-violet-50",
              iconColor: "text-violet-600",
              title: "Visual drag-and-drop editor",
              desc: "Arrange components freely on a canvas. Resize, reorder, and layer without touching YAML or JSON. What you see is exactly what gets displayed.",
            },
            {
              icon: mdiHomeAssistant,
              iconBg: "bg-cyan-50",
              iconColor: "text-cyan-600",
              title: "Direct Home Assistant integration",
              desc: "CasaBoard connects via the HA WebSocket API — the same protocol the native dashboard uses. Entity state updates appear in real time as they happen in your home.",
            },
            {
              icon: mdiDocker,
              iconBg: "bg-indigo-50",
              iconColor: "text-indigo-600",
              title: "HA App or Docker Compose",
              desc: "Install as a Home Assistant App (Ingress + optional kiosk port) or run with Docker Compose. Optional HACS sensors for health — no cloud account, no ongoing cost.",
            },
            {
              icon: mdiTabletDashboard,
              iconBg: "bg-violet-50",
              iconColor: "text-violet-600",
              title: "Kiosk & wall displays",
              desc: "Every page has a /dashboard/<slug> URL. On HAOS, map the optional kiosk port for full-bleed tablets without the Home Assistant chrome.",
            },
            {
              icon: mdiEye,
              iconBg: "bg-emerald-50",
              iconColor: "text-emerald-600",
              title: "Unlimited pages, no login",
              desc: "Create as many dashboard pages as you like. There's no per-user gate — anyone who can reach the app on your network can view and edit dashboards.",
            },
            {
              icon: mdiShieldCheck,
              iconBg: "bg-green-50",
              iconColor: "text-green-600",
              title: "Nothing leaves your server",
              desc: "Dashboards, sidebars, themes, and your Home Assistant connection are stored as local files on the machine running the container — never sent to a third party.",
            },
          ].map((f) => (
            <div key={f.title} className="group flex items-start gap-5 p-5 bg-white border border-slate-100 rounded-2xl hover:border-violet-100 hover:shadow-sm transition-all">
              <div className={`w-10 h-10 ${f.iconBg} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon path={f.icon} className={`w-5 h-5 ${f.iconColor}`} />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900 mb-1">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Privacy section ── */}
      <section className="mb-20 bg-gradient-to-br from-slate-900 to-indigo-950 rounded-2xl p-8 sm:p-10 relative overflow-hidden">
        {/* Grain */}
        <div
          className="absolute inset-0 opacity-[0.04] rounded-2xl"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2.5 bg-white/10 rounded-xl border border-white/10">
              <Icon path={mdiCloudOffOutline} className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-violet-300 text-xs font-bold uppercase tracking-widest">Our privacy commitment</p>
              <h2 className="text-xl font-bold text-white leading-tight">Self-hosted, always</h2>
            </div>
          </div>
          <p className="text-slate-300 leading-relaxed mb-6 max-w-xl">
            Your smart home data is personal. There are no CasaBoard servers in the picture at all —
            the app and its data live entirely on the machine you run it on.
          </p>
          <ul className="space-y-2.5">
            {[
              "Home Assistant connection stored as a local file on your server",
              "No proxy — CasaBoard talks directly to your Home Assistant instance",
              "No account, no cloud sync, no analytics or tracking",
              "Dashboards, sidebars, and themes stored as JSON files you can back up yourself",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-sm text-slate-300">
                <Icon path={mdiCheckCircle} className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
          <ContentLink
            href={securityHref}
            className="inline-flex items-center gap-2 mt-6 text-sm font-medium text-violet-300 hover:text-white transition-colors"
          >
            Read the full security overview
            <Icon path={mdiArrowRight} className="w-4 h-4" />
          </ContentLink>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="mb-20">
        <p className="text-xs font-bold text-violet-600 uppercase tracking-widest mb-3">How it works</p>
        <h2 className="text-2xl font-bold text-slate-900 mb-10">Up and running in minutes</h2>

        <div className="relative">
          {/* Connecting line (desktop) */}
          <div className="hidden sm:block absolute top-6 left-6 right-6 h-px bg-gradient-to-r from-violet-100 via-violet-200 to-violet-100" />
          <div className="grid sm:grid-cols-4 gap-6">
            {[
              { n: "01", title: "Install", desc: "HA App from the custom repo, or docker compose up -d." },
              { n: "02", title: "Connect HA", desc: "Enter your HA URL and authorise the connection once." },
              { n: "03", title: "Build pages", desc: "Drag components onto the canvas, link them to entities." },
              { n: "04", title: "Display anywhere", desc: "Open /dashboard/<slug> on any screen — or use the kiosk port on wall tablets." },
            ].map((step) => (
              <div key={step.n} className="relative flex flex-col items-start sm:items-center sm:text-center">
                <div className="w-12 h-12 bg-white border-2 border-violet-200 rounded-full flex items-center justify-center mb-4 relative z-10">
                  <span className="text-xs font-bold text-violet-600">{step.n}</span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-1 text-sm">{step.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-violet-50 border border-violet-100 rounded-2xl p-8 sm:p-10 text-center">
        <h2 className="text-xl font-bold text-slate-900 mb-2">Ready to build your dashboard?</h2>
        <p className="text-slate-500 mb-6 text-sm">Everything you need is in the docs. Takes about 10 minutes from zero to live dashboard.</p>
        <div className="flex flex-wrap items-center justify-center gap-3">
          <ContentLink
            href={docsHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
          >
            Read the docs
            <Icon path={mdiArrowRight} className="w-4 h-4" />
          </ContentLink>
          <ContentLink
            href={securityHref}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:border-violet-200 hover:bg-violet-50 transition-all"
          >
            Read the security overview
          </ContentLink>
        </div>
      </section>
    </div>
  );
}

export default AboutPageContent;
