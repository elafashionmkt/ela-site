// Vanilla interactions:
// - reveal on scroll
// - accordion (single open, starts all closed)
// - fixed nav swap (logo menor no scroll)
// IMPORTANT: não intercepta mais cliques em âncoras (corrige bug de navegação)

(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector(".nav");

  // -----------------------------
  // 1) Reveal on scroll
  // -----------------------------
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("is-visible");
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("is-visible"));
  }

  // -----------------------------
  // 2) Accordion (single open)
  // -----------------------------
  const modules = Array.from(document.querySelectorAll("[data-module]"));

  const setOpen = (moduleEl, open) => {
    const btn = moduleEl.querySelector(".module__head");
    const body = moduleEl.querySelector(".module__body");
    if (!btn || !body) return;

    moduleEl.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");

    if (open) {
      body.style.height = body.scrollHeight + "px";
    } else {
      body.style.height = "0px";
    }
  };

  const closeAllExcept = (keepEl) => {
    modules.forEach((m) => {
      if (m !== keepEl) setOpen(m, false);
    });
  };

  // init: tudo fechado
  modules.forEach((m) => setOpen(m, false));

  modules.forEach((m) => {
    const btn = m.querySelector(".module__head");
    const body = m.querySelector(".module__body");
    if (!btn || !body) return;

    btn.addEventListener("click", () => {
      const isOpen = m.classList.contains("is-open");
      closeAllExcept(m);
      setOpen(m, !isOpen);
    });

    window.addEventListener(
      "resize",
      () => {
        if (m.classList.contains("is-open")) {
          body.style.height = body.scrollHeight + "px";
        }
      },
      { passive: true }
    );
  });

  // -----------------------------
  // 3) Nav swap (scroll)
  // -----------------------------
  const swapThreshold = 80;
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > swapThreshold);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // -----------------------------
  // 4) Correção de hash no load (com header fixo)
  // -----------------------------
  // O CSS já resolve com scroll-margin-top. Isso aqui só garante que,
  // ao abrir a página diretamente com #hash, a posição final fique certinha.
  window.addEventListener("load", () => {
    const hash = window.location.hash;
    if (!hash) return;

    const el = document.querySelector(hash);
    if (!el) return;

    // "auto" para não dar double-smooth no load
    setTimeout(() => {
      el.scrollIntoView({ behavior: "auto", block: "start" });
    }, 0);
  });
})();
