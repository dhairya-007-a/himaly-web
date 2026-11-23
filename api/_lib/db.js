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

// Same IP (hashed) may submit this many leads per window.
export const RATE_LIMIT = { max: 5, minutes: 10 };

export async function recentFromIp(ipHash) {
  const rows = await db()`
    SELECT count(*)::int AS n FROM leads
    WHERE ip_hash = ${ipHash} AND created_at > now() - make_interval(mins => ${RATE_LIMIT.minutes})`;
  return rows[0].n;
}

export async function insertLead(l) {
  const rows = await db()`
    INSERT INTO leads (kind, role, name, phone, email, business, city, product, message, page, ip_hash, user_agent, status)
    VALUES (${l.kind}, ${l.role}, ${l.name}, ${l.phone}, ${l.email}, ${l.business}, ${l.city}, ${l.product},
            ${l.message}, ${l.page}, ${l.ip_hash}, ${l.user_agent}, ${l.status || "new"})
    RETURNING id, created_at`;
  return rows[0];
}
