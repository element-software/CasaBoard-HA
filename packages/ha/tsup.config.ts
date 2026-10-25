import { defineConfig } from "tsup";
import fs from "node:fs";
import path from "node:path";

/**
 * Build the publishable library. The whole package is client-side
 * (React hooks + browser websocket), so each JS entry gets a "use client" banner.
 */
export default defineConfig({
  entry: ["index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  sourcemap: true,
  clean: true,
  splitting: false,
  treeshake: true,
  outDir: "dist",
  external: [
    "react",
    "react/jsx-runtime",
    "react-dom",
    "home-assistant-js-websocket",
  ],
  banner: {
    js: '"use client";',
  },
  async onSuccess() {
    // Some bundlers strip the banner; ensure Next.js sees the directive.
    for (const file of ["index.js", "index.cjs"]) {
      const target = path.join("dist", file);
      if (!fs.existsSync(target)) continue;
      const source = fs.readFileSync(target, "utf8");
      if (source.startsWith('"use client";') || source.startsWith("'use client';")) {
        continue;
      }
      fs.writeFileSync(target, `"use client";\n${source}`);
    }
  },
});
