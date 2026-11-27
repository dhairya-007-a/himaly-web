/* Loading screen: Himalay logo while the page loads.
   Loaded WITHOUT defer in <head> so it decides before the first paint.
   - Once per browser tab (sessionStorage), never inside the showcase iframe.
   - Stays at least MIN ms so the logo animation reads, never longer than MAX.
   - If this file fails to load, the CSS in the page hides the screen by itself after ~4s. */
(function () {
  var d = document.documentElement;
  var KEY = "hx-splash-seen";
  var seen = false;
  try {
    seen = sessionStorage.getItem(KEY) === "1";
    sessionStorage.setItem(KEY, "1");
  } catch (e) { /* private mode / blocked storage: just show it */ }

  var framed = false;
  try { framed = window.self !== window.top; } catch (e) { framed = true; }

  if (seen || framed) { d.className += " hx-nosplash"; return; }

  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var MIN = reduce ? 400 : 1300;
  var MAX = 3500;
  var t0 = Date.now();
  var done = false;
  d.className += " hx-splashing";

  function hide() {
    if (done) return;
    done = true;
    setTimeout(function () {
      d.className = d.className.replace(/\s*hx-splashing/g, "") + " hx-splash-done";
      setTimeout(function () {
        var el = document.getElementById("hx-splash");
        if (el && el.parentNode) el.parentNode.removeChild(el);
      }, 700);
    }, Math.max(0, MIN - (Date.now() - t0)));
  }

  if (document.readyState === "complete") hide();
  else window.addEventListener("load", hide);
  setTimeout(hide, MAX);
  // Safari back/forward cache: a restored page must never come back covered
  window.addEventListener("pageshow", function (e) { if (e.persisted) hide(); });
})();
