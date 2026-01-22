// [CLIENTE] Área do Cliente: Jescri
// - auth (senha)
// - accordion (single open)
// - mobile nav + hash navigation

(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // =======================
  // AUTH (bloqueio visual)
  // =======================
  const PASSWORD = "OzX223";

  const body = document.body;
  const form = document.getElementById("authForm");
  const passInput = document.getElementById("authPass");
  const errorEl = document.getElementById("authError");

  function setAuthed(ok) {
    if (ok) {
      body.classList.add("is-auth");
    } else {
      body.classList.remove("is-auth");
      setTimeout(() => passInput && passInput.focus(), 160);
    }
  }

  // sempre começa bloqueado
  setAuthed(false);
  setTimeout(() => passInput && passInput.focus(), 220);

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (passInput?.value || "").trim();
      if (val === PASSWORD) {
        if (errorEl) errorEl.style.display = "none";
        if (passInput) passInput.value = "";
        setAuthed(true);
      } else {
        if (errorEl) errorEl.style.display = "block";
        if (passInput) passInput.focus();
      }
    });
  }

  // =======================
  // ACCORDION (single open)
  // =======================
  const modules = Array.from(document.querySelectorAll("[data-module]"));

  function setOpen(moduleEl, open) {
    const btn = moduleEl.querySelector(".module__head");
    const bodyEl = moduleEl.querySelector(".module__body");
    if (!btn || !bodyEl) return;

    moduleEl.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    bodyEl.setAttribute("aria-hidden", open ? "false" : "true");

    if (open) {
      bodyEl.style.height = bodyEl.scrollHeight + "px";
    } else {
      bodyEl.style.height = "0px";
    }
  }

  function closeAllExcept(keepEl) {
    modules.forEach((m) => {
      if (m !== keepEl) setOpen(m, false);
    });
  }

  // init: tudo fechado
  modules.forEach((m) => setOpen(m, false));

  modules.forEach((m) => {
    const btn = m.querySelector(".module__head");
    const bodyEl = m.querySelector(".module__body");
    if (!btn || !bodyEl) return;

    btn.addEventListener("click", () => {
      const isOpen = m.classList.contains("is-open");
      closeAllExcept(m);
      setOpen(m, !isOpen);
    });

    window.addEventListener("resize", () => {
      if (m.classList.contains("is-open")) {
        bodyEl.style.height = bodyEl.scrollHeight + "px";
      }
    });
  });

  // =======================
  // MOBILE NAV (hamburger)
  // =======================
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");

  const isMobileNav = () =>
    window.matchMedia && window.matchMedia("(max-width: 768px)").matches;

  function setNavState(open) {
    if (!nav || !navToggle || !navLinks) return;
    nav.classList.toggle("is-open", open);
    navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    navToggle.setAttribute("aria-label", open ? "fechar menu" : "abrir menu");
    document.body.classList.toggle("nav-open", open);

    if (isMobileNav()) {
      navLinks.setAttribute("aria-hidden", open ? "false" : "true");
    } else {
      navLinks.removeAttribute("aria-hidden");
    }
  }

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

  // =======================
  // HASH NAV: abre o módulo ao clicar no menu
  // =======================
  const transitionEl = document.querySelector(".pageTransition");

  function showTransition() {
    if (!transitionEl || prefersReduced) return;
    transitionEl.classList.add("is-active");
  }
  function hideTransition() {
    if (!transitionEl || prefersReduced) return;
    transitionEl.classList.remove("is-active");
  }

  function navHeight() {
    const n = document.querySelector(".nav");
    return n ? Math.ceil(n.getBoundingClientRect().height) : 0;
  }

  function openByHash(hash) {
    if (!hash || hash === "#") return;
    const target = document.querySelector(hash);
    if (!target) return;

    // se for um módulo, abre
    if (target.matches("[data-module]")) {
      closeAllExcept(target);
      setOpen(target, true);
    }

    const top = window.pageYOffset + target.getBoundingClientRect().top - navHeight();
    window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });
  }

  // intercepta links internos do menu
  Array.from(document.querySelectorAll('a[href^="#"]')).forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || href === "#") return;

      e.preventDefault();
      showTransition();
      history.pushState(null, "", href);

      setTimeout(() => openByHash(href), prefersReduced ? 0 : 120);
      setTimeout(() => hideTransition(), prefersReduced ? 0 : 360);
    });
  });

  window.addEventListener("load", () => {
    if (window.location.hash) {
      setTimeout(() => openByHash(window.location.hash), 0);
    }
  });

  window.addEventListener("popstate", () => {
    showTransition();
    setTimeout(() => openByHash(window.location.hash), prefersReduced ? 0 : 120);
    setTimeout(() => hideTransition(), prefersReduced ? 0 : 360);
  });
})();
