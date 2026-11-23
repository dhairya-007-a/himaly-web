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

test("phone normalisation: every Indian format becomes +91 + 10 digits", () => {
  for (const x of ["99790 11141", "099790-11141", "91 9979011141", "+91 99790 11141", "+91-99790-11141", "0919979011141"])
    assert.equal(normalisePhone(x), "+919979011141", x);
  assert.equal(normalisePhone("(0281) 234 5678"), "+912812345678"); // landline with STD code
});

test("phone normalisation: international numbers keep their country code", () => {
  assert.equal(normalisePhone("+1 415 555 2671"), "+14155552671");
  assert.equal(normalisePhone("+44 20 7946 0958"), "+442079460958");
});

test("phone normalisation: junk and malformed numbers are refused", () => {
  for (const x of ["+1 234", "12345678", "5551234567", "+91 12345", "+91 0979011141", "+91 1979011141",
                   "9999999999", "0000000000", "1234567890", "9876543210", "+0 1234 5678", "98250 1234a", "", null, 42])
    assert.equal(normalisePhone(x), null, String(x));
});

test("CSV cells neutralise formulas and escape quotes", () => {
  assert.equal(csvCell('=HYPERLINK("x")'), '"\'=HYPERLINK(""x"")"');
  assert.equal(csvCell("@SUM"), "\"'@SUM\"");
  assert.equal(csvCell(null), '""');
  assert.equal(csvCell("plain"), '"plain"');
});
