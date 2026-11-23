// GET /api/health: uptime check. Reports whether the database answers,
// without exposing anything about it.
//
// The answer is cached for TTL_MS per instance, and a healthy answer may also be
// cached by Vercel's CDN for the same time, so hammering this URL costs at most
// one tiny database query per instance every 15 s, not one per request.
import { db } from "./_lib/db.js";
import { json } from "./_lib/http.js";

const TTL_MS = 15_000;
let last = { at: 0, up: false };
let inflight = null;

async function probe() {
  try {
    await db()`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}

export async function GET() {
  if (Date.now() - last.at > TTL_MS) {
    // Concurrent requests share one probe instead of each starting their own.
    inflight ||= probe().then((up) => {
      last = { at: Date.now(), up };
      inflight = null;
    });
    await inflight;
  }
  return last.up
    ? json(200, { ok: true, db: "up" }, { "cache-control": "public, max-age=0, s-maxage=15" })
    : json(503, { ok: false, db: "down" });
}
