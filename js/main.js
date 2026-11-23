/* Himalay Thermoplast – site scripts.
   Every lookup is null-guarded so removing a section never breaks the rest. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const WA = "919979011141";

  /* Mobile menu */
  const nv = $("nav"), mb = $("#mb");
  const closeMenu = () => { if (!nv || !mb) return; nv.classList.remove("open"); mb.setAttribute("aria-expanded", "false"); };
  on(mb, "click", () => mb.setAttribute("aria-expanded", String(nv.classList.toggle("open"))));
  $$("nav li a").forEach((a) => on(a, "click", closeMenu));
  on(document, "keydown", (e) => { if (e.key === "Escape") closeMenu(); });

  /* Search button → catalogue search box */
  on($("#sb"), "click", () => {
    const sec = $("#catalog"), q = $("#q");
    if (!sec) return;
    sec.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
    if (q) setTimeout(() => q.focus({ preventScroll: true }), 450);
  });

  /* Product search + room filters live in js/redesign.js */

  /* Enquiry dialog */
  const dd = $("#dd");
  const enquire = (type, product) => {
    if (!dd) return;
    if (type && $("#ty")) $("#ty").value = type;
    if (product && $("#pr")) $("#pr").value = product;
    closeMenu();
    dd.showModal();
  };
  $$("[data-open]").forEach((b) => on(b, "click", () => enquire(b.dataset.open || "Distributor")));
  // read data-enq at click time: the category stage changes it as you browse
  on(document, "click", (e) => { const b = e.target.closest("[data-enq]"); if (b) enquire("Dealer", b.dataset.enq); });
  on($("#dx"), "click", () => dd.close());
  on(dd, "click", (e) => {
    const r = dd.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dd.close();
  });

  /* ── Lead forms ──
     Posted to /api/lead (Vercel function → Neon). If there's no backend
     (GitHub Pages copy, offline) the old behaviour kicks in: WhatsApp for the
     catalogue, an email draft for enquiries. So no visitor is ever stuck. */
  const T0 = Date.now(); // the API rejects forms filled faster than a person can
  const sendLead = async (payload) => {
    try {
      const r = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, t: T0, page: location.pathname + location.search }),
      });
      if (r.status === 404 || r.status === 405 || r.status === 501) return { fallback: true };
      const d = await r.json().catch(() => ({}));
      return { status: r.status, ok: r.ok && d.ok, error: d.error, field: d.field };
    } catch {
      return { fallback: true };
    }
  };
  const waLink = (text) => "https://wa.me/" + WA + "?text=" + encodeURIComponent(text);
  const busy = (form, on) => {
    const b = form.querySelector('[type="submit"]');
    if (b) { b.disabled = on; b.setAttribute("aria-busy", String(on)); }
  };
  const showError = (form, msg, res, waText) => {
    msg.textContent = res.error || "Something went wrong. ";
    if (res.status >= 429) {
      const a = document.createElement("a");
      a.href = waLink(waText); a.target = "_blank"; a.rel = "noopener"; a.textContent = " Message us on WhatsApp";
      msg.append(a);
    }
    const map = { name: ["nm", "dn"], phone: ["ph", "dp"], email: ["em"], message: ["ms"] }[res.field] || [];
    const el = map.map((n) => form.elements[n]).find(Boolean);
    if (el) el.focus();
  };

  /* Catalogue form */
  on($("#df"), "submit", async (e) => {
    e.preventDefault();
    const form = e.target, f = form.elements, m = $("#dm");
    const name = f.dn.value.trim(), phone = f.dp.value.trim();
    const waText = "Hello Himalay, please send me the product catalogue.\nName: " + name + "\nPhone: " + phone;
    busy(form, true); m.textContent = "Sending…";
    const res = await sendLead({ kind: "catalogue", name, phone, website: f.website ? f.website.value : "" });
    busy(form, false);
    if (res.fallback) {
      window.open(waLink(waText), "_blank", "noopener");
      m.textContent = "Thank you, " + name + ". WhatsApp should open with your request; we'll send the catalogue there.";
    } else if (!res.ok) {
      return showError(form, m, res, waText);
    } else {
      m.textContent = "Thank you, " + name + ". We'll send the catalogue to " + phone + " on WhatsApp within one working day.";
    }
    const a = document.createElement("a");
    a.className = "btn"; a.href = "products.html"; a.textContent = "Browse all products";
    m.append(document.createElement("br"), a);
    form.hidden = true;
  });

  /* Distributor / dealer enquiry form */
  on($("#cf"), "submit", async (e) => {
    e.preventDefault();
    const form = e.target, f = form.elements, m = $("#cs");
    const lead = {
      kind: "distributor", role: f.ty.value, name: f.nm.value, business: f.bz.value, city: f.ct.value,
      phone: f.ph.value, email: f.em.value, product: f.pr.value, message: f.ms.value,
      website: f.website ? f.website.value : "",
    };
    const waText = "Hello Himalay, " + lead.role + " enquiry from " + lead.name + " (" + lead.phone + ")" + (lead.product ? " about " + lead.product : "");
    busy(form, true); m.textContent = "Sending…";
    const res = await sendLead(lead);
    busy(form, false);
    if (res.fallback) {
      const body = ["Enquiry: " + lead.role, "Name: " + lead.name, "Business: " + lead.business, "City: " + lead.city,
        "Phone: " + lead.phone, "Email: " + lead.email, "Product: " + lead.product, "", "Message:", lead.message].join("\n");
      location.href = "mailto:himalaythermoplast@gmail.com?subject=" + encodeURIComponent("Himalay enquiry – " + lead.role) + "&body=" + encodeURIComponent(body);
      m.textContent = "Your email app should open with the enquiry filled in. If it doesn't, use WhatsApp or call +91 99790 11141.";
    } else if (!res.ok) {
      showError(form, m, res, waText);
    } else {
      form.reset();
      m.textContent = "Thank you, " + lead.name.trim() + ". We've received your enquiry and will reply within one working day.";
    }
  });

  /* Hero video: pause when off-screen to save battery/CPU */
  const vid = $(".hero video");
  if (vid && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { if (en.isIntersecting) vid.play().catch(() => {}); else vid.pause(); }).observe(vid);
  }
})();
