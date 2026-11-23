import { neon } from "@neondatabase/serverless";

// Neon's HTTP driver: one short query per request, no pool to leak in a
// serverless function. DATABASE_URL is added by the Vercel ↔ Neon integration.
let sql;
export function db() {
  if (!sql) {
    const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
    if (!url) throw new Error("DATABASE_URL is not set");
    sql = neon(url);
  }
  return sql;
}

// Limits checked in the database before every insert (one round trip):
//  - same visitor (hashed IP): at most RATE_LIMIT.max leads per RATE_LIMIT.minutes
//  - same phone + form already sent in the last DUP_MINUTES: treated as a
//    double-submit, answered "ok" without a second row
//  - whole site: more than FLOOD.max leads in FLOOD.minutes means a spam wave
//    (a real busy day is a few dozen); new leads get 503 and the visitor's form
//    falls back to WhatsApp, so the database is protected and nobody is stuck.
export const RATE_LIMIT = { max: 5, minutes: 10 };
export const DUP_MINUTES = 10;
export const FLOOD = { max: 300, minutes: 5 };

export async function guardCounts(ipHash, phone, kind) {
  const rows = await db()`
    SELECT
      count(*) FILTER (WHERE ip_hash = ${ipHash} AND created_at > now() - make_interval(mins => ${RATE_LIMIT.minutes}))::int AS ip,
      count(*) FILTER (WHERE phone = ${phone} AND kind = ${kind} AND created_at > now() - make_interval(mins => ${DUP_MINUTES}))::int AS dup,
      count(*) FILTER (WHERE created_at > now() - make_interval(mins => ${FLOOD.minutes}))::int AS recent
    FROM leads
    WHERE created_at > now() - make_interval(mins => ${Math.max(RATE_LIMIT.minutes, DUP_MINUTES, FLOOD.minutes)})`;
  return rows[0];
}

export async function insertLead(l) {
  const rows = await db()`
    INSERT INTO leads (kind, role, name, phone, email, business, city, product, message, page, ip_hash, user_agent, status)
    VALUES (${l.kind}, ${l.role}, ${l.name}, ${l.phone}, ${l.email}, ${l.business}, ${l.city}, ${l.product},
            ${l.message}, ${l.page}, ${l.ip_hash}, ${l.user_agent}, ${l.status || "new"})
    RETURNING id, created_at`;
  return rows[0];
}
