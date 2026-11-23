import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLead, normalisePhone, csvCell, MIN_FILL_MS } from "../api/_lib/validate.js";

const NOW = 1_800_000_000_000;
const base = (o = {}) => ({ kind: "distributor", name: "Ravi Patel", phone: "+91 99790 11141", t: NOW - MIN_FILL_MS - 1000, ...o });

test("accepts a normal distributor enquiry", () => {
  const r = validateLead(base({ role: "Dealer", email: "Ravi@Example.com", city: "Rajkot" }), NOW);
  assert.equal(r.ok, true);
  assert.equal(r.lead.phone, "+919979011141");
  assert.equal(r.lead.email, "ravi@example.com");
  assert.equal(r.lead.role, "Dealer");
  assert.equal(r.lead.business, null);
});

test("catalogue requests carry no role", () => {
  const r = validateLead(base({ kind: "catalogue", role: "Dealer" }), NOW);
  assert.equal(r.ok, true);
  assert.equal(r.lead.role, null);
});

test("unknown role falls back to Distributor", () => {
  assert.equal(validateLead(base({ role: "Admin" }), NOW).lead.role, "Distributor");
});

test("honeypot filled → spam", () => {
  const r = validateLead(base({ website: "http://x" }), NOW);
  assert.equal(r.ok, false);
  assert.equal(r.spam, true);
});

test("submitted too fast → spam", () => {
  assert.equal(validateLead(base({ t: NOW - 500 }), NOW).spam, true);
  assert.equal(validateLead(base({ t: "nope" }), NOW).spam, true);
});

test("rejects bad kind, missing name, bad phone, bad email", () => {
  assert.equal(validateLead(base({ kind: "x" }), NOW).ok, false);
  assert.equal(validateLead(base({ name: " " }), NOW).field, "name");
  assert.equal(validateLead(base({ phone: "12345" }), NOW).field, "phone");
  assert.equal(validateLead(base({ phone: "call me" }), NOW).field, "phone");
  assert.equal(validateLead(base({ email: "not-an-email" }), NOW).field, "email");
});

test("over-long fields are rejected, not truncated", () => {
  assert.equal(validateLead(base({ message: "a".repeat(2001) }), NOW).field, "message");
});

test("link-stuffed messages are refused", () => {
  const r = validateLead(base({ message: "http://a http://b www.c" }), NOW);
  assert.equal(r.ok, false);
});

test("non-object bodies are refused", () => {
  for (const b of [null, "x", [], 5]) assert.equal(validateLead(b, NOW).ok, false);
});

test("control characters are stripped", () => {
  assert.equal(validateLead(base({ name: "Ra\u0000vi" }), NOW).lead.name, "Ravi");
});

test("phone normalisation", () => {
  assert.equal(normalisePhone("099790-11141"), "09979011141");
  assert.equal(normalisePhone("(0281) 234 5678"), "02812345678");
  assert.equal(normalisePhone("+1 234"), null);
});

test("CSV cells neutralise formulas and escape quotes", () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell("@SUM"), "\"'@SUM\"");
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell("plain"), '"plain"');
});
