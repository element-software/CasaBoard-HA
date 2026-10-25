/**
 * Patches the Next standalone HTTP server so text responses prefix /_next and
 * other root-absolute asset URLs (and redirect Locations) when Home Assistant
 * sends X-Ingress-Path.
 */
const http = require("node:http");
const { StringDecoder } = require("node:string_decoder");

const INGRESS_HEADER = "x-ingress-path";
const TEXT_TYPE = /text\/|javascript|json|x-component|manifest|svg/;

function normalizeIngressPrefix(raw) {
  if (!raw) return "";
  const trimmed = String(raw).trim();
  if (!trimmed || trimmed === "/") return "";
  return trimmed.endsWith("/") ? trimmed.slice(0, -1) : trimmed;
}

function patchText(text, prefix) {
  return text
    .replace(/(["'])\/_next\//g, `$1${prefix}/_next/`)
    .replace(/(["'])\/(icon\.svg|manifest\.webmanifest)\b/g, `$1${prefix}/$2`);
}

function patchLocation(value, prefix) {
  if (typeof value !== "string") return value;
  // Absolute same-host URLs and root-relative paths both get the prefix once.
  const match = value.match(/^(https?:\/\/[^/]+)?(\/.*)?$/);
  if (!match || !match[2] || match[2].startsWith(`${prefix}/`)) return value;
  return `${prefix}${match[2]}`;
}

function wrapResponse(req, res, prefix) {
  // Uncompressed bodies only — we rewrite them below.
  delete req.headers["accept-encoding"];

  const setHeader = res.setHeader.bind(res);
  res.setHeader = function (name, value) {
    const key = name.toLowerCase();
    if (key === "content-length") return res;
    if (key === "location") value = patchLocation(value, prefix);
    return setHeader(name, value);
  };

  const writeHead = res.writeHead.bind(res);
  res.writeHead = function (status, reason, headers) {
    if (typeof reason === "object") [reason, headers] = [undefined, reason];
    if (headers && !Array.isArray(headers)) {
      for (const key of Object.keys(headers)) {
        const lower = key.toLowerCase();
        if (lower === "content-length") delete headers[key];
        if (lower === "location") headers[key] = patchLocation(headers[key], prefix);
      }
    }
    if (res.hasHeader("content-length")) res.removeHeader("content-length");
    return reason === undefined
      ? writeHead(status, headers)
      : writeHead(status, reason, headers);
  };

  const write = res.write.bind(res);
  const end = res.end.bind(res);
  const decoder = new StringDecoder("utf8");
  let isText;
  let carry = "";

  const toText = (chunk, encoding) =>
    typeof chunk === "string"
      ? Buffer.from(chunk, typeof encoding === "string" ? encoding : "utf8")
      : Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength);

  res.write = function (chunk, encoding, callback) {
    if (isText === undefined) {
      isText = TEXT_TYPE.test(String(res.getHeader("content-type") ?? ""));
    }
    if (!isText || chunk == null) return write(chunk, encoding, callback);
    let text = carry + decoder.write(toText(chunk, encoding));
    // Hold back a trailing partial `"/_next/` so it can't straddle chunks.
    const quote = Math.max(text.lastIndexOf('"'), text.lastIndexOf("'"));
    carry = quote >= 0 && text.length - quote < 24 ? text.slice(quote) : "";
    text = text.slice(0, text.length - carry.length);
    const cb = typeof encoding === "function" ? encoding : callback;
    return write(patchText(text, prefix), "utf8", cb);
  };

  res.end = function (chunk, encoding, callback) {
    if (typeof chunk === "function") [chunk, callback] = [undefined, chunk];
    if (typeof encoding === "function") [encoding, callback] = [undefined, encoding];
    if (chunk != null) res.write(chunk, encoding);
    if (isText === undefined) {
      isText = TEXT_TYPE.test(String(res.getHeader("content-type") ?? ""));
    }
    const tail = isText ? patchText(carry + decoder.end(), prefix) : "";
    carry = "";
    return tail ? end(tail, "utf8", callback) : end(callback);
  };
}

// Under Supervisor only the Ingress proxy (and local health checks) may connect.
const SUPERVISOR_CLIENTS = new Set(["172.30.32.2", "127.0.0.1", "::1"]);
// Direct-port (kiosk) clients: live dashboards and their assets only.
// ponytail: server actions POST to /dashboard and are addressed by action id,
// so any action is reachable from here; split actions behind a token if LAN isn't trusted.
const KIOSK_PATHS =
  /^\/(dashboard(\/|$)|_next\/|icon\.svg$|favicon\.ico$|manifest\.webmanifest$|api\/health$)/;

function isAllowedClient(req) {
  if (!process.env.SUPERVISOR_TOKEN) return true;
  const ip = String(req.socket.remoteAddress ?? "").replace(/^::ffff:/, "");
  if (SUPERVISOR_CLIENTS.has(ip)) return true;
  return KIOSK_PATHS.test(new URL(req.url ?? "/", "http://x").pathname);
}

const originalCreateServer = http.createServer;
http.createServer = function createServerWithIngress(...args) {
  const listener = args[0];
  if (typeof listener === "function") {
    args[0] = function ingressRequestListener(req, res) {
      if (!isAllowedClient(req)) {
        res.writeHead(403, { "content-type": "text/plain" });
        return res.end("Forbidden");
      }
      const prefix = normalizeIngressPrefix(req.headers[INGRESS_HEADER]);
      if (prefix) wrapResponse(req, res, prefix);
      return listener(req, res);
    };
  }
  return originalCreateServer.apply(this, args);
};

require("./server.js");
