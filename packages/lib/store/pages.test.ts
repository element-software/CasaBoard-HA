import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";

describe("pages store slug rename", () => {
  let dataDir: string;
  let updatePage: typeof import("./pages").updatePage;
  let getPage: typeof import("./pages").getPage;

  before(async () => {
    dataDir = await mkdtemp(path.join(tmpdir(), "casaboard-pages-"));
    process.env.DATA_DIR = dataDir;

    await writeFile(
      path.join(dataDir, "pages.json"),
      JSON.stringify(
        {
          home: {
            id: "1f2e3d4c-5b6a-7980-91a2-b3c4d5e6f708",
            name: "Home",
            slug: "home",
            puck_data: { content: [], root: { props: {} } },
            published: true,
            sidebar_id: null,
            theme_id: null,
            theme_overrides: null,
            style_id: null,
            created_at: "2026-07-23T09:29:53.806Z",
            updated_at: "2026-07-23T09:29:53.806Z",
          },
          about: {
            id: "a1b2c3d4-e5f6-7890-a1b2-c3d4e5f67890",
            name: "About",
            slug: "about",
            puck_data: { content: [], root: { props: {} } },
            published: true,
            sidebar_id: null,
            theme_id: null,
            theme_overrides: null,
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

    ({ updatePage, getPage } = await import("./pages"));
  });

  after(async () => {
    await rm(dataDir, { recursive: true, force: true });
  });

  it("re-keys the map when slug changes", async () => {
    const updated = await updatePage("home", { slug: "welcome" });
    assert.equal(updated.slug, "welcome");
    assert.equal(updated.id, "1f2e3d4c-5b6a-7980-91a2-b3c4d5e6f708");

    assert.equal(await getPage("home"), null);
    const bySlug = await getPage("welcome");
    assert.ok(bySlug);
    assert.equal(bySlug.slug, "welcome");

    const raw = JSON.parse(
      await readFile(path.join(dataDir, "pages.json"), "utf-8")
    ) as Record<string, { slug: string }>;
    assert.equal(raw.home, undefined);
    assert.equal(raw.welcome.slug, "welcome");
  });

  it("rejects renaming to an existing slug", async () => {
    await assert.rejects(
      () => updatePage("welcome", { slug: "about" }),
      /already exists/
    );
  });
});
