/* Himalay redesign preview — category stage + product thumbnails.
   Loaded after js/main.js, which still handles search, colour swatches,
   quantity, enquiry dialog and catalogue form. */
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  // main.js defaults the enquiry colour to the old palette name
  if (typeof col !== "undefined") col = "Cobalt";

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
      // warm the cache so swaps don't flash
      const pre = new Image();
      pre.src = b.dataset.img;
    });
  }

  /* Product thumbnails → main photo */
  const main = document.querySelector("#main img");
  document.querySelectorAll(".rx-prod__thumbs button").forEach((t, _, all) => {
    t.addEventListener("click", () => {
      all.forEach((x) => x.setAttribute("aria-pressed", String(x === t)));
      const src = t.dataset.src, alt = t.querySelector("img").alt;
      if (reduce) { main.src = src; main.alt = alt; return; }
      main.style.opacity = "0";
      setTimeout(() => { main.src = src; main.alt = alt; main.style.opacity = "1"; }, 180);
    });
  });
})();
