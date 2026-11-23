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

// Phone numbers. Mostly Indian, so those are stored in one form, "+91" plus the
// 10-digit national number, however they were typed:
//   99790 11141 · 099790-11141 · 91 9979011141 · +91 99790 11141  → +919979011141
//   (0281) 234 5678  (landline with STD code)                    → +912812345678
// A "+91" number must have exactly 10 digits after it. Other countries: "+" and
// 8–15 digits (E.164). Junk such as 0000000000 or 1234567890 is refused.
export function normalisePhone(raw) {
  const s = clean(raw);
  if (!/^\+?[\d\s\-().]{8,22}$/.test(s)) return null;
  let d = s.replace(/\D/g, "");
  const plus = s.startsWith("+");

  let national = null; // Indian 10-digit number, if this is one
  if (plus) {
    if (d.startsWith("91")) {
      if (d.length !== 12) return null;
      national = d.slice(2);
    } else if (d.length < 8 || d.length > 15 || d.startsWith("0")) {
      return null;
    }
  } else if (d.length === 10 && /^[6-9]/.test(d)) national = d;            // mobile
  else if (d.length === 11 && d.startsWith("0")) national = d.slice(1);    // 0 + mobile / STD landline
  else if (d.length === 12 && d.startsWith("91")) national = d.slice(2);   // 91 without +
  else if (d.length === 13 && d.startsWith("091")) national = d.slice(3);
  else return null; // no country code and not a recognisable Indian number

  if (national !== null) {
    // Indian numbers never start with 0 or 1 after the country code.
    if (!/^[2-9]\d{9}$/.test(national) || isJunk(national)) return null;
    return "+91" + national;
  }
  if (isJunk(d)) return null;
  return "+" + d;
}

function isJunk(digits) {
  if (/^(\d)\1+$/.test(digits)) return true; // 9999999999
  const runs = "01234567890123456789";
  const back = "98765432109876543210";
  return runs.includes(digits) || back.includes(digits); // 1234567890, 9876543210
}

const EMAIL = /^[^\s@<>()"',;]{1,64}@[^\s@<>()"',;]+\.[a-z]{2,}$/i;

/**
 * Validate a submitted lead.
 * @param {object} body  parsed JSON from the browser
 * @returns {{ok:true, lead:object} | {ok:false, error:string, field?:string, spam?:boolean}}
 */
export function validateLead(body) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return { ok: false, error: "Invalid request." };

  // Honeypot: a field hidden from people. Bots fill every input.
  if (clean(body.website)) return { ok: false, error: "Rejected.", spam: true };

  // Timing: how long the form was open, measured in the browser (elapsed ms,
  // not a timestamp, so a visitor's wrong phone clock can't break it).
  const elapsed = Number(body.elapsed);
  if (!Number.isFinite(elapsed) || elapsed < MIN_FILL_MS || elapsed > 1000 * 60 * 60 * 24) {
    return { ok: false, error: "Please wait a moment and send again.", spam: true };
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
