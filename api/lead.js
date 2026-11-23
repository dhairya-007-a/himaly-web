// POST /api/lead: save a distributor enquiry or catalogue request.
//
// Checks run cheapest first, so floods are refused before they cost a database
// call: (Vercel Firewall rate limit, before this code runs) → same-origin →
// per-instance limiter → size/JSON → validation → one database guard query
// (per-visitor limit, duplicate, site-wide flood breaker) → insert.
import { validateLead } from "./_lib/validate.js";
import { json, readJson, sameOrigin, clientIpHash } from "./_lib/http.js";
import { insertLead, guardCounts, RATE_LIMIT, FLOOD } from "./_lib/db.js";
import { createLimiter } from "./_lib/limiter.js";

// Per instance: generous for a person, stops a script hammering one instance.
const burst = createLimiter({ max: 10, windowMs: 60_000 });

const tooMany = () =>
  json(429, { ok: false, error: "Too many requests. Please call or WhatsApp us instead." }, { "retry-after": String(RATE_LIMIT.minutes * 60) });

export async function POST(request) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: "Forbidden." });

  const ipHash = clientIpHash(request);
  if (!burst(ipHash)) return tooMany();

  const parsed = await readJson(request);
  if (parsed.error) return json(parsed.status, { ok: false, error: parsed.error });

  const v = validateLead(parsed.body);
  if (!v.ok) {
    // Bots get a fake success so they don't learn what tripped them.
    if (v.spam && v.error === "Rejected.") return json(200, { ok: true });
    return json(400, { ok: false, error: v.error, field: v.field });
  }

  try {
    const g = await guardCounts(ipHash, v.lead.phone, v.lead.kind);
    if (g.ip >= RATE_LIMIT.max) return tooMany();
    // Same phone, same form, a few minutes apart: a double tap. Say ok, keep one row.
    if (g.dup > 0) return json(200, { ok: true, duplicate: true });
    if (g.recent >= FLOOD.max) {
      console.warn("lead flood breaker tripped", g.recent);
      return json(503, { ok: false, error: "We're very busy right now. Please WhatsApp or call us." }, { "retry-after": String(FLOOD.minutes * 60) });
    }
    const row = await insertLead({
      ...v.lead,
      ip_hash: ipHash,
      user_agent: (request.headers.get("user-agent") || "").slice(0, 300),
    });
    return json(201, { ok: true, id: row.id });
  } catch (err) {
    // Logged to Vercel's function logs; the visitor's form falls back to WhatsApp/email.
    console.error("lead insert failed", err && err.message);
    return json(503, { ok: false, error: "We couldn't save that right now. Please WhatsApp or call us." });
  }
}

export function GET() {
  return json(405, { ok: false, error: "Use POST." }, { allow: "POST" });
}
