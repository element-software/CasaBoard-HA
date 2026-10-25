import { NextResponse } from "next/server";
import { isNewerRelease } from "@repo/lib/releases/compare";

export const dynamic = "force-dynamic";

const GITHUB_REPO = "element-software/CasaBoard-HA";

type GitHubRelease = {
  tag_name: string;
  draft: boolean;
  prerelease: boolean;
};

export async function GET() {
  const installed = process.env.CASABOARD_VERSION ?? "dev";

  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/releases/latest`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "CasaBoard",
        },
        next: { revalidate: 0 },
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        {
          ok: false,
          installed,
          error: "Could not reach GitHub Releases.",
        },
        { status: 502 }
      );
    }

    const release = (await response.json()) as GitHubRelease;
    const latest = release.tag_name.replace(/^v/i, "");
    const updateAvailable = isNewerRelease(installed, latest);

    return NextResponse.json({
      ok: true,
      installed,
      latest,
      update_available: updateAvailable,
      managed_by_supervisor: Boolean(process.env.SUPERVISOR_TOKEN),
      instructions: updateAvailable
        ? [
            "docker compose pull",
            "docker compose up -d",
          ]
        : [],
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "update check failed";
    return NextResponse.json(
      {
        ok: false,
        installed,
        error: message,
      },
      { status: 500 }
    );
  }
}
