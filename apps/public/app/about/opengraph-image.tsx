import { publicOgRoutes } from "../lib/og/content";
import { createCasaBoardOgImageResponse } from "../lib/og/create-casa-board-og-image-response";

export const alt = publicOgRoutes.about.og.alt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  const { og } = publicOgRoutes.about;
  return createCasaBoardOgImageResponse({
    title: og.title,
    description: og.description,
  });
}
