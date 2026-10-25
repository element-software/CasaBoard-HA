import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(root, "..", "package.json");
const backupPath = path.join(root, "..", "package.json.publish-backup");

const raw = fs.readFileSync(pkgPath, "utf8");
fs.writeFileSync(backupPath, raw);

const pkg = JSON.parse(raw);
const pc = pkg.publishConfig ?? {};

if (pc.main) pkg.main = pc.main;
if (pc.module) pkg.module = pc.module;
if (pc.types) pkg.types = pc.types;
if (pc.exports) pkg.exports = pc.exports;

// Keep only registry/access for the actual publish step
pkg.publishConfig = {
  access: pc.access ?? "public",
  registry: pc.registry ?? "https://registry.npmjs.org/",
};

fs.writeFileSync(pkgPath, `${JSON.stringify(pkg, null, 2)}\n`);
