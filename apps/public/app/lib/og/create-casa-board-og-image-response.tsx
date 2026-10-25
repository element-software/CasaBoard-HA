import { ImageResponse } from "next/og";
import { CasaBoardOgTemplate } from "./casa-board-og-template";

const OG_SIZE = { width: 1200, height: 630 } as const;

/** Canonical logo URL — same asset as marketing Header; OG generation runs at build time. */
const LOGO_URL = "https://casaboard.dev/casaboard-logo.png";

export async function createCasaBoardOgImageResponse(options: {
  title: string;
  description: string;
}) {
  const res = await fetch(LOGO_URL, { next: { revalidate: 86400 } });
  if (!res.ok) {
    throw new Error(`Failed to load logo for OG image: ${res.status}`);
  }
  const logoBuffer = await res.arrayBuffer();

  return new ImageResponse(
    (
      <CasaBoardOgTemplate
        title={options.title}
        description={options.description}
        logoBuffer={logoBuffer}
      />
    ),
    { ...OG_SIZE }
  );
}
