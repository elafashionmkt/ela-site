(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector(".nav");

  // =============================
  // Menu mobile
  // =============================
  const toggleBtn = document.querySelector(".nav__toggle");
  const panel = document.getElementById("nav-panel");
  const navLinks = document.querySelectorAll(".nav__links a");

  let lastFocusEl = null;

  const closeMenu = () => {
    if (!nav) return;
    nav.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "false");
      toggleBtn.setAttribute("aria-label", "Abrir menu");
    }
    if (panel) panel.setAttribute("aria-hidden", "true");

    if (lastFocusEl && typeof lastFocusEl.focus === "function") {
      lastFocusEl.focus();
    }
    lastFocusEl = null;
  };

  const openMenu = () => {
    if (!nav) return;
    nav.classList.add("is-open");
    document.body.classList.add("menu-open");
    if (toggleBtn) {
      toggleBtn.setAttribute("aria-expanded", "true");
      toggleBtn.setAttribute("aria-label", "Fechar menu");
    }
    if (panel) panel.setAttribute("aria-hidden", "false");

    const firstLink = navLinks && navLinks.length ? navLinks[0] : null;
    if (firstLink) firstLink.focus();
  };

  if (toggleBtn && nav) {
    if (panel) panel.setAttribute("aria-hidden", "true");

    toggleBtn.addEventListener("click", () => {
      const isOpen = nav.classList.contains("is-open");
      if (isOpen) closeMenu();
      else {
        lastFocusEl = document.activeElement;
        openMenu();
      }
    });

    navLinks.forEach((a) => {
      a.addEventListener("click", () => closeMenu());
    });

    document.addEventListener("click", (e) => {
      if (!nav.classList.contains("is-open")) return;
      const t = e.target;
      if (t && nav.contains(t)) return;
      closeMenu();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    window.addEventListener(
      "resize",
      () => {
        if (window.innerWidth > 768) closeMenu();
      },
      { passive: true }
    );
  }

  // =============================
  // Helpers
  // =============================
  const escapeHtml = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  // mini-markdown seguro: **bold** + quebras de linha
  const renderMini = (text) => {
    const safe = escapeHtml(text ?? "");
    const bolded = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return bolded.replace(/\n/g, "<br>");
  };

  const setMultiline = (el, text) => {
    el.innerHTML = escapeHtml(text ?? "").replace(/\n/g, "<br>");
  };

  // =============================
  // 0) Theme + Content loader
  // =============================
  const applyTheme = (theme) => {
    if (!theme || !theme.vars) return;
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([k, v]) => {
      if (typeof k === "string" && k.startsWith("--")) {
        root.style.setProperty(k, String(v));
      }
    });
  };

  const applyContent = (content) => {
    if (!content) return;

    const texts = content.texts || {};
    const images = content.images || {};

    // data-text (textContent)
    document.querySelectorAll("[data-text]").forEach((el) => {
      const key = el.getAttribute("data-text");
      if (!key || !(key in texts)) return;
      el.textContent = String(texts[key]);
    });

    // data-rich (**bold** + \n)
    document.querySelectorAll("[data-rich]").forEach((el) => {
      const key = el.getAttribute("data-rich");
      if (!key || !(key in texts)) return;
      el.innerHTML = renderMini(texts[key]);
    });

    // data-multiline (\n -> <br>, sem markdown)
    document.querySelectorAll("[data-multiline]").forEach((el) => {
      const key = el.getAttribute("data-multiline");
      if (!key || !(key in texts)) return;
      setMultiline(el, texts[key]);
    });

    // data-img (src)
    document.querySelectorAll("[data-img]").forEach((el) => {
      const key = el.getAttribute("data-img");
      if (!key || !(key in images)) return;
      const src = String(images[key]);
      if (el.tagName.toLowerCase() === "img") el.setAttribute("src", src);
    });
  };

  const fetchJson = async (url) => {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return null;
      return await res.json();
    } catch {
      return null;
    }
  };

  const bootContent = async () => {
    const [theme, content] = await Promise.all([
      fetchJson("content/theme.json"),
      fetchJson("content/content.json"),
    ]);

    if (theme) applyTheme(theme);
    if (content) applyContent(content);
  };

  // =============================
  // 1) Reveal on scroll (sem esconder conteúdo)
  // =============================
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

  // =============================
  // 2) Accordion (single open) + aria
  // =============================
  const modules = Array.from(document.querySelectorAll("[data-module]"));

  modules.forEach((m, idx) => {
    const btn = m.querySelector(".module__head");
    const body = m.querySelector(".module__body");
    if (!btn || !body) return;

    const n = idx + 1;
    if (!btn.id) btn.id = "module-head-" + n;
    if (!body.id) body.id = "module-body-" + n;

    btn.setAttribute("aria-controls", body.id);
    body.setAttribute("aria-labelledby", btn.id);
    body.setAttribute("aria-hidden", "true");
  });

  const setOpen = (moduleEl, open) => {
    const btn = moduleEl.querySelector(".module__head");
    const body = moduleEl.querySelector(".module__body");
    if (!btn || !body) return;

    moduleEl.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");
    body.setAttribute("aria-hidden", open ? "false" : "true");

    if (open) body.style.height = body.scrollHeight + "px";
    else body.style.height = "0px";
  };

  const closeAllExcept = (keepEl) => {
    modules.forEach((m) => {
      if (m !== keepEl) setOpen(m, false);
    });
  };

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

  // =============================
  // 3) Nav swap (scroll)
  // =============================
  const swapThreshold = 80;
  const onScroll = () => {
    if (!nav) return;
    nav.classList.toggle("is-scrolled", window.scrollY > swapThreshold);
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  // =============================
  // Boot
  // =============================
  bootContent();
})();
