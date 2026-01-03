// reveal
(() => {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) {
    els.forEach(el => el.classList.add("in"));
    return;
  }
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add("in");
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.14 });

  els.forEach(el => io.observe(el));
})();

// toggle grid overlay (tecla G)
(() => {
  const frame = document.querySelector(".frame");
  window.addEventListener("keydown", (e) => {
    if (e.key.toLowerCase() !== "g") return;
    frame.dataset.grid = frame.dataset.grid === "on" ? "off" : "on";
  });
})();

// wipe entre páginas .html (se você criar depois)
(() => {
  const wipe = document.querySelector(".wipe");
  function shouldHandle(a){
    if (!a || !a.href) return false;
    if (a.target === "_blank") return false;
    const href = a.getAttribute("href") || "";
    if (href.startsWith("#")) return false;
    if (!href.includes(".html")) return false;
    try {
      const url = new URL(a.href);
      return url.origin === window.location.origin;
    } catch { return false; }
  }

  document.addEventListener("click", (ev) => {
    const a = ev.target.closest("a");
    if (!shouldHandle(a)) return;
    ev.preventDefault();
    wipe.classList.add("on");
    setTimeout(() => window.location.href = a.getAttribute("href"), 220);
  });
})();
