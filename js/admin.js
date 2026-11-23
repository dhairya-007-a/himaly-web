/* Himalay admin: list / filter / update / export leads.
   The key lives in sessionStorage (gone when the tab closes). All lead text is
   inserted with textContent, never innerHTML: visitors typed it. */
(() => {
  const $ = (s) => document.querySelector(s);
  const KEY = "himalay-admin-key";
  const STATUSES = ["new", "contacted", "closed", "spam"];
  let filter = "";

  const key = () => sessionStorage.getItem(KEY) || "";
  const api = async (path, opts = {}) => {
    const r = await fetch(path, { ...opts, headers: { authorization: "Bearer " + key(), ...(opts.headers || {}) } });
    if (r.status === 401) { signOut("That key didn't work."); throw new Error("401"); }
    return r;
  };

  const el = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const fmt = (iso) => new Date(iso).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  function signOut(msg) {
    sessionStorage.removeItem(KEY);
    $("#app").hidden = true; $("#logout").hidden = true; $("#login").hidden = false;
    $("#loginMsg").textContent = msg || "";
  }

  function card(l) {
    const c = el("article", "ad-lead");
    c.dataset.status = l.status;
    const head = el("div", "ad-lead__head");
    head.append(el("span", "ad-kind", l.kind === "catalogue" ? "Catalogue" : (l.role || "Distributor")), el("time", "", fmt(l.created_at)));
    const name = el("h2", "", l.name + (l.business ? " · " + l.business : ""));
    const contact = el("p", "ad-contact");
    const tel = el("a", "", l.phone); tel.href = "tel:" + l.phone;
    const wa = el("a", "", "WhatsApp"); wa.href = "https://wa.me/" + l.phone.replace(/\D/g, "").replace(/^0/, "91"); wa.target = "_blank"; wa.rel = "noopener";
    contact.append(tel, " · ", wa);
    if (l.email) { const m = el("a", "", l.email); m.href = "mailto:" + l.email; contact.append(" · ", m); }
    const meta = [l.city, l.product && "Product: " + l.product].filter(Boolean).join(" · ");
    c.append(head, name, contact);
    if (meta) c.append(el("p", "ad-meta", meta));
    if (l.message) c.append(el("p", "ad-text", l.message));
    const sel = el("select");
    sel.setAttribute("aria-label", "Status for lead " + l.id);
    for (const s of STATUSES) { const o = el("option", "", s[0].toUpperCase() + s.slice(1)); o.value = s; o.selected = s === l.status; sel.append(o); }
    sel.addEventListener("change", async () => {
      sel.disabled = true;
      try {
        const r = await api("/api/admin/leads", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ id: l.id, status: sel.value }) });
        if (!r.ok) throw new Error();
        c.dataset.status = sel.value; load(false);
      } catch { sel.value = l.status; $("#msg").textContent = "Couldn't update that lead."; }
      sel.disabled = false;
    });
    const foot = el("div", "ad-lead__foot"); foot.append(el("span", "ad-id", "#" + l.id), sel);
    c.append(foot);
    return c;
  }

  async function load(render = true) {
    const msg = $("#msg");
    if (render) msg.textContent = "Loading…";
    try {
      const r = await api("/api/admin/leads?limit=500" + (filter ? "&status=" + filter : ""));
      const d = await r.json();
      if (!d.ok) throw new Error(d.error);
      const counts = d.counts || {};
      $("#c-all").textContent = Object.values(counts).reduce((a, b) => a + b, 0);
      for (const s of STATUSES) $("#c-" + s).textContent = counts[s] || 0;
      if (!render) return;
      const list = $("#list"); list.replaceChildren(...d.leads.map(card));
      msg.textContent = d.leads.length ? "" : "No leads here yet.";
    } catch (e) {
      if (e.message !== "401") msg.textContent = "Couldn't load leads. Check the connection and try Refresh.";
    }
  }

  $("#login").addEventListener("submit", async (e) => {
    e.preventDefault();
    sessionStorage.setItem(KEY, $("#key").value.trim());
    $("#key").value = "";
    const r = await fetch("/api/admin/leads?limit=1", { headers: { authorization: "Bearer " + key() } }).catch(() => null);
    if (!r || !r.ok) return signOut(r && r.status === 401 ? "That key didn't work." : "Server unreachable.");
    $("#login").hidden = true; $("#app").hidden = false; $("#logout").hidden = false;
    load();
  });
  $("#logout").addEventListener("click", () => signOut());
  $("#refresh").addEventListener("click", () => load());
  $("#tabs").addEventListener("click", (e) => {
    const b = e.target.closest("button[data-s]"); if (!b) return;
    filter = b.dataset.s;
    for (const x of $("#tabs").children) x.setAttribute("aria-pressed", String(x === b));
    load();
  });
  $("#csv").addEventListener("click", async () => {
    try {
      const r = await api("/api/admin/leads?format=csv&limit=5000" + (filter ? "&status=" + filter : ""));
      const blob = await r.blob();
      const a = el("a"); a.href = URL.createObjectURL(blob);
      a.download = (r.headers.get("content-disposition") || "").match(/filename="(.+)"/)?.[1] || "himalay-leads.csv";
      document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    } catch { $("#msg").textContent = "Export failed."; }
  });

  if (key()) $("#login").dispatchEvent(new Event("submit", { cancelable: true }));
})();
