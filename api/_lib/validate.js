// Lead validation. Pure functions, no I/O, so they're unit-tested (tests/validate.test.js).
// Files under api/_lib are not deployed as endpoints (leading underscore).

export const KINDS = ["distributor", "catalogue"];
export const ROLES = ["Distributor", "Dealer", "Customer"];
export const STATUSES = ["new", "contacted", "closed", "spam"];

// Max lengths per field. Anything longer is rejected, not truncated,
// so nobody silently loses part of a message.
const LIMITS = { name: 80, phone: 20, email: 120, business: 120, city: 80, product: 120, message: 2000, page: 200 };

// A human takes longer than this to fill the form; bots post instantly.
export const MIN_FILL_MS = 2500;

const clean = (v) =>
  typeof v === "string"
    ? v.normalize("NFC").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim()
    : "";

// Indian numbers mostly, but dealers abroad exist: 8–15 digits after stripping
// spaces, dashes, brackets and a leading +.
export function normalisePhone(raw) {
  const s = clean(raw);
  if (!/^\+?[\d\s\-()]{8,20}$/.test(s)) return null;
  const digits = s.replace(/\D/g, "");
  if (digits.length < 8 || digits.length > 15) return null;
  return (s.startsWith("+") ? "+" : "") + digits;
}

const EMAIL = /^[^\s@<>()"',;]{1,64}@[^\s@<>()"',;]+\.[a-z]{2,}$/i;

/**
 * Validate a submitted lead.
 * @param {object} body  parsed JSON from the browser
 * @param {number} now   Date.now(), injectable for tests
 * @returns {{ok:true, lead:object} | {ok:false, error:string, field?:string, spam?:boolean}}
 */
export function validateLead(body, now = Date.now()) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Invalid request." };

  // Honeypot: a field hidden from people. Bots fill every input.
  if (clean(body.website)) return { ok: false, error: "Rejected.", spam: true };

  // Timing: form-start timestamp set by the page when it loaded.
  const t = Number(body.t);
  if (!Number.isFinite(t) || now - t < MIN_FILL_MS || now - t > 1000 * 60 * 60 * 24) {
    return { ok: false, error: "Please try again.", spam: true };
  }

  const kind = clean(body.kind);
  if (!KINDS.includes(kind)) return { ok: false, error: "Invalid request." };

  const lead = { kind };
  for (const k of Object.keys(LIMITS)) {
    const v = clean(body[k]);
    if (v.length > LIMITS[k]) return { ok: false, error: `${label(k)} is too long.`, field: k };
    lead[k] = v || null;
  }

  if (!lead.name || lead.name.length < 2) return { ok: false, error: "Please enter your name.", field: "name" };
  const phone = normalisePhone(body.phone);
  if (!phone) return { ok: false, error: "Please enter a valid phone number.", field: "phone" };
  lead.phone = phone;
  if (lead.email && !EMAIL.test(lead.email)) return { ok: false, error: "Please enter a valid email or leave it empty.", field: "email" };
  if (lead.email) lead.email = lead.email.toLowerCase();

  const role = clean(body.role);
  lead.role = kind === "distributor" ? (ROLES.includes(role) ? role : "Distributor") : null;

  // Links in a message are the classic spam payload; a real enquiry doesn't need three.
  const links = ((lead.message || "") + " " + (lead.business || "")).match(/https?:\/\/|www\./gi) || [];
  if (links.length > 2) return { ok: false, error: "Please remove the links from your message.", field: "message", spam: true };

  return { ok: true, lead };
}

function label(k) {
  return { name: "Name", phone: "Phone", email: "Email", business: "Business", city: "City", product: "Product", message: "Message", page: "Page" }[k] || k;
}

// CSV cell: quote, escape quotes, and neutralise formula injection
// (=, +, -, @, tab, CR at the start make Excel run the cell as a formula).
export function csvCell(v) {
  let s = v == null ? "" : v instanceof Date ? v.toISOString() : String(v);
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return '"' + s.replace(/"/g, '""') + '"';
}
