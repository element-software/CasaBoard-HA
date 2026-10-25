import { QuickActions } from "@repo/ui/components/QuickActions/index";
import { PageActions, HAConnectionActions } from "@repo/lib";
import { PagesManagement } from "@repo/ui/components/Pages/PagesManagement";
import { HAConnectForm } from "@repo/ui/components/HAConnect/HAConnectForm";
import { Syne } from "next/font/google";
import { cn } from "@heroui/react";

export const dynamic = "force-dynamic";

const syne = Syne({ subsets: ["latin"], weight: ["700", "800"] });

export default async function SetupPage() {
  const [pages, haConnection] = await Promise.all([
    PageActions.getAllPages(),
    HAConnectionActions.getHAConnection(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

      {/* ── Hero banner ── */}
      <div className="relative rounded-2xl overflow-hidden">
        {/* Base gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-700 via-violet-800 to-indigo-900" />

        {/* Radial mesh for depth */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(ellipse at 15% 60%, rgba(167,139,250,0.35) 0%, transparent 55%), radial-gradient(ellipse at 85% 20%, rgba(99,102,241,0.40) 0%, transparent 55%)",
          }}
        />

        {/* SVG grain texture */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23n)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Content */}
        <div className="relative z-10 p-8 sm:p-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
          <div>
            <p className="text-violet-300 text-xs font-semibold uppercase tracking-widest mb-3">
              Control Centre
            </p>
            <h1
              className={cn(
                syne.className,
                "text-4xl sm:text-5xl font-bold text-white tracking-tight leading-none mb-3"
              )}
            >
              Setup Dashboard
            </h1>
            <p className="text-violet-200/80 text-base max-w-sm">
              Manage your dashboard pages and Home Assistant configuration
            </p>
          </div>

          {/* Stat pills */}
          <div className="flex gap-3 flex-shrink-0">
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl px-6 py-4 text-center min-w-[90px]">
              <p className={cn(syne.className, "text-3xl font-bold text-white leading-none")}>
                {pages.length}
              </p>
              <p className="text-violet-200 text-xs mt-1 font-medium">Pages</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Main grid ── */}
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <PagesManagement
          initialPages={pages}
          initialError={null}
          compact
        />
        <HAConnectForm compact initialConnection={haConnection} />
      </div>

      {/* ── Quick Actions ── */}
      <QuickActions />
    </div>
  );
}
