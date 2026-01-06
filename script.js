(function () {
  const hasMeaningfulText = (v) =>
    v !== null && v !== undefined && String(v).trim() !== "";

  const prefersReduced =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const nav = document.querySelector(".nav");

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
    if (!hasMeaningfulText(text)) return null;
    const safe = escapeHtml(String(text));
    const bolded = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return bolded.replace(/\n/g, "<br>");
  };

  const setMultiline = (el, text) => {
    if (!hasMeaningfulText(text)) return;
    el.innerHTML = escapeHtml(String(text)).replace(/\n/g, "<br>");
  };

  const raf = (fn) => window.requestAnimationFrame(fn);

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

    // data-text (textContent) - NÃO sobrescreve com vazio
    document.querySelectorAll("[data-text]").forEach((el) => {
      const key = el.getAttribute("data-text");
      if (!key || !(key in texts)) return;

      const v = texts[key];
      if (!hasMeaningfulText(v)) return;

      el.textContent = String(v);
    });

    // data-rich (**bold** + \n) - NÃO sobrescreve com vazio
    document.querySelectorAll("[data-rich]").forEach((el) => {
      const key = el.getAttribute("data-rich");
      if (!key || !(key in texts)) return;

      const html = renderMini(texts[key]);
      if (!html) return;

      el.innerHTML = html;
    });

    // data-multiline (\n -> <br>) - NÃO sobrescreve com vazio
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
      if (!hasMeaningfulText(src)) return;

      if (el.tagName.toLowerCase() === "img") {
        el.setAttribute("src", src);
      }
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
  // 1) Reveal on scroll
  // =============================
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  if (revealEls.length) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );

    revealEls.forEach((el) => io.observe(el));
  }

  // =============================
  // 2) Accordion (single open)
  // =============================
  const accordions = Array.from(document.querySelectorAll("[data-accordion]"));
  accordions.forEach((root) => {
    const heads = Array.from(root.querySelectorAll(".accordion__head"));

    const closeAll = () => {
      heads.forEach((btn) => {
        btn.setAttribute("aria-expanded", "false");
        const panel = btn.nextElementSibling;
        if (panel) panel.hidden = true;
      });
    };

    heads.forEach((btn) => {
      btn.addEventListener("click", () => {
        const isOpen = btn.getAttribute("aria-expanded") === "true";
        closeAll();
        if (!isOpen) {
          btn.setAttribute("aria-expanded", "true");
          const panel = btn.nextElementSibling;
          if (panel) panel.hidden = false;
        }
      });
    });
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
  // 4) Mobile menu + smooth anchors
  // =============================
  const header = document.querySelector("#header-bar");
  const backdrop = document.querySelector(".nav__backdrop");
  const toggleBtn = document.querySelector(".nav__toggle");
  const menuEl = document.querySelector("#site-menu");

  const getHeaderOffset = () => {
    const h = header ? header.getBoundingClientRect().height : 0;
    return Math.ceil(h);
  };

  const lockBodyScroll = () => {
    const y = window.scrollY || window.pageYOffset || 0;
    document.body.dataset.scrollY = String(y);
    document.body.style.position = "fixed";
    document.body.style.top = `-${y}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockBodyScroll = () => {
    const y = parseInt(document.body.dataset.scrollY || "0", 10);
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    delete document.body.dataset.scrollY;
    window.scrollTo(0, isNaN(y) ? 0 : y);
  };

  const openMenu = () => {
    if (!toggleBtn || !menuEl || !backdrop) return;
    document.body.classList.add("menu-open");
    toggleBtn.setAttribute("aria-expanded", "true");
    toggleBtn.setAttribute("aria-label", "Fechar menu");
    backdrop.hidden = false;
    lockBodyScroll();

    const firstLink = menuEl.querySelector('a[href^="#"]');
    if (firstLink) firstLink.focus({ preventScroll: true });
  };

  const closeMenu = () => {
    if (!toggleBtn || !backdrop) return;
    document.body.classList.remove("menu-open");
    toggleBtn.setAttribute("aria-expanded", "false");
    toggleBtn.setAttribute("aria-label", "Abrir menu");
    backdrop.hidden = true;
    unlockBodyScroll();
    toggleBtn.focus({ preventScroll: true });
  };

  const isMenuOpen = () => document.body.classList.contains("menu-open");

  if (toggleBtn) {
    toggleBtn.addEventListener("click", () => {
      isMenuOpen() ? closeMenu() : openMenu();
    });
  }

  if (backdrop) {
    backdrop.addEventListener("click", () => {
      if (isMenuOpen()) closeMenu();
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && isMenuOpen()) {
      e.preventDefault();
      closeMenu();
    }
  });

  const scrollToHash = (hash) => {
    if (!hash || hash === "#") return;
    const id = hash.slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    const offset = getHeaderOffset() + 12;
    const top = target.getBoundingClientRect().top + window.pageYOffset - offset;

    window.scrollTo({ top, behavior: prefersReduced ? "auto" : "smooth" });

    target.setAttribute("tabindex", "-1");
    target.focus({ preventScroll: true });
  };

  // Intercepta só cliques do menu (não quebra skip link)
  if (menuEl) {
    menuEl.addEventListener("click", (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;

      const hash = a.getAttribute("href");
      if (!hash) return;

      e.preventDefault();
      if (isMenuOpen()) closeMenu();

      raf(() => scrollToHash(hash));
      history.pushState(null, "", hash);
    });
  }

  // Se abrir já com hash, corrige offset
  window.addEventListener("load", () => {
    if (location.hash) {
      setTimeout(() => scrollToHash(location.hash), 0);
    }
  });

  // =============================
  // Boot
  // =============================
  bootContent();
})();
