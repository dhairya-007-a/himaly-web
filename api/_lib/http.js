import { createHash, timingSafeEqual } from "node:crypto";

export const MAX_BODY_BYTES = 8 * 1024;

export function json(status, data, extra = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store", ...extra },
  });
}

// Browsers always send Origin on a cross-site POST. If it's there it must be
// this site; a missing Origin (curl, server-to-server) still has to pass
// validation + rate limit, so it isn't a hole, just not a browser.
export function sameOrigin(request) {
  const origin = request.headers.get("origin");
  if (!origin) return true;
  try {
    const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || new URL(request.url).host;
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}

export async function readJson(request) {
  const type = request.headers.get("content-type") || "";
  if (!type.toLowerCase().startsWith("application/json")) return { error: "Expected JSON.", status: 415 };
  const len = Number(request.headers.get("content-length") || 0);
  if (len > MAX_BODY_BYTES) return { error: "Too large.", status: 413 };
  const text = await request.text();
  if (Buffer.byteLength(text) > MAX_BODY_BYTES) return { error: "Too large.", status: 413 };
  try {
    return { body: JSON.parse(text) };
  } catch {
    return { error: "Invalid JSON.", status: 400 };
  }
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
