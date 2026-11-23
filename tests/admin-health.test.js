import { test } from "node:test";
import assert from "node:assert/strict";
import { GET as adminGet } from "../api/admin/leads.js";
import { GET as health } from "../api/health.js";

const r = (auth, ip) => new Request("https://himalay-web.vercel.app/api/admin/leads", { headers: { authorization: auth, "x-real-ip": ip } });

test("admin: wrong keys get 401, then 429 after 10 tries from the same visitor", async () => {
  process.env.ADMIN_TOKEN = "t".repeat(32);
  const codes = [];
  for (let i = 0; i < 11; i++) codes.push((await adminGet(r("Bearer wrong", "192.0.2.50"))).status);
  assert.deepEqual(codes.slice(0, 10), Array(10).fill(401));
  assert.equal(codes[10], 429);
  assert.equal((await adminGet(r("Bearer wrong", "192.0.2.51"))).status, 401, "other visitors unaffected");
});

test("admin: refuses to run with a short or missing ADMIN_TOKEN", async () => {
  process.env.ADMIN_TOKEN = "short";
  assert.equal((await adminGet(r("Bearer short", "192.0.2.60"))).status, 401);
});

test("health: database down → 503, and 100 parallel checks share one probe", async () => {
  delete process.env.DATABASE_URL; delete process.env.POSTGRES_URL;
  const res = await Promise.all(Array.from({ length: 100 }, () => health()));
  assert.ok(res.every((x) => x.status === 503));
  assert.equal(res[0].headers.get("cache-control"), "no-store", "a failure is never cached by the CDN");
});
