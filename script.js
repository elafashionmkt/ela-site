// script.js
(() => {
  // Progressive enhancement: só ativa efeitos se JS rodar.
  document.documentElement.classList.add("js");

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const pageWipe = document.getElementById("page-wipe");
  const hero = document.querySelector(".hero");

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const getTopbarHeight = () => {
    const v = getComputedStyle(root).getPropertyValue("--topbar-current");
    return parseFloat(v) || 0;
  };

  // ===== Topbar height (hero -> compact) =====
  const setCompact = (isCompact) => {
    root.classList.toggle("is-compact", isCompact);
  };

  if ("IntersectionObserver" in window && hero) {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => setCompact(!entry.isIntersecting));
    }, { threshold: 0.01 });

    obs.observe(hero);
  } else if (hero) {
    const fallback = () => {
      setCompact(window.scrollY > hero.offsetHeight);
    };
    fallback();
    window.addEventListener("scroll", fallback, { passive: true });
  }

  // ===== Mobile menu =====
  const hamburger = document.querySelector(".hamburger");
  const mobile = document.getElementById("mobileMenu");
  const mobilePanel = mobile?.querySelector(".mobile__panel");
  const closeBtn = mobile?.querySelector(".mobile__close");

  const openMenu = () => {
    if (!mobile) return;
    mobile.hidden = false;
    requestAnimationFrame(() => mobile.classList.add("is-open"));
    hamburger?.setAttribute("aria-expanded", "true");
    document.body.style.overflow = "hidden";
  };

  const closeMenu = () => {
    if (!mobile) return;
    mobile.classList.remove("is-open");
    hamburger?.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    setTimeout(() => { mobile.hidden = true; }, 260);
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = mobile && !mobile.hidden;
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn?.addEventListener("click", closeMenu);

  mobile?.addEventListener("click", (e) => {
    if (e.target === mobile) closeMenu();
  });

  mobile?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  // ===== Accordion: opcional fechar os outros =====
  const accs = Array.from(document.querySelectorAll(".acc"));
  accs.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      accs.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  // ===== Nav active (scroll) =====
  const links = Array.from(document.querySelectorAll(".navlink"))
    .filter(a => a.getAttribute("href")?.startsWith("#"));

  const sections = links
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const setActive = (id) => {
    links.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  };

  if ("IntersectionObserver" in window && sections.length) {
    const obs = new IntersectionObserver((entries) => {
      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target?.id) setActive(visible.target.id);
    }, { rootMargin: "-50% 0px -42% 0px", threshold: [0.1, 0.2, 0.35, 0.5, 0.7] });

    sections.forEach(s => obs.observe(s));
  }

  // ===== Scroll reveal (sem opacidade; mais “mask/clip” tipo ref) =====
  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  const update = () => {
    const vh = window.innerHeight || 1;

    // “start/end” para sensação de scrub
    const start = vh * 0.90;
    const end   = vh * 0.40;

    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();

      // progresso 0..1 baseado na posição do topo do elemento
      const p = clamp((start - r.top) / (start - end), 0, 1);

      // movimento sutil (sem opacidade)
      const ty = (1 - p) * 14;

      el.style.setProperty("--ty", `${ty.toFixed(2)}px`);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      update();
      ticking = false;
    });
  };

  // init
  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ===== Wipe navigation =====
  const navTriggers = Array.from(document.querySelectorAll(
    ".navlink, .mobile__link, .toTop, .logo, .footer__link[href^='#']"
  ));

  let isWiping = false;

  const scrollToTarget = (target, hash, instant = false) => {
    const offset = target.getBoundingClientRect().top + window.scrollY - getTopbarHeight();
    const behavior = (instant || prefersReducedMotion.matches) ? "auto" : "smooth";
    window.scrollTo({ top: offset, behavior });
    if (hash) history.replaceState(null, "", hash);
  };

  const runWipeNavigation = (target, hash) => {
    if (!target) return;

    if (!pageWipe || prefersReducedMotion.matches || !root.classList.contains("js")) {
      scrollToTarget(target, hash);
      return;
    }

    if (isWiping) return;
    isWiping = true;

    let fallbackTimer;
    const cleanUp = () => {
      pageWipe.classList.remove("is-active", "is-leaving");
      root.classList.remove("is-wiping");
      isWiping = false;
      clearTimeout(fallbackTimer);
    };

    const onEnterEnd = (event) => {
      if (event.target !== pageWipe) return;
      pageWipe.removeEventListener("transitionend", onEnterEnd);
      scrollToTarget(target, hash, true);
      pageWipe.classList.add("is-leaving");
    };

    const onLeaveEnd = (event) => {
      if (event.target !== pageWipe || !pageWipe.classList.contains("is-leaving")) return;
      pageWipe.removeEventListener("transitionend", onLeaveEnd);
      cleanUp();
    };

    pageWipe.addEventListener("transitionend", onEnterEnd);
    pageWipe.addEventListener("transitionend", onLeaveEnd);

    root.classList.add("is-wiping");
    pageWipe.classList.remove("is-leaving");
    pageWipe.classList.add("is-active");

    fallbackTimer = window.setTimeout(cleanUp, 1400);
  };

  navTriggers.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#") || link.classList.contains("skip")) return;

    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      runWipeNavigation(target, href);
    });
  });
})();