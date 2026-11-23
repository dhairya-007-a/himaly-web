// POST /api/lead: save a distributor enquiry or catalogue request.
// Flow: same-origin check → size/JSON check → validate → rate limit → insert.
import { validateLead } from "./_lib/validate.js";
import { json, readJson, sameOrigin, clientIpHash } from "./_lib/http.js";
import { insertLead, recentFromIp, RATE_LIMIT } from "./_lib/db.js";

export async function POST(request) {
  if (!sameOrigin(request)) return json(403, { ok: false, error: "Forbidden." });

  const parsed = await readJson(request);
  if (parsed.error) return json(parsed.status, { ok: false, error: parsed.error });

  const v = validateLead(parsed.body);
  if (!v.ok) {
    // Bots get a fake success so they don't learn what tripped them.
    if (v.spam && v.error === "Rejected.") return json(200, { ok: true });
    return json(400, { ok: false, error: v.error, field: v.field });
  }

  const ipHash = clientIpHash(request);
  try {
    if ((await recentFromIp(ipHash)) >= RATE_LIMIT.max) {
      return json(429, { ok: false, error: "Too many requests. Please call or WhatsApp us instead." }, { "retry-after": String(RATE_LIMIT.minutes * 60) });
    }
    const row = await insertLead({
      ...v.lead,
      ip_hash: ipHash,
      user_agent: (request.headers.get("user-agent") || "").slice(0, 300),
    });
    return json(201, { ok: true, id: row.id });
  } catch (err) {
    // Logged to Vercel's function logs; the visitor gets the fallback message.
    console.error("lead insert failed", err && err.message);
    return json(503, { ok: false, error: "We couldn't save that right now. Please WhatsApp or call us." });
  }
}

export function GET() {
  return json(405, { ok: false, error: "Use POST." }, { allow: "POST" });
}
