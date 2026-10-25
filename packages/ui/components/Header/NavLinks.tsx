import { GITHUB_REPO_URL, LinkService } from "@repo/lib";
import Icon from "@mdi/react";
import { mdiBookOpen, mdiEmail, mdiGithub, mdiInformation, mdiShield } from "@mdi/js";


export interface NavLink {
  href: string;
  label: string;
  external?: boolean;
  icon?: React.ReactNode;
}

export const getPublicLinks = (): NavLink[] => [
  {
    href: LinkService.crossAppHref("public", "/about"),
    label: "About",
    external: true,
    icon: <Icon path={mdiInformation} className="w-4 h-4" />,
  },
  {
    href: LinkService.crossAppHref("public", "/docs"),
    label: "Docs",
    external: true,
    icon: <Icon path={mdiBookOpen} className="w-4 h-4" />,
  },
  {
    href: LinkService.crossAppHref("public", "/security"),
    label: "Security",
    external: true,
    icon: <Icon path={mdiShield} className="w-4 h-4" />,
  },
  {
    href: LinkService.crossAppHref("public", "/contact"),
    label: "Contact",
    external: true,
    icon: <Icon path={mdiEmail} className="w-4 h-4" />,
  },
  {
    href: GITHUB_REPO_URL,
    label: "GitHub",
    external: true,
    icon: <Icon path={mdiGithub} className="w-4 h-4" />,
  },
];

export const getAppLinks = (): NavLink[] => [
  { href: LinkService.crossAppHref("app", "/setup"), label: "Setup" },
];
