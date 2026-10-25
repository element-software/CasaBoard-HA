import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

describe("sidebars store slug key drift", () => {
  let dataDir: string;
  let updateSidebar: typeof import("./sidebars").updateSidebar;
  let getSidebar: typeof import("./sidebars").getSidebar;

  before(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "casaboard-sidebars-"));
    process.env.DATA_DIR = dataDir;

    await writeFile(
      path.join(dataDir, "sidebars.json"),
      JSON.stringify(
        {
          upstairs: {
            id: "9e3c5e7f-4b6d-4335-8b11-d4b8c43aea36",
            name: "Upstairs",
            slug: "shared",
            puck_data: { content: [], root: { props: {} } },
            theme_id: null,
            style_id: null,
            created_at: "2026-07-23T09:29:53.806Z",
            updated_at: "2026-07-23T09:29:53.806Z",
          },
        },
        null,
        2
      ),
      "utf-8"
    );

    ({ updateSidebar, getSidebar } = await import("./sidebars"));
  });

  after(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("updates by slug field when map key is desynced and re-keys the map", async () => {
    const updated = await updateSidebar("shared", { name: "Shared" });
    assert.equal(updated.name, "Shared");
    assert.equal(updated.slug, "shared");
    assert.equal(updated.id, "9e3c5e7f-4b6d-4335-8b11-d4b8c43aea36");

    const bySlug = await getSidebar("shared");
    assert.ok(bySlug);
    assert.equal(bySlug.name, "Shared");

    const raw = JSON.parse(
      await readFile(path.join(dataDir, "sidebars.json"), "utf-8")
    ) as Record<string, { slug: string; name: string }>;
    assert.deepEqual(Object.keys(raw), ["shared"]);
    assert.equal(raw.shared.slug, "shared");
    assert.equal(raw.shared.name, "Shared");
  });

  it("renames slug and rejects conflicts", async () => {
    await writeFile(
      path.join(dataDir, "sidebars.json"),
      JSON.stringify(
        {
          shared: {
            id: "9e3c5e7f-4b6d-4335-8b11-d4b8c43aea36",
            name: "Shared",
            slug: "shared",
            puck_data: { content: [], root: { props: {} } },
            theme_id: null,
            style_id: null,
            created_at: "2026-07-23T09:29:53.806Z",
            updated_at: "2026-07-23T09:29:53.806Z",
          },
          other: {
            id: "11111111-2222-4333-8444-555555555555",
            name: "Other",
            slug: "other",
            puck_data: { content: [], root: { props: {} } },
            theme_id: null,
            style_id: null,
            created_at: "2026-07-23T09:30:53.806Z",
            updated_at: "2026-07-23T09:30:53.806Z",
          },
        },
        null,
        2
      ),
      "utf-8"
    );

    const renamed = await updateSidebar("shared", { slug: "main" });
    assert.equal(renamed.slug, "main");
    assert.equal(await getSidebar("shared"), null);
    assert.ok(await getSidebar("main"));

    await assert.rejects(
      () => updateSidebar("main", { slug: "other" }),
      /already exists/
    );
  });
});
