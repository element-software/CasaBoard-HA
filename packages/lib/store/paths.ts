import { mkdir } from "fs/promises";
import path from "path";

let ensured = false;

export function dataDir(): string {
  return process.env.DATA_DIR || "./data";
}

export async function dataFilePath(filename: string): Promise<string> {
  const dir = dataDir();
  if (!ensured) {
    await mkdir(dir, { recursive: true });
    ensured = true;
  }
  return path.join(dir, filename);
}
