// Vanilla interactions:
// - reveal on scroll
// - accordion (single open, starts all closed)
// - fixed nav swap: logo -> norte
// - not-ish transitions for hash navigation

(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector(".nav");
  const transitionEl = document.querySelector(".pageTransition");

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
      const inner = body.firstElementChild;
      const target = inner ? inner.getBoundingClientRect().height : 0;
      body.style.height = `${Math.ceil(target)}px`;
    } else {
      body.style.height = "0px";
    }
  };

  const closeAllExcept = (keepEl) => {
    modules.forEach((m) => {
      if (m !== keepEl) setOpen(m, false);
    });
  };

  modules.forEach((m) => {
    const btn = m.querySelector(".module__head");
    const body = m.querySelector(".module__body");

    // init CLOSED
    setOpen(m, false);

    btn?.addEventListener("click", () => {
      const isOpen = m.classList.contains("is-open");
      closeAllExcept(m);
      setOpen(m, !isOpen);
    });

    window.addEventListener("resize", () => {
      if (m.classList.contains("is-open")) {
        const inner = body?.firstElementChild;
        const target = inner ? inner.getBoundingClientRect().height : 0;
        if (body) body.style.height = `${Math.ceil(target)}px`;
      }
    });
  });

  // -----------------------------
  // 3) Nav logo swap (scroll)
  // -----------------------------
  const swapThreshold = 80; // ajuste fino aqui se quiser mais cedo/tarde
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > swapThreshold);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // -----------------------------
  // 4) "not-ish" transition on hash navigation
  // -----------------------------
  const showTransition = () => {
    if (!transitionEl || prefersReduced) return;
    transitionEl.classList.add("is-active");
  };
  const hideTransition = () => {
    if (!transitionEl || prefersReduced) return;
    transitionEl.classList.remove("is-active");
  };

  const navHeight = () => {
    // pega o height real do menu fixo
    const n = document.querySelector(".nav");
    return n ? Math.ceil(n.getBoundingClientRect().height) : 0;
  };

  const scrollToHash = (hash) => {
    if (!hash || hash === "#") return;

    const el = document.querySelector(hash);
    if (!el) return;

    const top = window.pageYOffset + el.getBoundingClientRect().top - navHeight();
    window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
  };

  // Intercepta cliques em links internos
  const internalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  internalLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      // se já está no mesmo hash, só rola
      if (href === window.location.hash) {
        e.preventDefault();
        showTransition();
        scrollToHash(href);
        setTimeout(hideTransition, 280);
        return;
      }

      e.preventDefault();

      // 1) overlay entra
      showTransition();

      // 2) troca hash (sem pulo brusco)
      history.pushState(null, "", href);

      // 3) rola (com compensação do menu)
      setTimeout(() => {
        scrollToHash(href);
      }, prefersReduced ? 0 : 120);

      // 4) overlay sai
      setTimeout(hideTransition, prefersReduced ? 0 : 360);
    });
  });

  // Se usuário entra com hash na URL, ajusta o offset do menu
  window.addEventListener("load", () => {
    if (window.location.hash) {
      setTimeout(() => scrollToHash(window.location.hash), 0);
    }
  });

  // Voltar/avançar do navegador
  window.addEventListener("popstate", () => {
    showTransition();
    setTimeout(() => scrollToHash(window.location.hash), prefersReduced ? 0 : 120);
    setTimeout(hideTransition, prefersReduced ? 0 : 360);
  });
})();
