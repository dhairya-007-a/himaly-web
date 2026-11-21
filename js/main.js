/* Himalay Thermoplast – site scripts.
   Every lookup is null-guarded so removing a section never breaks the rest. */
(() => {
  const $ = (s) => document.querySelector(s);
  const $$ = (s) => [...document.querySelectorAll(s)];
  const on = (el, ev, fn, opt) => el && el.addEventListener(ev, fn, opt);
  const CAT = "https://himalaythermoplast.com/catalogue-download/"; /* swap for the direct PDF link */

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

  /* Catalogue download form */
  on($("#df"), "submit", (e) => {
    e.preventDefault();
    const f = e.target.elements, m = $("#dm"), a = document.createElement("a");
    m.textContent = "Thank you, " + f.dn.value.trim() + ". Your catalogue is ready.";
    a.className = "btn"; a.href = CAT; a.target = "_blank"; a.rel = "noopener"; a.textContent = "Open the catalogue";
    m.append(document.createElement("br"), a);
    e.target.hidden = true;
  });

  /* Enquiry form → email draft */
  on($("#cf"), "submit", (e) => {
    e.preventDefault();
    const f = e.target.elements;
    const body = ["Enquiry: " + f.ty.value, "Name: " + f.nm.value, "Business: " + f.bz.value, "City: " + f.ct.value,
      "Phone: " + f.ph.value, "Email: " + f.em.value, "Product: " + f.pr.value, "", "Message:", f.ms.value].join("\n");
    location.href = "mailto:himalaythermoplast@gmail.com?subject=" + encodeURIComponent("Himalay enquiry – " + f.ty.value) + "&body=" + encodeURIComponent(body);
    $("#cs").textContent = "Your email app should open with the enquiry filled in. If it doesn't, use WhatsApp or call +91 99790 11141.";
  });

  /* Hero video: pause when off-screen to save battery/CPU */
  const vid = $(".hero video");
  if (vid && "IntersectionObserver" in window) {
    new IntersectionObserver(([en]) => { if (en.isIntersecting) vid.play().catch(() => {}); else vid.pause(); }).observe(vid);
  }
})();
