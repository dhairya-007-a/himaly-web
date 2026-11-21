/* Himalay redesign — category stage (index → full-bleed colour section).
   js/main.js handles search, enquiry dialog and forms. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* Category index → stage */
  const stage = document.getElementById("rxStage");
  if (stage) {
    const img = document.getElementById("rxStageImg");
    const name = document.getElementById("rxStageName");
    const note = document.getElementById("rxStageNote");
    const enq = document.getElementById("rxStageEnq");
    const items = [...document.querySelectorAll(".rx-index button")];
    const section = stage.closest("section");
    let timer;

    const show = (btn) => {
      if (btn.getAttribute("aria-pressed") === "true") return;
      items.forEach((b) => b.setAttribute("aria-pressed", String(b === btn)));
      const d = btn.dataset;
      section.dataset.tone = d.tone; // whole section recolours straight away
      const apply = () => {
        img.src = d.img;
        img.alt = d.alt;
        name.textContent = btn.textContent.trim();
        note.textContent = d.note;
        enq.dataset.enq = d.enq;
        stage.classList.remove("is-swapping");
      };
      clearTimeout(timer);
      if (reduce) return apply();
      stage.classList.add("is-swapping");
      timer = setTimeout(apply, 220);
    };

    items.forEach((b) => {
      b.addEventListener("click", () => show(b));
      if (matchMedia("(hover: hover)").matches) b.addEventListener("mouseenter", () => show(b));
    });

    // warm the cache so swaps don't flash — but only once the section is close
    const warm = () => items.forEach((b) => { const pre = new Image(); pre.decoding = "async"; pre.src = b.dataset.img; });
    if ("IntersectionObserver" in window) {
      const io = new IntersectionObserver(([en]) => { if (en.isIntersecting) { warm(); io.disconnect(); } }, { rootMargin: "600px 0px" });
      io.observe(section);
    } else warm();
  }

  /* New arrivals belt: glides on its own; swipe / drag / wheel / arrows / keys to scroll.
     Track holds the products twice; when we pass the first copy we jump back by its
     width, so it loops with no visible seam. */
  const belt = document.querySelector(".rx-line__belt");
  if (belt) {
    const track = belt.querySelector(".rx-line__track");
    const SPEED = 38;          // px per second when gliding
    const RESUME_MS = 2500;    // idle time after the user touches it before gliding again
    let half = 0, pos = 0, last = 0, hold = 0, hovering = false, visible = true, raf = 0;

    const measure = () => {
      const first = track.querySelector('.rx-line__item[aria-hidden="true"]');
      half = first ? first.offsetLeft - track.firstElementChild.offsetLeft : track.scrollWidth / 2;
    };
    const wrap = () => {
      if (!half) return;
      if (belt.scrollLeft >= half) belt.scrollLeft -= half;
      else if (belt.scrollLeft <= 0) belt.scrollLeft += half;
      pos = belt.scrollLeft;
    };
    const userTouched = () => { hold = performance.now() + RESUME_MS; };
    const gliding = () => !reduce && visible && !hovering && performance.now() > hold;

    const frame = (t) => {
      raf = 0;
      const dt = last ? Math.min(0.05, (t - last) / 1000) : 0;
      last = t;
      if (gliding()) {
        pos += SPEED * dt;
        if (pos >= half) pos -= half;
        belt.scrollLeft = pos;
      } else {
        pos = belt.scrollLeft;
      }
      if (visible) raf = requestAnimationFrame(frame);
    };
    const start = () => { if (!raf) { last = 0; raf = requestAnimationFrame(frame); } };

    // user input pauses gliding for a moment
    ["wheel", "touchstart", "keydown"].forEach((ev) => belt.addEventListener(ev, userTouched, { passive: true }));
    belt.addEventListener("scroll", () => { if (!gliding()) wrap(); }, { passive: true });
    belt.addEventListener("mouseenter", () => { hovering = true; });
    belt.addEventListener("mouseleave", () => { hovering = false; userTouched(); });

    // mouse drag-to-scroll (touch already scrolls natively)
    let dragX = 0, dragStart = 0, moved = false;
    belt.addEventListener("pointerdown", (e) => {
      if (e.pointerType !== "mouse" || e.button !== 0) return;
      dragX = e.clientX; dragStart = belt.scrollLeft; moved = false;
      belt.setPointerCapture(e.pointerId);
      belt.classList.add("is-dragging");
    });
    belt.addEventListener("pointermove", (e) => {
      if (!belt.classList.contains("is-dragging")) return;
      const dx = e.clientX - dragX;
      if (Math.abs(dx) > 4) moved = true;
      belt.scrollLeft = dragStart - dx;
      userTouched();
    });
    const endDrag = () => belt.classList.remove("is-dragging");
    belt.addEventListener("pointerup", endDrag);
    belt.addEventListener("pointercancel", endDrag);
    // a drag shouldn't also count as a click on a link/button
    belt.addEventListener("click", (e) => { if (moved) { e.preventDefault(); e.stopPropagation(); moved = false; } }, true);

    // arrow buttons + keyboard: one item per step
    const step = () => (track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width : 300);
    const go = (dir) => {
      userTouched();
      wrap();
      belt.scrollBy({ left: dir * step(), behavior: reduce ? "auto" : "smooth" });
    };
    document.querySelectorAll(".rx-arrow").forEach((b) => b.addEventListener("click", () => go(+b.dataset.dir)));
    belt.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") { e.preventDefault(); go(1); }
      if (e.key === "ArrowLeft") { e.preventDefault(); go(-1); }
    });

    // only run while on screen
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible) start(); }).observe(belt);
    }
    addEventListener("resize", () => { measure(); wrap(); });
    addEventListener("load", measure);
    measure();
    belt.scrollLeft = 1; pos = 1;
    start();
  }
  /* All products: room filter chips + search, combined */
  const grid = document.getElementById("cg");
  if (grid) {
    const tiles = [...grid.querySelectorAll(".tile")];
    const chips = [...document.querySelectorAll(".rx-chip")];
    const q = document.getElementById("q");
    const count = document.getElementById("cn");
    const empty = document.getElementById("cempty");
    let room = "all";

    const apply = () => {
      const v = (q ? q.value : "").trim().toLowerCase();
      let n = 0;
      tiles.forEach((t) => {
        const hit = (room === "all" || t.dataset.g === room) && (!v || t.dataset.n.includes(v));
        t.hidden = !hit;
        if (hit) n++;
      });
      count.textContent = n + (n === 1 ? " range" : " ranges");
      empty.hidden = n > 0;
      grid.hidden = n === 0;
    };
    chips.forEach((c) => c.addEventListener("click", () => {
      room = c.dataset.f;
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x === c)));
      apply();
    }));
    if (q) q.addEventListener("input", apply);
    document.getElementById("creset")?.addEventListener("click", () => {
      if (q) q.value = "";
      room = "all";
      chips.forEach((x) => x.setAttribute("aria-pressed", String(x.dataset.f === "all")));
      apply();
      q?.focus();
    });
  }
})();
