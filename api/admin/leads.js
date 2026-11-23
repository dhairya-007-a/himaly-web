// /api/admin/leads: list, export and update leads. Bearer ADMIN_TOKEN required.
//   GET  ?status=new&limit=200&format=csv
//   PATCH { id, status }
import { db } from "../_lib/db.js";
import { json, readJson, checkAdmin } from "../_lib/http.js";
import { STATUSES, csvCell } from "../_lib/validate.js";

// Keep in sync with the SELECT lists below.
const COLS = ["id", "created_at", "kind", "role", "name", "phone", "email", "business", "city", "product", "message", "page", "status"];

const deny = () => json(401, { ok: false, error: "Unauthorised." }, { "www-authenticate": "Bearer" });

export async function GET(request) {
  if (!checkAdmin(request)) return deny();
  const u = new URL(request.url);
  const status = u.searchParams.get("status");
  const limit = Math.min(Math.max(parseInt(u.searchParams.get("limit") || "500", 10) || 500, 1), 5000);
  if (status && !STATUSES.includes(status)) return json(400, { ok: false, error: "Bad status." });

  const sql = db();
  const rows = status
    ? await sql`SELECT id, created_at, kind, role, name, phone, email, business, city, product, message, page, status FROM leads WHERE status = ${status} ORDER BY created_at DESC LIMIT ${limit}`
    : await sql`SELECT id, created_at, kind, role, name, phone, email, business, city, product, message, page, status FROM leads ORDER BY created_at DESC LIMIT ${limit}`;

  if (u.searchParams.get("format") === "csv") {
    const csv = [COLS.join(","), ...rows.map((r) => COLS.map((c) => csvCell(r[c])).join(","))].join("\r\n");
    const day = new Date().toISOString().slice(0, 10);
    return new Response("﻿" + csv, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="himalay-leads-${day}.csv"`,
        "cache-control": "no-store",
      },
    });
  }
  const counts = await sql`SELECT status, count(*)::int AS n FROM leads GROUP BY status`;
  return json(200, { ok: true, leads: rows, counts: Object.fromEntries(counts.map((c) => [c.status, c.n])) });
}

export async function PATCH(request) {
  if (!checkAdmin(request)) return deny();
  const parsed = await readJson(request);
  if (parsed.error) return json(parsed.status, { ok: false, error: parsed.error });
  const id = Number(parsed.body && parsed.body.id);
  const status = parsed.body && parsed.body.status;
  if (!Number.isInteger(id) || id < 1 || !STATUSES.includes(status)) return json(400, { ok: false, error: "Bad id or status." });
  const rows = await db()`UPDATE leads SET status = ${status} WHERE id = ${id} RETURNING id, status`;
  if (!rows.length) return json(404, { ok: false, error: "Not found." });
  return json(200, { ok: true, lead: rows[0] });
}
