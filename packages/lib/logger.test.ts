import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { MAX_LOG_DETAILS_CHARS, sanitizeLogDetails } from "./logger";

describe("sanitizeLogDetails", () => {
  it("returns undefined when there are no args", () => {
    assert.equal(sanitizeLogDetails([]), undefined);
  });

  it("keeps small args intact", () => {
    const args = ["ok", { count: 2 }];
    assert.deepEqual(sanitizeLogDetails(args), args);
  });

  it("omits oversized page-like payloads instead of logging them", () => {
    const pages = [
      {
        slug: "kitchen",
        puck_data: {
          content: Array.from({ length: 200 }, (_, i) => ({
            type: "Light",
            props: { id: `Light-${i}`, entityId: `light.n${i}` },
          })),
        },
      },
    ];
    const result = sanitizeLogDetails([pages, "error", null]);
    assert.ok(result && typeof result === "object");
    assert.equal(result.omitted, true);
    assert.equal(result.reason, "details_too_large");
    assert.ok(result.approxChars > MAX_LOG_DETAILS_CHARS);
  });
});
