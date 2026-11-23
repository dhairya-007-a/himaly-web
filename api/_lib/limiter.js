// Cheap in-memory fixed-window limiter, per function instance.
//
// Vercel Fluid Compute reuses an instance across many concurrent requests, so
// this stops most repeat abuse before any database call. It is a first layer
// only: counts are not shared between instances or regions. The real limits are
// the Vercel Firewall rules (see main.md, Pass 25) and the database checks in
// db.js. Memory is bounded: at most MAX_KEYS keys, oldest evicted first, so a
// flood of spoofed keys can't grow it without limit.

const MAX_KEYS = 10000;

export function createLimiter({ max, windowMs }) {
  const hits = new Map(); // key -> { n, reset }

  return function allow(key, now = Date.now()) {
    let e = hits.get(key);
    if (!e || now >= e.reset) {
      if (e) hits.delete(key); // re-insert so Map order stays oldest-first
      e = { n: 0, reset: now + windowMs };
      hits.set(key, e);
      if (hits.size > MAX_KEYS) hits.delete(hits.keys().next().value);
    }
    e.n += 1;
    return e.n <= max;
  };
}
