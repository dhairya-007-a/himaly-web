import { test } from "node:test";
import assert from "node:assert/strict";
import { sameOrigin, readJson, MAX_BODY_BYTES } from "../api/_lib/http.js";
import { createLimiter } from "../api/_lib/limiter.js";
import { POST, GET } from "../api/lead.js";

const SITE = "https://himalay-web.vercel.app";
const req = (headers = {}, body = "{}", url = SITE + "/api/lead") =>
  new Request(url, { method: "POST", headers: { host: "himalay-web.vercel.app", "content-type": "application/json", ...headers }, body });

test("same-origin: only this site's own https pages may post", () => {
  assert.equal(sameOrigin(req({ origin: SITE })), true);
  assert.equal(sameOrigin(req({ origin: SITE, "sec-fetch-site": "same-origin" })), true);
  assert.equal(sameOrigin(req({})), false, "no Origin = script, refused");
  assert.equal(sameOrigin(req({ origin: "https://evil.example" })), false);
  assert.equal(sameOrigin(req({ origin: SITE, "sec-fetch-site": "cross-site" })), false);
  assert.equal(sameOrigin(req({ origin: "http://himalay-web.vercel.app" })), false, "plain http refused");
  assert.equal(sameOrigin(req({ origin: "null" })), false);
});

test("body reader: rejects wrong type, oversize (even with a lying Content-Length) and bad JSON", async () => {
  assert.equal((await readJson(req({ "content-type": "text/plain" }))).status, 415);
  assert.equal((await readJson(req({ "content-length": String(MAX_BODY_BYTES + 1) }))).status, 413);
  const big = JSON.stringify({ message: "x".repeat(MAX_BODY_BYTES) });
  assert.equal((await readJson(req({ "content-length": "10" }, big))).status, 413);
  assert.equal((await readJson(req({}, "{nope"))).status, 400);
  assert.deepEqual((await readJson(req({}, '{"a":1}'))).body, { a: 1 });
});

test("limiter: allows up to max per window, then resets", () => {
  const allow = createLimiter({ max: 3, windowMs: 1000 });
  assert.deepEqual([1, 2, 3, 4].map(() => allow("k", 0)), [true, true, true, false]);
  assert.equal(allow("other", 0), true, "keys are independent");
  assert.equal(allow("k", 1000), true, "new window");
});

test("limiter: memory stays bounded under a flood of distinct keys", () => {
  const allow = createLimiter({ max: 1, windowMs: 60_000 });
  for (let i = 0; i < 25_000; i++) allow("ip" + i, 0);
  assert.equal(allow("ip24999", 0), false, "recent key still tracked");
  assert.equal(allow("ip0", 0), true, "oldest keys were evicted");
});

test("POST /api/lead: refuses cross-site and header-less posts before touching the database", async () => {
  assert.equal((await POST(req({ origin: "https://evil.example" }))).status, 403);
  assert.equal((await POST(req({}))).status, 403);
  assert.equal(GET().status, 405);
});

test("POST /api/lead: honeypot gets a fake ok; without a database a real lead gets 503 (form falls back to WhatsApp)", async () => {
  const ok = { kind: "catalogue", name: "Ravi", phone: "9979011141", elapsed: 4000 };
  const h = { origin: SITE, "x-real-ip": "203.0.113.7" };
  assert.equal((await POST(req(h, JSON.stringify({ ...ok, website: "x" })))).status, 200);
  delete process.env.DATABASE_URL; delete process.env.POSTGRES_URL;
  assert.equal((await POST(req(h, JSON.stringify(ok)))).status, 503);
});

test("POST /api/lead: one visitor hammering one instance gets 429", async () => {
  const h = { origin: SITE, "x-real-ip": "198.51.100.9" };
  const codes = [];
  for (let i = 0; i < 12; i++) codes.push((await POST(req(h, "{}"))).status);
  assert.ok(codes.slice(0, 10).every((c) => c !== 429), codes.join(","));
  assert.equal(codes[10], 429);
});
