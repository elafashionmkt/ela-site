(function () {
  const prefersReduced =
    window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
    const safe = escapeHtml(text ?? "");
    const bolded = safe.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
    return bolded.replace(/\n/g, "<br>");
  };

  const setMultiline = (el, text) => {
    el.innerHTML = escapeHtml(text ?? "").replace(/\n/g, "<br>");
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
  // 2) Smooth anchor scroll (offset header)
  // =============================
  const getHeaderOffset = () => {
    const h = nav ? nav.offsetHeight : 0;
    return h + 18;
  };

  const scrollToHash = (hash, opts = {}) => {
    const id = String(hash || "").replace("#", "").trim();
    if (!id) return;

    const target = document.getElementById(id);
    if (!target) return;

    const targetTop = target.getBoundingClientRect().top + window.pageYOffset;
    const y = Math.max(0, targetTop - getHeaderOffset());

    const behavior = prefersReduced ? "auto" : "smooth";
    window.scrollTo({ top: y, behavior: opts.behavior || behavior });

    if (opts.updateUrl) {
      try {
        history.pushState(null, "", `#${id}`);
      } catch {
        // ignore
      }
    }
  };

  // Intercepta clicks em âncoras internas para garantir offset consistente
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]')).filter(
    (a) => a.getAttribute("href") && a.getAttribute("href") !== "#"
  );

  anchorLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;

      const id = href.slice(1);
      if (!document.getElementById(id)) return;

      e.preventDefault();
      if (navPanel && navPanel.classList.contains("is-open")) closeMenu({ restoreFocus: false });
      scrollToHash(href, { updateUrl: true });
    });
  });

  // Se a página carregar já com hash, corrige a posição
  window.addEventListener(
    "load",
    () => {
      if (location.hash) {
        setTimeout(() => scrollToHash(location.hash, { behavior: prefersReduced ? "auto" : "smooth" }), 0);
      }
    },
    { passive: true }
  );

  // =============================
  // 3) Mobile menu (overlay)
  // =============================
  const navToggle = document.querySelector(".nav__toggle");
  const navPanel = document.querySelector(".navPanel");

  let lockedScrollY = 0;
  let lastFocusEl = null;

  const lockBodyScroll = () => {
    lockedScrollY = window.scrollY || window.pageYOffset || 0;

    // Compensa scrollbar no desktop para não dar shift
    const scrollbarW = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarW > 0) document.body.style.paddingRight = `${scrollbarW}px`;

    document.body.style.position = "fixed";
    document.body.style.top = `-${lockedScrollY}px`;
    document.body.style.left = "0";
    document.body.style.right = "0";
    document.body.style.width = "100%";
  };

  const unlockBodyScroll = () => {
    document.body.style.position = "";
    document.body.style.top = "";
    document.body.style.left = "";
    document.body.style.right = "";
    document.body.style.width = "";
    document.body.style.paddingRight = "";

    window.scrollTo(0, lockedScrollY);
  };

  const openMenu = () => {
    if (!navPanel || !navToggle) return;

    lastFocusEl = document.activeElement instanceof HTMLElement ? document.activeElement : null;

    navPanel.classList.add("is-open");
    navPanel.setAttribute("aria-hidden", "false");
    navToggle.setAttribute("aria-expanded", "true");
    lockBodyScroll();

    const firstLink = navPanel.querySelector(".navPanel__links a");
    if (firstLink instanceof HTMLElement) firstLink.focus();
  };

  const closeMenu = (opts = {}) => {
    if (!navPanel || !navToggle) return;

    navPanel.classList.remove("is-open");
    navPanel.setAttribute("aria-hidden", "true");
    navToggle.setAttribute("aria-expanded", "false");
    unlockBodyScroll();

    if (opts.restoreFocus !== false && lastFocusEl) {
      lastFocusEl.focus();
    }
  };

  if (navToggle && navPanel) {
    navToggle.addEventListener("click", () => {
      const isOpen = navPanel.classList.contains("is-open");
      if (isOpen) closeMenu();
      else openMenu();
    });

    // Fechar por backdrop / botões
    navPanel.querySelectorAll("[data-menu-close]").forEach((el) => {
      el.addEventListener("click", () => closeMenu({ restoreFocus: false }));
    });

    // Fechar com ESC
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navPanel.classList.contains("is-open")) {
        closeMenu();
      }
    });
  }

  // =============================
  // 4) Accordion (single open, sem "pulo")
  // =============================
  const modules = Array.from(document.querySelectorAll("[data-module]"));

  const setOpen = (moduleEl, open) => {
    const btn = moduleEl.querySelector(".module__head");
    const body = moduleEl.querySelector(".module__body");
    if (!btn || !body) return;

    moduleEl.classList.toggle("is-open", open);
    btn.setAttribute("aria-expanded", open ? "true" : "false");

    // Reduced motion: sem animação
    if (prefersReduced) {
      body.hidden = !open;
      body.style.height = open ? "auto" : "0px";
      return;
    }

    // Remove listeners antigos (se existirem)
    const end = (fn) => {
      const handler = (ev) => {
        if (ev.propertyName !== "height") return;
        body.removeEventListener("transitionend", handler);
        fn();
      };
      body.addEventListener("transitionend", handler);
    };

    if (open) {
      body.hidden = false;
      body.style.height = "0px";
      raf(() => {
        body.style.height = body.scrollHeight + "px";
      });
      end(() => {
        if (moduleEl.classList.contains("is-open")) body.style.height = "auto";
      });
    } else {
      // Se estiver em auto, fixa altura atual antes de fechar
      const current = body.scrollHeight;
      body.style.height = current + "px";
      raf(() => {
        body.style.height = "0px";
      });
      end(() => {
        if (!moduleEl.classList.contains("is-open")) body.hidden = true;
      });
    }
  };

  const closeAllExcept = (keepEl) => {
    modules.forEach((m) => {
      if (m !== keepEl) setOpen(m, false);
    });
  };

  modules.forEach((m, idx) => {
    const btn = m.querySelector(".module__head");
    const body = m.querySelector(".module__body");
    if (!btn || !body) return;

    // A11y wiring
    btn.id = btn.id || `module-trigger-${idx + 1}`;
    body.id = body.id || `module-panel-${idx + 1}`;
    btn.setAttribute("aria-controls", body.id);
    body.setAttribute("aria-labelledby", btn.id);
    body.setAttribute("role", "region");

    // start closed
    body.hidden = true;
    body.style.height = "0px";
    btn.setAttribute("aria-expanded", "false");

    btn.addEventListener("click", () => {
      const isOpen = m.classList.contains("is-open");
      closeAllExcept(m);
      setOpen(m, !isOpen);
    });

    window.addEventListener(
      "resize",
      () => {
        if (!m.classList.contains("is-open")) return;
        if (prefersReduced) return;
        // Se estiver em height auto, deixa; senão atualiza
        if (body.style.height !== "auto") body.style.height = body.scrollHeight + "px";
      },
      { passive: true }
    );
  });

  // =============================
  // 5) Nav swap (scroll)
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
