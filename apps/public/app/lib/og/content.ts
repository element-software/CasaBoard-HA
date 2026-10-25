import type { Metadata } from "next";

const siteUrl = "https://casaboard.dev";

export type PublicOgRouteKey =
  | "home"
  | "about"
  | "contact"
  | "cookies"
  | "docs"
  | "privacy"
  | "security";

type RouteOgDefinition = {
  path: string;
  metadata: {
    title: string;
    description: string;
  };
  og: {
    title: string;
    description: string;
    alt: string;
  };
};

export const publicOgRoutes: Record<PublicOgRouteKey, RouteOgDefinition> = {
  home: {
    path: "/",
    metadata: {
      title: "CasaBoard — Local-Only Home Assistant Dashboards",
      description:
        "Free, MIT-licensed, privacy-first dashboard builder for Home Assistant. Docker Compose or HACS — no account, no tracking.",
    },
    og: {
      title: "CasaBoard",
      description:
        "Free, MIT-licensed, privacy-first dashboards for Home Assistant. Self-hosted via Docker Compose or HACS.",
      alt: "CasaBoard — Local-Only Home Assistant Dashboards",
    },
  },
  about: {
    path: "/about",
    metadata: {
      title: "About — CasaBoard",
      description:
        "Local-only, open-source (MIT) dashboard builder for Home Assistant — no account, no cloud, no tracking.",
    },
    og: {
      title: "About CasaBoard",
      description: "Privacy-first Home Assistant dashboards — free, MIT-licensed, self-hosted.",
      alt: "About CasaBoard — smart home dashboards",
    },
  },
  contact: {
    path: "/contact",
    metadata: {
      title: "Contact — CasaBoard",
      description:
        "Questions, feedback, or found a bug? Reach out or open an issue on github.com/element-software/CasaBoard-HA.",
    },
    og: {
      title: "Contact",
      description: "Questions or feedback? Email us or open a GitHub issue.",
      alt: "Contact CasaBoard",
    },
  },
  cookies: {
    path: "/cookies",
    metadata: {
      title: "Cookie Policy — CasaBoard",
      description:
        "This site and the CasaBoard app set no cookies and run no analytics.",
    },
    og: {
      title: "Cookie Policy",
      description: "No cookies, no analytics — on this docs site or in the app.",
      alt: "CasaBoard cookie policy",
    },
  },
  docs: {
    path: "/docs",
    metadata: {
      title: "Documentation — CasaBoard",
      description:
        "Install CasaBoard with Docker Compose or HACS, connect Home Assistant, and build dashboards.",
    },
    og: {
      title: "Documentation",
      description: "Docker Compose, HACS, and everything else to self-host CasaBoard.",
      alt: "CasaBoard documentation",
    },
  },
  privacy: {
    path: "/privacy",
    metadata: {
      title: "Privacy Policy — CasaBoard",
      description:
        "CasaBoard is local-only software. No hosted service, no analytics, no data collection from your install.",
    },
    og: {
      title: "Privacy Policy",
      description: "Local-only software — your data stays on your own infrastructure.",
      alt: "CasaBoard privacy policy",
    },
  },
  security: {
    path: "/security",
    metadata: {
      title: "Security — CasaBoard",
      description:
        "How CasaBoard handles your Home Assistant credentials and dashboard data on your own server.",
    },
    og: {
      title: "Security",
      description: "Self-hosted by design — your credentials and data never leave your server.",
      alt: "CasaBoard security overview",
    },
  },
};

export function metadataForRoute(key: PublicOgRouteKey): Metadata {
  const def = publicOgRoutes[key];
  const url = new URL(def.path, siteUrl).toString();
  return {
    title: def.metadata.title,
    description: def.metadata.description,
    openGraph: {
      title: def.metadata.title,
      description: def.metadata.description,
      url,
      type: "website",
      siteName: "CasaBoard",
    },
    twitter: {
      card: "summary_large_image",
      title: def.metadata.title,
      description: def.metadata.description,
    },
  };
}
