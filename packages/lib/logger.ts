import pino from "pino";

const BLUE = "\u001b[34m";
const ORANGE = "\u001b[38;5;208m";
const RESET = "\u001b[0m";

const isProd = process.env.NODE_ENV === "production";

// Keep simple: avoid transports/workers to prevent Next.js runtime issues.
// Only instantiate pino for server; on client we'll write to console directly.
const baseLogger = pino({ level: isProd ? "info" : "info" } as any);

/** Cap for JSON-serialized log details; larger payloads are omitted. */
export const MAX_LOG_DETAILS_CHARS = 2_048;

function prefix(scope: "SERVER" | "CLIENT") {
  const color = scope === "SERVER" ? BLUE : ORANGE;
  return `${color}${scope}${RESET}`;
}

/**
 * Never put unbounded app state (page/sidebar puck trees) into Supervisor logs.
 * Returns a small summary when args are large or not JSON-serializable.
 */
export function sanitizeLogDetails(args: any[]): any | undefined {
  if (!args.length) return undefined;
  try {
    const json = JSON.stringify(args);
    if (json.length <= MAX_LOG_DETAILS_CHARS) return args;
    return {
      omitted: true,
      reason: "details_too_large",
      approxChars: json.length,
      argCount: args.length,
    };
  } catch {
    return {
      omitted: true,
      reason: "details_not_serializable",
      argCount: args.length,
    };
  }
}

// unified writer to avoid variadic issues in different runtimes
function write(
  level: "info" | "warn" | "error" | "debug",
  scope: "SERVER" | "CLIENT",
  fn: string,
  msg: any,
  args: any[]
) {
  const isBrowser = typeof window !== "undefined";
  if (isBrowser) {
    // Browser: use CSS colors instead of ANSI codes
    const color = scope === "CLIENT" ? "#ff8c00" : "#1e90ff"; // orange / blue
    const title = `${fn}: ${String(msg)}`;
    const style = `color: ${color}; font-weight: 600;`;
    // eslint-disable-next-line no-console
    (console as any)[level](`%c${scope}%c ${title}`, style, "color: inherit;", ...args);
    return;
  }

  // Server: pino with ANSI prefix for readability. Cap details so Supervisor
  // log viewers (and HA itself) are not flooded with full dashboard JSON.
  const message = `${prefix(scope)} ${fn}: ${String(msg)}`;
  const details = sanitizeLogDetails(args);
  (baseLogger as any)[level](
    details === undefined ? { scope, fn } : { scope, fn, details },
    message
  );
}

export function createLogger(scope?: "SERVER" | "CLIENT") {
  const isBrowser = typeof window !== "undefined";
  const resolvedScope: "SERVER" | "CLIENT" =
    scope ? scope : !isBrowser ? "SERVER" : "CLIENT";
  return {
    info(fn: string, msg: any, ...args: any[]) {
      write("info", resolvedScope, fn, msg, args);
    },
    warn(fn: string, msg: any, ...args: any[]) {
      write("warn", resolvedScope, fn, msg, args);
    },
    error(fn: string, msg: any, ...args: any[]) {
      write("error", resolvedScope, fn, msg, args);
    },
    debug(fn: string, msg: any, ...args: any[]) {
      write("debug", resolvedScope, fn, msg, args);
    },
  };
}

export const serverLogger = createLogger("SERVER");
export const clientLogger = createLogger("CLIENT");
