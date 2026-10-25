import assert from "node:assert/strict";
import { describe, it } from "node:test";
import type { Connection } from "home-assistant-js-websocket";
import { ignoreRepairIssue, listRepairIssues } from "./repairs";

function mockConnection(
  handler: (msg: Record<string, unknown>) => unknown
): Connection {
  return {
    sendMessagePromise: async (msg: Record<string, unknown>) => handler(msg),
  } as unknown as Connection;
}

describe("listRepairIssues", () => {
  it("sends repairs/list_issues and returns issues array", async () => {
    let captured: Record<string, unknown> | null = null;
    const connection = mockConnection((msg) => {
      captured = msg;
      return {
        issues: [
          {
            domain: "homeassistant",
            issue_id: "deprecated_yaml",
            severity: "warning",
            is_fixable: true,
            ignored: false,
          },
        ],
      };
    });

    const issues = await listRepairIssues(connection);
    assert.deepEqual(captured, { type: "repairs/list_issues" });
    assert.equal(issues.length, 1);
    assert.equal(issues[0]?.issue_id, "deprecated_yaml");
  });

  it("returns empty array when result has no issues", async () => {
    const connection = mockConnection(() => ({}));
    const issues = await listRepairIssues(connection);
    assert.deepEqual(issues, []);
  });
});

describe("ignoreRepairIssue", () => {
  it("sends repairs/ignore_issue with domain, issue_id, ignore", async () => {
    let captured: Record<string, unknown> | null = null;
    const connection = mockConnection((msg) => {
      captured = msg;
      return null;
    });

    await ignoreRepairIssue(
      connection,
      "homeassistant",
      "deprecated_yaml",
      true
    );
    assert.deepEqual(captured, {
      type: "repairs/ignore_issue",
      domain: "homeassistant",
      issue_id: "deprecated_yaml",
      ignore: true,
    });
  });
});
