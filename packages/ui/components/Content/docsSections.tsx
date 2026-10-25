"use client";

import Icon from "@mdi/react";
import {
  mdiDocker,
  mdiPuzzleOutline,
  mdiHomeAssistant,
  mdiGrid,
  mdiDrag,
  mdiInformation,
  mdiAlertCircle,
  mdiCheckCircle,
  mdiCog,
  mdiLightbulb,
  mdiEye,
  mdiCheck,
  mdiAlertDecagram,
  mdiTabletDashboard,
} from "@mdi/js";
import React from "react";
import { GITHUB_CLONE_URL, GITHUB_ISSUES_URL, GITHUB_REPO_URL } from "@repo/lib";

export interface DocSection {
  slug: string;
  title: string;
  icon?: string;
  Content: React.FC;
}

// ── Shared primitives ────────────────────────────────────────────────────────

const SectionHeading = ({
  icon,
  iconBg,
  iconColor,
  label,
  title,
  intro,
}: {
  icon: string;
  iconBg: string;
  iconColor: string;
  label: string;
  title: string;
  intro: string;
}) => (
  <div className="mb-10">
    <div className="flex items-start gap-4 mb-5">
      <div className={`p-2.5 rounded-xl ${iconBg} flex-shrink-0 mt-0.5`}>
        <Icon path={icon} className={`w-6 h-6 ${iconColor}`} />
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</p>
        <h2 className="text-2xl font-bold text-slate-900 leading-tight">{title}</h2>
      </div>
    </div>
    <div className="pl-1 border-l-2 border-slate-100">
      <p className="text-slate-600 leading-relaxed pl-4">{intro}</p>
    </div>
  </div>
);

const TimelineStep = ({
  number,
  title,
  text,
  isLast = false,
}: {
  number: number;
  title: string;
  text: string;
  isLast?: boolean;
}) => (
  <div className="flex gap-5">
    <div className="flex flex-col items-center flex-shrink-0">
      <div className="w-8 h-8 bg-violet-600 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm shadow-violet-200">
        {number}
      </div>
      {!isLast && <div className="w-px flex-1 bg-slate-100 mt-2 mb-0" />}
    </div>
    <div className={`${isLast ? "pb-0" : "pb-8"} pt-0.5 min-w-0`}>
      <h3 className="font-semibold text-slate-900 mb-1.5 text-sm">{title}</h3>
      <p className="text-slate-500 text-sm leading-relaxed">{text}</p>
    </div>
  </div>
);

const Callout = ({
  type,
  title,
  children,
}: {
  type: "info" | "warning" | "success" | "error";
  title?: string;
  children: React.ReactNode;
}) => {
  const styles = {
    info: { bg: "bg-blue-50", border: "border-blue-200", icon: mdiInformation, iconColor: "text-blue-500", titleColor: "text-blue-800", textColor: "text-blue-700" },
    warning: { bg: "bg-amber-50", border: "border-amber-200", icon: mdiAlertDecagram, iconColor: "text-amber-500", titleColor: "text-amber-800", textColor: "text-amber-700" },
    success: { bg: "bg-green-50", border: "border-green-200", icon: mdiCheckCircle, iconColor: "text-green-500", titleColor: "text-green-800", textColor: "text-green-700" },
    error: { bg: "bg-red-50", border: "border-red-200", icon: mdiAlertCircle, iconColor: "text-red-500", titleColor: "text-red-800", textColor: "text-red-700" },
  }[type];

  return (
    <div className={`flex gap-3 p-4 ${styles.bg} border ${styles.border} rounded-xl my-6`}>
      <Icon path={styles.icon} className={`w-5 h-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
      <div>
        {title && <p className={`font-semibold text-sm ${styles.titleColor} mb-1`}>{title}</p>}
        <div className={`text-sm ${styles.textColor} leading-relaxed`}>{children}</div>
      </div>
    </div>
  );
};

const CheckList = ({ items }: { items: string[] }) => (
  <ul className="space-y-2 my-4">
    {items.map((item) => (
      <li key={item} className="flex items-start gap-2.5 text-sm text-slate-600">
        <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
          <Icon path={mdiCheck} className="w-3 h-3 text-green-600" />
        </div>
        {item}
      </li>
    ))}
  </ul>
);

const CodeBlock = ({ children }: { children: string }) => (
  <pre className="my-4 p-4 bg-slate-900 rounded-xl overflow-x-auto text-xs leading-relaxed text-slate-100">
    <code>{children}</code>
  </pre>
);

// ── Sections ─────────────────────────────────────────────────────────────────

const QuickStart: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiLightbulb}
      iconBg="bg-amber-50"
      iconColor="text-amber-500"
      label="Introduction"
      title="Quick Start Guide"
      intro="Get your CasaBoard dashboard up and running in under 10 minutes. Follow these three steps to go from zero to a working smart home dashboard — no account, no sign-up."
    />

    <div className="mb-8">
      <TimelineStep number={1} title="Run CasaBoard with Docker" text="Clone the repository, run docker compose up -d, and open the app on the port it exposes (default 3000)." />
      <TimelineStep number={2} title="Connect Home Assistant" text="On first run you're taken straight to the connection screen — enter your Home Assistant URL and authorise once." />
      <TimelineStep number={3} title="Create your first page" text="Go to Pages and click 'New Page'. Give it a name like 'Living Room' and open the drag-and-drop editor to start building." isLast />
    </div>

    <Callout type="success" title="Free and self-hosted">
      There&apos;s no account, no subscription, and no data leaving your server. CasaBoard runs entirely on infrastructure you control.
    </Callout>

    <Callout type="info" title="What you'll need">
      <CheckList items={[
        "A running Home Assistant instance (local or remote)",
        "Your HA instance URL (e.g. https://ha.yourname.com)",
        "Docker and Docker Compose installed on the machine that will run CasaBoard",
      ]} />
    </Callout>
  </div>
);

const DockerInstall: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiDocker}
      iconBg="bg-blue-50"
      iconColor="text-blue-500"
      label="Installation"
      title="Installing with Docker"
      intro="CasaBoard ships as a single Docker image with a docker-compose.yml at the root of the repository. It works alongside any Home Assistant installation — Core, Container, OS, or Supervised."
    />

    <TimelineStep number={1} title="Clone the repository" text="Get the source onto the machine that will run CasaBoard (this can be the same host as Home Assistant, or a different one on the same network)." />
    <TimelineStep number={2} title="Start the container" text="Run docker compose up -d from the repository root." />
    <TimelineStep number={3} title="Open the app" text="Visit the container's address on port 3000 (e.g. http://localhost:3000 or http://<host-ip>:3000)." isLast />

    <CodeBlock>{`git clone ${GITHUB_CLONE_URL}
cd CasaBoard-HA
docker compose up -d
# then open http://localhost:3000`}</CodeBlock>

    <Callout type="info" title="Persistent data">
      Dashboards, sidebars, themes, and your Home Assistant connection are stored as JSON files under
      the ./data folder, mounted into the container as a volume. Back this folder up to back up
      everything.
    </Callout>
  </div>
);

const HAAppInstall: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiPuzzleOutline}
      iconBg="bg-purple-50"
      iconColor="text-purple-600"
      label="Installation"
      title="Home Assistant OS (App)"
      intro="On Home Assistant OS, install CasaBoard as an App from a custom Supervisor repository. The UI opens via Ingress (sidebar → CasaBoard → Open Web UI)."
    />

    <TimelineStep number={1} title="Add the repository" text={`Settings → Apps → Add-on store → ⋮ → Repositories. Add ${GITHUB_REPO_URL}.`} />
    <TimelineStep number={2} title="Install and start" text="Install CasaBoard, start it, then open it with Open Web UI (Ingress)." />
    <TimelineStep number={3} title="Connect Home Assistant" text="Inside CasaBoard, connect with your HA URL and a long-lived access token (or HA sign-in)." isLast />

    <Callout type="info" title="Optional HACS sensors">
      The optional HACS CasaBoard integration exposes health sensors (online, page count, HA connection).
      It does not add a sidebar iframe panel — use the App&apos;s Ingress for the UI. Sensors need a
      plain HTTP base URL (Compose or the kiosk port); the Ingress URL is not a stable poll target.
    </Callout>
  </div>
);

const HAConnection: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiHomeAssistant}
      iconBg="bg-cyan-50"
      iconColor="text-cyan-600"
      label="Setup"
      title="Home Assistant Connection"
      intro="CasaBoard connects to exactly one Home Assistant instance — the one you configure on first run. The connection is stored as a local file alongside the rest of your data."
    />

    <TimelineStep number={1} title="Find your HA URL" text="Locate your Home Assistant base URL. This is typically something like https://homeassistant.local:8123 for local installs, or https://ha.yourdomain.com for remote access." />
    <TimelineStep number={2} title="Authorise the connection" text="On first run, CasaBoard redirects you to your Home Assistant login screen. Sign in and approve the connection — you'll be sent back automatically." isLast />

    <Callout type="info" title="HTTPS Ingress">
      When you open CasaBoard through Home Assistant Ingress, the dashboard talks to HA on the same
      origin as the tab. A stored LAN http:// URL will not mark the page insecure. Compose installs
      that only put CasaBoard on HTTPS still need an https:// Home Assistant URL.
    </Callout>

    <Callout type="warning" title="Re-authorising">
      If you ever need to point CasaBoard at a different Home Assistant instance, or the stored
      connection expires, use the reconnect option on the connection screen to run through
      authorisation again.
    </Callout>
  </div>
);

const EnvironmentVariables: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiCog}
      iconBg="bg-slate-100"
      iconColor="text-slate-600"
      label="Configuration"
      title="Environment Variables"
      intro="CasaBoard needs very little configuration. These are the environment variables the docker-compose.yml sets for you by default."
    />

    <div className="space-y-3">
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="font-semibold text-sm text-slate-800 font-mono">DATA_DIR</p>
        </div>
        <div className="p-4 text-sm text-slate-600">
          Where dashboards, sidebars, themes, and the Home Assistant connection are stored.
          Defaults to <code className="font-mono text-xs bg-slate-100 px-1 py-0.5 rounded">/data</code> inside
          the container — mount a volume here to persist data across restarts.
        </div>
      </div>
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="font-semibold text-sm text-slate-800 font-mono">PORT</p>
        </div>
        <div className="p-4 text-sm text-slate-600">
          Optional — which port the app listens on inside the container. Defaults to 3000.
        </div>
      </div>
    </div>
  </div>
);

const CreateFirstPage: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiGrid}
      iconBg="bg-purple-50"
      iconColor="text-purple-600"
      label="Pages"
      title="Creating Your First Page"
      intro="Pages are the heart of CasaBoard — each one is a full dashboard you can embed on a TV, tablet, or the HA sidebar. Here's how to create your first."
    />

    <TimelineStep number={1} title="Open Pages management" text="From the Setup dashboard, click 'Pages' in the sidebar or use the 'All Pages' quick action." />
    <TimelineStep number={2} title="Create a new page" text='Click the "+ New" button at the top right. Enter a name for your page — e.g. "Living Room", "Kitchen Overview", or "Security".' />
    <TimelineStep number={3} title="Open the editor" text="Click the pencil (edit) icon next to your new page. This opens the drag-and-drop builder where you'll add components." isLast />

    <Callout type="info" title="Page visibility">
      Pages can be set to Live (accessible at /dashboard/your-slug) or Draft. You can toggle this from the Pages list.
    </Callout>
  </div>
);

const AddingComponents: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiDrag}
      iconBg="bg-orange-50"
      iconColor="text-orange-500"
      label="Editor"
      title="Adding Components"
      intro="The page editor uses a drag-and-drop system powered by Puck. Drag components from the left panel onto your canvas to build your layout."
    />

    <div className="grid sm:grid-cols-2 gap-4 mb-8">
      {[
        { icon: mdiLightbulb, label: "Lights", desc: "Toggle and dim individual lights or groups" },
        { icon: mdiCog, label: "Switches", desc: "Control smart plugs, fans, and binary switches" },
        { icon: mdiGrid, label: "Entity Cards", desc: "Display sensor readings, temperatures, and states" },
        { icon: mdiInformation, label: "Status badges", desc: "Compact indicators for quick at-a-glance info" },
      ].map((c) => (
        <div key={c.label} className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center flex-shrink-0 shadow-sm">
            <Icon path={c.icon} className="w-4 h-4 text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-sm text-slate-900 mb-0.5">{c.label}</p>
            <p className="text-xs text-slate-500 leading-relaxed">{c.desc}</p>
          </div>
        </div>
      ))}
    </div>

    <TimelineStep number={1} title="Drag from the left panel" text="Click and drag any component from the left sidebar onto the canvas. Drop it where you want it to appear." />
    <TimelineStep number={2} title="Configure the entity" text="Click the component to open its settings. Select the Home Assistant entity you want to link (e.g. light.living_room)." />
    <TimelineStep number={3} title="Customise appearance" text="Adjust the label, icon colour, size, and display format in the component settings panel." isLast />
  </div>
);

const KioskDisplays: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiTabletDashboard}
      iconBg="bg-violet-50"
      iconColor="text-violet-600"
      label="Displays"
      title="Kiosk & Wall Displays"
      intro="Every CasaBoard page lives at its own URL, /dashboard/<page-slug>. Point a kiosk browser such as Fully Kiosk Browser at that URL and the page fills the screen, with no editor or Home Assistant chrome around it."
    />

    <h3 className="font-semibold text-slate-900 mb-3">Home Assistant OS (App)</h3>
    <p className="text-sm text-slate-600 leading-relaxed mb-4">
      Ingress always wraps CasaBoard in the Home Assistant sidebar and header. To get a full-bleed page, turn on the optional kiosk port.
    </p>
    <TimelineStep number={1} title="Set a kiosk port" text="Open Settings → Apps → CasaBoard → Configuration → Network, enter a host port such as 3000, save, then restart the App." />
    <TimelineStep number={2} title="Point the tablet at a page" text="In your kiosk browser, set the Start URL to http://<ha-ip>:<port>/dashboard/<page-slug> (use the port from step 1)." />
    <TimelineStep number={3} title="Lock it down in the browser" text="Turn on the kiosk browser's own fullscreen, screen-on, and reload-on-network-reconnect options." isLast />

    <CodeBlock>{`http://192.168.1.10:<port>/dashboard/kitchen`}</CodeBlock>

    <Callout type="warning" title="Only on a trusted network">
      The kiosk port has no login. It only serves /dashboard pages (the editor and setup stay behind Ingress), but anyone on your LAN can open those pages, and the page gives their browser your Home Assistant access token. Clear the port to turn it off.
    </Callout>

    <h3 className="font-semibold text-slate-900 mb-3 mt-8">Docker Compose</h3>
    <p className="text-sm text-slate-600 leading-relaxed mb-4">
      Compose installs are already served directly, so open http://&lt;host-ip&gt;:3000/dashboard/&lt;page-slug&gt; in your kiosk browser.
    </p>

    <Callout type="info" title="Use a long-lived access token">
      Kiosks should connect to Home Assistant with a long-lived access token. Sign-in (OAuth) re-authentication redirects to the setup screen, and the kiosk port blocks that page.
    </Callout>
  </div>
);

const Tips: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiInformation}
      iconBg="bg-blue-50"
      iconColor="text-blue-500"
      label="Best Practices"
      title="Tips & Best Practices"
      intro="These patterns will help you get the most out of CasaBoard and keep your dashboards fast and maintainable."
    />

    <div className="space-y-8">
      <div>
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
          Organisation
        </h3>
        <CheckList items={[
          "Create separate pages for different rooms or functions (e.g. 'Kitchen', 'Security', 'Energy')",
          "Use descriptive page names — these become the URL slug",
          "Group related components visually so the page is scannable at a glance",
          "Keep each page focused — fewer components means faster load and less cognitive overhead",
        ]} />
      </div>

      <div>
        <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
          <span className="w-1.5 h-1.5 bg-violet-500 rounded-full" />
          Performance
        </h3>
        <CheckList items={[
          "Avoid loading more than 20–30 entity cards on a single page",
          "Use entity cards for multiple related entities rather than individual components",
          "Test your dashboard on the device you'll actually display it on (TV, tablet, phone)",
        ]} />
      </div>

      <Callout type="info" title="Display tip">
        For always-on wall displays, open the page&apos;s /dashboard URL in a kiosk browser in fullscreen mode. See Kiosk &amp; Wall Displays for the Home Assistant OS kiosk port.
      </Callout>
    </div>
  </div>
);

const Troubleshooting: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiAlertCircle}
      iconBg="bg-red-50"
      iconColor="text-red-500"
      label="Support"
      title="Troubleshooting"
      intro="Running into issues? These are the most common problems and how to fix them."
    />

    <div className="space-y-5">
      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="font-semibold text-sm text-slate-800">Can&apos;t connect to Home Assistant</p>
        </div>
        <ul className="p-4 space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Verify the URL is reachable from the machine running the CasaBoard container</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Check that HA is running and accessible (try opening the URL directly)</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> If using HTTPS, confirm your SSL certificate is valid</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Use the reconnect option on the connection screen to re-authorise</li>
        </ul>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="font-semibold text-sm text-slate-800">Browser shows CasaBoard as Not Secure on HTTPS</p>
        </div>
        <ul className="p-4 space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> On Home Assistant OS, open CasaBoard via Ingress (sidebar / Open Web UI). Ingress uses the same HTTPS origin as HA for the websocket, cameras, and media — a stored LAN http:// URL is fine.</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> If you reverse-proxy only CasaBoard (Compose) while HA stays on http://, set the HA URL to the https:// address you browse, or serve HA on the same origin.</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Do not embed CasaBoard with a panel_iframe pointing at http://…:3000 — use App Ingress instead.</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> A full “Your connection is not private” interstitial is Home Assistant’s own certificate (self-signed / untrusted), not CasaBoard. Fix that in HA (Let’s Encrypt or Nabu Casa).</li>
        </ul>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="font-semibold text-sm text-slate-800">Entity shows as unavailable</p>
        </div>
        <ul className="p-4 space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Check the entity exists and is enabled in Home Assistant</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Verify the entity ID matches exactly (case-sensitive)</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Reload the page to re-establish the WebSocket connection</li>
        </ul>
      </div>

      <div className="border border-slate-100 rounded-xl overflow-hidden">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
          <p className="font-semibold text-sm text-slate-800">Dashboards disappeared after restart</p>
        </div>
        <ul className="p-4 space-y-2 text-sm text-slate-600">
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Confirm the ./data volume is mounted in your docker-compose.yml</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Check the container has write permissions to the mounted folder</li>
          <li className="flex items-start gap-2"><span className="text-slate-300 mt-0.5 font-bold">→</span> Avoid docker compose down -v, which removes volumes</li>
        </ul>
      </div>
    </div>
  </div>
);

const Help: React.FC = () => (
  <div>
    <SectionHeading
      icon={mdiEye}
      iconBg="bg-indigo-50"
      iconColor="text-indigo-500"
      label="Support"
      title="Getting Help"
      intro="If you can't find an answer in the docs, the project's GitHub repository is the best place to ask."
    />

    <div className="grid sm:grid-cols-2 gap-4">
      <div className="p-5 bg-white border border-slate-100 shadow-sm rounded-xl">
        <h3 className="font-semibold text-slate-900 mb-1">GitHub Issues</h3>
        <p className="text-sm text-slate-500 mb-3">Report a bug or ask a question on the public repository.</p>
        <a
          href={GITHUB_ISSUES_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          {GITHUB_ISSUES_URL.replace("https://", "")} →
        </a>
      </div>
      <div className="p-5 bg-white border border-slate-100 shadow-sm rounded-xl">
        <h3 className="font-semibold text-slate-900 mb-1">Source & license</h3>
        <p className="text-sm text-slate-500 mb-3">CasaBoard is free and MIT licensed. Browse the code, fork it, or open a pull request.</p>
        <a
          href={GITHUB_REPO_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="text-sm font-medium text-violet-600 hover:text-violet-700"
        >
          {GITHUB_REPO_URL.replace("https://", "")} →
        </a>
      </div>
    </div>

    <Callout type="info" title="Before reaching out">
      Include your Docker/HA versions, your host OS, and any error messages from the container logs
      (docker compose logs). This helps maintainers respond much faster.
    </Callout>
  </div>
);

export const sections: DocSection[] = [
  { slug: "quick-start", title: "Quick Start", icon: mdiLightbulb, Content: QuickStart },
  { slug: "docker-install", title: "Installing with Docker", icon: mdiDocker, Content: DockerInstall },
  { slug: "ha-app", title: "Home Assistant OS (App)", icon: mdiPuzzleOutline, Content: HAAppInstall },
  { slug: "ha-connection", title: "Home Assistant Connection", icon: mdiHomeAssistant, Content: HAConnection },
  { slug: "env-vars", title: "Environment Variables", icon: mdiCog, Content: EnvironmentVariables },
  { slug: "first-page", title: "Creating Your First Page", icon: mdiGrid, Content: CreateFirstPage },
  { slug: "components", title: "Adding Components", icon: mdiDrag, Content: AddingComponents },
  { slug: "kiosk", title: "Kiosk & Wall Displays", icon: mdiTabletDashboard, Content: KioskDisplays },
  { slug: "tips", title: "Tips & Best Practices", icon: mdiInformation, Content: Tips },
  { slug: "troubleshooting", title: "Troubleshooting", icon: mdiAlertCircle, Content: Troubleshooting },
  { slug: "help", title: "Getting Help", icon: mdiEye, Content: Help },
];
