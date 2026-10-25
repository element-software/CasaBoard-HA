import { readFile, rename, writeFile } from "fs/promises";
import { dataFilePath } from "./paths";

export async function readJson<T>(filename: string, fallback: T): Promise<T> {
  const filePath = await dataFilePath(filename);
  try {
    const raw = await readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException)?.code === "ENOENT") return fallback;
    throw err;
  }
}

export async function writeJson<T>(filename: string, data: T): Promise<void> {
  const filePath = await dataFilePath(filename);
  const tmpPath = `${filePath}.tmp`;
  await writeFile(tmpPath, JSON.stringify(data, null, 2), "utf-8");
  await rename(tmpPath, filePath);
}
