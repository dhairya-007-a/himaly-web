// GET /api/health: uptime check. Reports whether the database answers,
// without exposing anything about it.
import { db } from "./_lib/db.js";
import { json } from "./_lib/http.js";

export async function GET() {
  try {
    await db()`SELECT 1`;
    return json(200, { ok: true, db: "up" });
  } catch {
    return json(503, { ok: false, db: "down" });
  }
}
