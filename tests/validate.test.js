import { test } from "node:test";
import assert from "node:assert/strict";
import { validateLead, normalisePhone, csvCell, MIN_FILL_MS } from "../api/_lib/validate.js";

const base = (o = {}) => ({ kind: "distributor", name: "Ravi Patel", phone: "+91 99790 11141", elapsed: MIN_FILL_MS + 1000, ...o });

test("accepts a normal distributor enquiry", () => {
  const r = validateLead(base({ role: "Dealer", email: "Ravi@Example.com", city: "Rajkot" }));
  assert.equal(r.ok, true);
  assert.equal(r.lead.phone, "+919979011141");
  assert.equal(r.lead.email, "ravi@example.com");
  assert.equal(r.lead.role, "Dealer");
  assert.equal(r.lead.business, null);
});

test("catalogue requests carry no role", () => {
  const r = validateLead(base({ kind: "catalogue", role: "Dealer" }));
  assert.equal(r.ok, true);
  assert.equal(r.lead.role, null);
});

test("unknown role falls back to Distributor", () => {
  assert.equal(validateLead(base({ role: "Admin" })).lead.role, "Distributor");
});

test("honeypot filled → spam", () => {
  const r = validateLead(base({ website: "http://x" }));
  assert.equal(r.ok, false);
  assert.equal(r.spam, true);
});

test("submitted too fast → spam", () => {
  assert.equal(validateLead(base({ elapsed: 500 })).spam, true);
  assert.equal(validateLead(base({ elapsed: "nope" })).spam, true);
});

test("rejects bad kind, missing name, bad phone, bad email", () => {
  assert.equal(validateLead(base({ kind: "x" })).ok, false);
  assert.equal(validateLead(base({ name: " " })).field, "name");
  assert.equal(validateLead(base({ phone: "12345" })).field, "phone");
  assert.equal(validateLead(base({ phone: "call me" })).field, "phone");
  assert.equal(validateLead(base({ email: "not-an-email" })).field, "email");
});

test("over-long fields are rejected, not truncated", () => {
  assert.equal(validateLead(base({ message: "a".repeat(2001) })).field, "message");
});

test("link-stuffed messages are refused", () => {
  const r = validateLead(base({ message: "http://a http://b www.c" }));
  assert.equal(r.ok, false);
});

test("non-object bodies are refused", () => {
  for (const b of [null, "x", [], 5]) assert.equal(validateLead(b).ok, false);
});

test("control characters are stripped", () => {
  assert.equal(validateLead(base({ name: "Ra\u0000vi" })).lead.name, "Ravi");
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
