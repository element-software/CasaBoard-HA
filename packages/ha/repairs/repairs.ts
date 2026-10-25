import type { Connection } from "home-assistant-js-websocket";

export type RepairSeverity = "error" | "warning" | "critical" | string;

export interface RepairIssue {
  domain: string;
  issue_id: string;
  issue_domain?: string | null;
  severity: RepairSeverity;
  is_fixable: boolean;
  ignored: boolean;
  breaks_in_ha_version?: string | null;
  created?: string;
  learn_more_url?: string | null;
  translation_key?: string | null;
  translation_placeholders?: Record<string, string> | null;
}

interface ListIssuesResult {
  issues: RepairIssue[];
}

export async function listRepairIssues(
  connection: Connection
): Promise<RepairIssue[]> {
  const result = (await connection.sendMessagePromise({
    type: "repairs/list_issues",
  })) as ListIssuesResult | null;
  return result?.issues ?? [];
}

export async function ignoreRepairIssue(
  connection: Connection,
  domain: string,
  issueId: string,
  ignore: boolean
): Promise<void> {
  await connection.sendMessagePromise({
    type: "repairs/ignore_issue",
    domain,
    issue_id: issueId,
    ignore,
  });
}
