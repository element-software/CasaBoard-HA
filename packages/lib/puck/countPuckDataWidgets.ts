import type { Data } from "@measured/puck";

type PuckNode = { type: string; props: Record<string, unknown> };

function isPuckNode(n: unknown): n is PuckNode {
  if (typeof n !== "object" || n === null) return false;
  const o = n as Record<string, unknown>;
  return (
    typeof o.type === "string" &&
    "props" in o &&
    o.props !== null &&
    typeof o.props === "object"
  );
}

/**
 * Counts all Puck component instances on the page, including children placed in
 * layout slots (e.g. Grid columns). Top-level and nested items each count as one.
 */
export function countPuckDataWidgets(data: Data): number {
  const countInItem = (item: PuckNode): number => {
    let n = 1;
    for (const v of Object.values(item.props)) {
      if (!Array.isArray(v) || v.length === 0) continue;
      for (const child of v) {
        if (isPuckNode(child)) {
          n += countInItem(child);
        }
      }
    }
    return n;
  };

  const countInBlock = (items: unknown): number => {
    if (!Array.isArray(items)) return 0;
    let n = 0;
    for (const item of items) {
      if (isPuckNode(item)) n += countInItem(item);
    }
    return n;
  };

  let total = countInBlock(data.content);
  if (data.zones) {
    for (const zone of Object.values(data.zones)) {
      total += countInBlock(zone);
    }
  }
  const root = data.root;
  if (root && typeof root === "object" && "props" in root) {
    const props = (root as { props: Record<string, unknown> | undefined })
      .props;
    if (props && typeof props === "object") {
      for (const v of Object.values(props)) {
        if (!Array.isArray(v) || v.length === 0) continue;
        for (const child of v) {
          if (isPuckNode(child)) total += countInItem(child);
        }
      }
    }
  }
  return total;
}
