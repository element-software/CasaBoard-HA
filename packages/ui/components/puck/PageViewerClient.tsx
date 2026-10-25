"use client";

import { Data, Render } from "@measured/puck";
import { config } from "@/lib/puck/puck.config";
import "@measured/puck/puck.css";

type PageViewerClientProps = {
  data: Data;
};

export default function PageViewerClient({ data }: PageViewerClientProps) {
  return (
      <Render
        config={config}
        data={data}
      />
  );
}
