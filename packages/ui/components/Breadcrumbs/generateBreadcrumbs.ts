export type Crumb = { label: string; href?: string };

const LABEL_MAP: Record<string, string> = {
  setup: "Setup",
  pages: "Pages",
  sidebars: "Sidebars",
  themes: "Themes",
  "ha-config": "HA Configuration",
  "ha-cleanup": "HA Cleanup",
  settings: "Settings",
  about: "About",
  docs: "Docs",
  create: "Create",
  edit: "Edit",
};

/** Build crumb labels/hrefs from an ingress-stripped app pathname. */
export function generateBreadcrumbs(pathname: string, showHome = true): Crumb[] {
  const segments = pathname.split("/").filter(Boolean);
  const toTitle = (s: string) =>
    s.replace(/[-_]+/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  const crumbs: Crumb[] = [];
  if (showHome && pathname !== "/") crumbs.push({ label: "Home", href: "/" });

  let acc = "";
  for (let i = 0; i < segments.length; i++) {
    const seg = decodeURIComponent(segments[i]);

    // Special case: edit/<slug> -> "Edit <Slug>"
    if (seg === "edit" && i + 1 < segments.length) {
      const slug = decodeURIComponent(segments[i + 1]);
      acc += `/${seg}/${slug}`;
      const isLast = i + 1 === segments.length - 1;
      crumbs.push({
        label: `Edit ${toTitle(slug)}`,
        href: isLast ? undefined : acc,
      });
      i++; // skip slug segment
      continue;
    }

    acc += `/${seg}`;
    const isLast = i === segments.length - 1;
    const label = LABEL_MAP[seg] ?? toTitle(seg);
    crumbs.push({ label, href: isLast ? undefined : acc });
  }

  return crumbs;
}
