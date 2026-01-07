// Vanilla interactions:
// - reveal on scroll
// - accordion (single open, starts all closed) [FIX: height via scrollHeight]
// - fixed nav swap: logo -> logo pequeno
// - transition overlay for hash navigation

(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector(".nav");
  const transitionEl = document.querySelector(".pageTransition");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");

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
  // 2) Accordion (single open) - FIXED
  // -----------------------------
  const modules = Array.from(document.querySelectorAll("[data-module]"));

  const setOpen = (moduleEl, open) => {
    const btn = moduleEl.querySelector(".module__head");
    const body = moduleEl.querySelector(".module__body");

    if (!btn || !body) return;

    moduleEl.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    body.setAttribute("aria-hidden", open ? "false" : "true");

    // FIX: mede via scrollHeight (robusto mesmo com overflow/height 0)
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

  // click
  modules.forEach((m) => {
    const btn = m.querySelector(".module__head");
    const body = m.querySelector(".module__body");
    if (!btn || !body) return;

    btn.addEventListener("click", () => {
      const isOpen = m.classList.contains("is-open");
      closeAllExcept(m);
      setOpen(m, !isOpen);
    });

    // recalcula altura aberta no resize (mantém animado/preciso)
    window.addEventListener("resize", () => {
      if (m.classList.contains("is-open")) {
        body.style.height = body.scrollHeight + "px";
      }
    });
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
  // 4) Mobile menu (hamburger)
  // -----------------------------
  const isMobileNav = () =>
    window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  const setNavState = (open) => {
    if (!nav || !navToggle || !navLinks) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    document.body.classList.toggle("nav-open", open);
    if (isMobileNav()) {
      navLinks.setAttribute("aria-hidden", open ? "false" : "true");
    } else {
      navLinks.removeAttribute("aria-hidden");
    }
    if (open && isMobileNav()) {
      const firstLink = navLinks.querySelector("a");
      if (firstLink) {
        setTimeout(() => firstLink.focus(), 0);
      }
    }
  };

  if (navToggle && navLinks && nav) {
    navToggle.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      setNavState(!isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => setNavState(false));
    });

    document.addEventListener("click", (event) => {
      if (!isMobileNav()) return;
      if (!nav.classList.contains("is-open")) return;
      if (!nav.contains(event.target)) {
        setNavState(false);
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!isMobileNav()) return;
      if (event.key === "Escape") {
        setNavState(false);
        navToggle.focus();
      }
    });

    window.addEventListener("resize", () => {
      if (!isMobileNav()) {
        setNavState(false);
      } else if (!nav.classList.contains("is-open")) {
        setNavState(false);
      }
    });

    setNavState(false);
  }

  // -----------------------------
  // 5) Transition on hash navigation
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

  // intercepta links internos
  const internalLinks = Array.from(document.querySelectorAll('a[href^="#"]'));
  internalLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();
      showTransition();

      history.pushState(null, "", href);

      setTimeout(() => {
        scrollToHash(href);
      }, prefersReduced ? 0 : 120);

      setTimeout(() => {
        hideTransition();
      }, prefersReduced ? 0 : 360);
    });
  });

  window.addEventListener("load", () => {
    if (window.location.hash) {
      setTimeout(() => scrollToHash(window.location.hash), 0);
    }
  });

  window.addEventListener("popstate", () => {
    showTransition();
    setTimeout(() => scrollToHash(window.location.hash), prefersReduced ? 0 : 120);
    setTimeout(hideTransition, prefersReduced ? 0 : 360);
  });
})();
