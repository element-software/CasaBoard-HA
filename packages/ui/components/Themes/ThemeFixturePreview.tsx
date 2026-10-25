"use client";

import { themeTokenLabel } from "@repo/types/theme";

function SparklinePreview() {
  const points = [30, 45, 35, 60, 50, 70, 55, 80, 65, 75, 60, 85];
  const w = 260;
  const h = 56;
  const max = Math.max(...points);
  const min = Math.min(...points);
  const range = max - min || 1;
  const coords = points.map((p, i) => ({
    x: (i / (points.length - 1)) * w,
    y: h - ((p - min) / range) * (h - 8) - 4,
  }));
  const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`).join(" ");
  const areaPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height: 56 }}>
      <defs>
        <linearGradient id="preview-sparkline-grad" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="var(--theme-chart-fill)" stopOpacity={0.5} />
          <stop offset="100%" stopColor="var(--theme-chart-fill)" stopOpacity={0.05} />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#preview-sparkline-grad)" />
      <path d={linePath} fill="none" stroke="var(--theme-chart-line)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold text-theme-text-muted uppercase tracking-wider mt-1">
      {children}
    </p>
  );
}

export function ThemeFixturePreview() {
  return (
    <div
      className="rounded-xl border border-theme-border bg-theme-surface p-4 space-y-4 overflow-y-auto"
      style={{ maxHeight: "calc(100vh - 5rem)" }}
    >
      <p className="text-sm font-semibold text-theme-text">Preview</p>

      {/* Surfaces */}
      <div className="space-y-2">
        <SectionLabel>Surfaces</SectionLabel>
        <div className="rounded-lg border border-dashed border-theme-border px-3 py-2 text-xs text-theme-text-secondary bg-theme-page-background">
          {themeTokenLabel("page-background")}
        </div>
        <div className="rounded-lg border border-dashed border-theme-border px-3 py-2 text-xs text-theme-text bg-theme-background">
          {themeTokenLabel("background")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-lg border border-theme-border px-2 py-2 text-xs text-theme-text-secondary bg-theme-surface text-center">
            Surface
          </div>
          <div className="rounded-lg border border-theme-border px-2 py-2 text-xs text-theme-text-secondary bg-theme-elevated text-center">
            Elevated
          </div>
        </div>
        <div
          className="rounded-lg px-2 py-2 text-xs text-theme-text"
          style={{ backgroundColor: "var(--theme-card-background)", border: "1px solid var(--theme-card-border)" }}
        >
          Card background / border
        </div>
        <div
          className="h-px w-full"
          style={{ backgroundColor: "var(--theme-divider)" }}
        />
        <div
          className="h-px w-full"
          style={{ backgroundColor: "var(--theme-border)" }}
        />
        <div className="flex gap-1 text-[10px] text-theme-text-muted">
          <span>divider</span>
          <span className="ml-4">border</span>
        </div>
      </div>

      {/* Text */}
      <div className="space-y-1">
        <SectionLabel>Text</SectionLabel>
        <div
          className="rounded-lg px-3 py-2 space-y-1"
          style={{ backgroundColor: "var(--theme-card-background)", border: "1px solid var(--theme-card-border)" }}
        >
          <p className="text-sm text-theme-text">Primary text</p>
          <p className="text-xs text-theme-text-secondary">Secondary text</p>
          <p className="text-xs text-theme-text-muted">Muted text</p>
          <p className="text-xs text-theme-text-primary font-semibold">Accent / primary</p>
          <p className="text-xs" style={{ color: "var(--theme-secondary)" }}>Secondary brand</p>
          <div
            className="rounded px-2 py-0.5 text-xs inline-block"
            style={{ backgroundColor: "var(--theme-primary)", color: "var(--theme-text-on-primary)" }}
          >
            On-primary text
          </div>
        </div>
      </div>

      {/* Light cards */}
      <div className="space-y-2">
        <SectionLabel>Light</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-xl p-3 flex items-center gap-2"
            style={{ backgroundColor: "var(--theme-primary)", color: "var(--theme-text-on)" }}
          >
            {/* lightbulb icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2V17a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.8A7 7 0 0 1 12 2zm2 19H10a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2z" />
            </svg>
            <div>
              <p className="text-xs font-medium">Living Room</p>
              <p className="text-[10px] opacity-75">On · 80%</p>
            </div>
          </div>
          <div className="rounded-xl p-3 bg-theme-entity-off text-theme-text flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-theme-text-muted" fill="currentColor">
              <path d="M12 2a7 7 0 0 1 7 7c0 2.6-1.4 4.9-3.5 6.2V17a1 1 0 0 1-1 1h-5a1 1 0 0 1-1-1v-1.8A7 7 0 0 1 12 2zm2 19H10a1 1 0 0 0 0 2h4a1 1 0 0 0 0-2z" />
            </svg>
            <div>
              <p className="text-xs font-medium">Bedroom</p>
              <p className="text-[10px] text-theme-text-muted">Off</p>
            </div>
          </div>
        </div>
      </div>

      {/* Alarm */}
      <div className="space-y-2">
        <SectionLabel>Alarm</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5">
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ backgroundColor: "var(--theme-alarm-armed)", color: "var(--theme-text-on-primary)" }}
          >
            {/* shield icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto mb-1" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5L12 1z" />
            </svg>
            <p className="text-[10px] font-medium">Armed</p>
          </div>
          <div
            className="rounded-xl p-2.5 text-center"
            style={{ backgroundColor: "var(--theme-alarm-disarmed)", color: "var(--theme-text)" }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto mb-1 text-theme-text-secondary" fill="currentColor">
              <path d="M12 1L3 5v6c0 5.5 3.8 10.7 9 12 5.2-1.3 9-6.5 9-12V5L12 1z" />
            </svg>
            <p className="text-[10px] font-medium text-theme-text">Disarmed</p>
          </div>
          <div
            className="rounded-xl p-2.5 text-center text-white"
            style={{ backgroundColor: "var(--theme-alarm-triggered)" }}
          >
            {/* alert triangle */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 mx-auto mb-1" fill="currentColor">
              <path d="M13 14h-2V9h2m0 9h-2v-2h2M1 21h22L12 2 1 21z" />
            </svg>
            <p className="text-[10px] font-medium">Triggered</p>
          </div>
        </div>
      </div>

      {/* Binary Sensor */}
      <div className="space-y-2">
        <SectionLabel>Binary Sensor</SectionLabel>
        <div className="grid grid-cols-2 gap-2">
          <div
            className="rounded-xl p-3 flex items-center gap-2"
            style={{ backgroundColor: "var(--theme-entity-on)", color: "var(--theme-text-on-primary)" }}
          >
            {/* motion eye icon */}
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" />
            </svg>
            <div>
              <p className="text-xs font-medium">Motion</p>
              <p className="text-[10px] opacity-75">Detected</p>
            </div>
          </div>
          <div className="rounded-xl p-3 bg-theme-entity-off text-theme-text flex items-center gap-2">
            <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-theme-text-muted" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.7 7.6 1 12c1.7 4.4 6 7.5 11 7.5s9.3-3.1 11-7.5c-1.7-4.4-6-7.5-11-7.5zM12 17c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z" />
            </svg>
            <div>
              <p className="text-xs font-medium">Door</p>
              <p className="text-[10px] text-theme-text-muted">Clear</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sensor */}
      <div className="space-y-2">
        <SectionLabel>Sensor</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5">
          {[
            { value: "21°", label: "Temp" },
            { value: "58%", label: "Humidity" },
            { value: "1.2kW", label: "Power" },
          ].map(({ value, label }) => (
            <div
              key={label}
              className="rounded-xl p-3 text-center border border-theme-border"
              style={{ backgroundColor: "var(--theme-card-background)" }}
            >
              <p className="text-base font-bold text-theme-text-primary leading-none">{value}</p>
              <p className="text-[10px] text-theme-text-muted mt-1">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Graph */}
      <div className="space-y-2">
        <SectionLabel>Graph</SectionLabel>
        <div
          className="rounded-xl p-3 border border-theme-border"
          style={{ backgroundColor: "var(--theme-card-background)" }}
        >
          <div className="flex justify-between mb-2">
            <p className="text-xs text-theme-text">Power Usage</p>
            <p className="text-xs font-semibold text-theme-text-primary">1.2 kW</p>
          </div>
          <SparklinePreview />
          <div
            className="flex justify-between mt-1 pt-1"
            style={{ borderTop: "1px solid var(--theme-chart-grid)" }}
          >
            <p className="text-[10px] text-theme-text-muted">6h ago</p>
            <p className="text-[10px] text-theme-text-muted">Now</p>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="space-y-2">
        <SectionLabel>Buttons</SectionLabel>
        <div className="flex gap-1.5 flex-wrap">
          <button
            className="rounded-lg px-3 py-1.5 text-xs font-medium"
            style={{ backgroundColor: "var(--theme-button-primary)", color: "var(--theme-text-on-primary)" }}
          >
            Primary
          </button>
          <button
            className="rounded-lg px-3 py-1.5 text-xs font-medium border border-theme-border text-theme-text"
            style={{ backgroundColor: "var(--theme-button-secondary)" }}
          >
            Secondary
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-theme-success text-white">
            Success
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-theme-warning text-white">
            Warning
          </button>
          <button className="rounded-lg px-3 py-1.5 text-xs font-medium bg-theme-error text-white">
            Error
          </button>
        </div>
      </div>

      {/* Status chips */}
      <div className="space-y-2">
        <SectionLabel>Status</SectionLabel>
        <div className="flex gap-1.5 flex-wrap">
          <span className="rounded-full px-2 py-0.5 text-[10px] bg-theme-success text-white">Online</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] bg-theme-warning text-white">Away</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] bg-theme-error text-white">Error</span>
          <span className="rounded-full px-2 py-0.5 text-[10px] bg-theme-info text-white">Info</span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px]"
            style={{ backgroundColor: "var(--theme-disabled-background)", color: "var(--theme-disabled-foreground)" }}
          >
            Disabled
          </span>
        </div>
      </div>

      {/* Slider */}
      <div className="space-y-2">
        <SectionLabel>Slider</SectionLabel>
        <div
          className="relative h-2 rounded-full"
          style={{ backgroundColor: "var(--theme-slider-track)" }}
        >
          <div
            className="absolute left-0 top-0 h-2 rounded-full"
            style={{ width: "65%", backgroundColor: "var(--theme-slider-active)" }}
          />
          <div
            className="absolute top-1/2 h-4 w-4 rounded-full border-2 shadow-sm"
            style={{
              left: "65%",
              transform: "translate(-50%, -50%)",
              backgroundColor: "var(--theme-slider-thumb)",
              borderColor: "var(--theme-surface)",
            }}
          />
        </div>
      </div>

      {/* Interactive states */}
      <div className="space-y-2">
        <SectionLabel>Interactive</SectionLabel>
        <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center">
          <div
            className="rounded-lg p-2 text-theme-text"
            style={{ backgroundColor: "var(--theme-interactive-hover)" }}
          >
            Hover
          </div>
          <div
            className="rounded-lg p-2 text-theme-text"
            style={{ backgroundColor: "var(--theme-interactive-active)" }}
          >
            Active
          </div>
          <div
            className="rounded-lg p-2 text-theme-text-muted"
            style={{ backgroundColor: "var(--theme-interactive-inactive)" }}
          >
            Inactive
          </div>
        </div>
        <div
          className="rounded-lg p-2 text-xs text-theme-text border-2"
          style={{ borderColor: "var(--theme-focus-ring)" }}
        >
          Focus ring
        </div>
      </div>
    </div>
  );
}
