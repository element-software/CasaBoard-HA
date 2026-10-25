import type { Metadata } from "next";
import Icon from "@mdi/react";
import Link from "next/link";
import {
  mdiShieldAccount,
  mdiEyeOff,
  mdiCheckCircle,
  mdiEmail,
  mdiFolderOutline,
} from "@mdi/js";
import { metadataForRoute } from "../lib/og/content";

export const metadata: Metadata = metadataForRoute("privacy");

function SectionLabel({ n, label }: { n: string; label: string }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <span className="font-mono text-xs text-violet-400 tracking-widest select-none">{n}</span>
      <div className="h-px flex-1 bg-slate-100" />
      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</span>
    </div>
  );
}

function CheckItem({ children }: { children: React.ReactNode }) {
  return (
    <li className="flex items-start gap-2.5 text-sm text-slate-600 leading-relaxed">
      <Icon path={mdiCheckCircle} className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
      {children}
    </li>
  );
}

export default function PrivacyPage() {
  return (
    <>
      {/* ── Full-width hero ── */}
      <div className="relative w-full overflow-hidden">
        <div className="absolute inset-0 bg-linear-to-br from-violet-700 via-violet-800 to-indigo-900" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 20% 70%, rgba(167,139,250,0.3) 0%, transparent 55%), radial-gradient(ellipse at 80% 15%, rgba(99,102,241,0.35) 0%, transparent 55%)",
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
            Legal
          </p>
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
              <Icon path={mdiShieldAccount} className="w-12 h-12 text-white" />
            </div>
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight mb-4">
            Privacy Policy
          </h1>
          <p className="text-violet-200/80 text-lg max-w-2xl mx-auto mb-10">
            CasaBoard is self-hosted software. We don&apos;t run a hosted service, so we don&apos;t
            collect any data from your installation, and this docs site collects nothing either.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {[
              { icon: mdiEyeOff, label: "No app-side collection" },
              { icon: mdiCheckCircle, label: "Never sold" },
              { icon: mdiEyeOff, label: "No analytics anywhere" },
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

      {/* ── Content ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-16">

        {/* 01 · What we collect */}
        <section>
          <SectionLabel n="01" label="What we collect" />
          <div className="grid md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                  <Icon path={mdiEyeOff} className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">This docs site</p>
                  <p className="text-xs text-slate-400">casaboard.dev only</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                This marketing/documentation site runs no analytics and sets no cookies. It has
                nothing to do with any CasaBoard instance you run.
              </p>
              <ul className="space-y-2">
                <CheckItem>No page-view or navigation tracking</CheckItem>
                <CheckItem>No accounts, no forms other than the contact page</CheckItem>
              </ul>
            </div>

            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-white border border-slate-200 rounded-xl flex items-center justify-center">
                  <Icon path={mdiFolderOutline} className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">Your CasaBoard install</p>
                  <p className="text-xs text-slate-400">Runs on your own server</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                We collect nothing from it. There&apos;s no telemetry, no phone-home, and no account
                to create. Everything it stores lives in local JSON files on your machine:
              </p>
              <ul className="space-y-2">
                <CheckItem>Dashboard, sidebar, and theme layouts you create</CheckItem>
                <CheckItem>Your Home Assistant connection details</CheckItem>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-sm text-amber-800">
              <strong>Home Assistant credentials are never sent to us.</strong> They&apos;re stored
              only in a local file on the server running the container. See our{" "}
              <Link href="/security" className="text-violet-600 hover:underline font-medium">
                Security page
              </Link>{" "}
              for a full explanation.
            </p>
          </div>
        </section>

        {/* 02 · Third parties */}
        <section>
          <SectionLabel n="02" label="Third-party services" />
          <p className="text-slate-600 text-sm leading-relaxed">
            The CasaBoard application itself has no third-party service dependencies at runtime —
            no database provider, no auth provider, no billing provider. It talks only to the
            Home Assistant instance you point it at.
          </p>
        </section>

        {/* 03 · Your choices */}
        <section>
          <SectionLabel n="03" label="Your choices" />
          <div className="p-5 bg-white border border-slate-100 rounded-2xl">
            <p className="font-semibold text-slate-900 text-sm mb-2">Your data, your backups</p>
            <p className="text-sm text-slate-600 leading-relaxed">
              Because everything is stored as local files under your control, deleting or backing
              up your data is a filesystem operation on the volume you mounted — no request to us
              required.
            </p>
          </div>
        </section>

        {/* Contact */}
        <section className="bg-slate-50 border border-slate-100 rounded-2xl p-8">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center shrink-0">
              <Icon path={mdiEmail} className="w-5 h-5 text-violet-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-slate-900 mb-1">Privacy questions</h2>
              <p className="text-slate-500 text-sm mb-5">
                If you have questions about this docs site or the project, get in touch.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 transition-colors"
              >
                Contact form
              </Link>
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
