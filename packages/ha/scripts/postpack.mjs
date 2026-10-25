import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.dirname(fileURLToPath(import.meta.url));
const pkgPath = path.join(root, "..", "package.json");
const backupPath = path.join(root, "..", "package.json.publish-backup");

if (fs.existsSync(backupPath)) {
  fs.renameSync(backupPath, pkgPath);
}
