import { createHash, timingSafeEqual } from "node:crypto";

export const MAX_BODY_BYTES = 8 * 1024;

export function json(status, data, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

// Writes from the site's own forms only. Every current browser sends Origin on
// a fetch() POST (same-origin included), so a POST without one is a script, not
// a visitor: refused. Sec-Fetch-Site, when sent, must also say same-origin.
// (Scripts can fake both headers; this stops casual abuse and every cross-site
// browser request. Rate limits and the firewall handle the rest.)
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  const site = request.headers.get("sec-fetch-site");
  if (site && site !== "same-origin") return false;
  try {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
    const o = new URL(origin);
    return o.host === host && (o.protocol === "https:" || o.hostname === "localhost" || o.hostname === "127.0.0.1");
  } catch {
    return false;
  }
}

export async function readJson(request) {
  const type = request.headers.get("content-type") || "";
  if (!type.toLowerCase().startsWith("application/json")) return { error: "Expected JSON.", status: 415 };
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BODY_BYTES) return { error: "Too large.", status: 413 };
  // Read the body as a stream and stop at the cap, so a client that lies about
  // (or omits) Content-Length can't make the function buffer megabytes.
  const text = await readCapped(request, MAX_BODY_BYTES);
  if (text === null) return { error: "Too large.", status: 413 };
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { error: "Invalid JSON.", status: 400 };
  }
}

async function readCapped(request, cap) {
  if (!request.body) return "";
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.byteLength;
    if (size > cap) {
      reader.cancel().catch(() => {});
      return null;
    }
    chunks.push(value);
  }
  return Buffer.concat(chunks.map((c) => Buffer.from(c))).toString("utf8");
}

// Vercel sets x-forwarded-for / x-real-ip from the edge; the client can't spoof
// the first hop there. We only ever store a salted hash, never the raw IP.
export function clientIpHash(request) {
  const ip = (request.headers.get("x-real-ip") || request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  const salt = process.env.IP_SALT || "";
  return createHash("sha256").update(salt + "|" + ip).digest("hex").slice(0, 32);
}

// Constant-time comparison of the admin token (hash first so lengths match).
export function checkAdmin(request) {
  const expected = process.env.ADMIN_TOKEN || "";
  if (expected.length < 24) return false; // refuse to run with a weak/missing token
  const auth = request.headers.get("authorization") || "";
  const given = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  const a = createHash("sha256").update(given).digest();
  const b = createHash("sha256").update(expected).digest();
  return timingSafeEqual(a, b) && given.length > 0;
}
