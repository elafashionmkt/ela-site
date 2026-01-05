// script.js
(() => {
  // Progressive enhancement: só ativa efeitos se JS rodar.
  document.documentElement.classList.add("js");

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".hero");

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const getTopbarHeight = () => {
    const v = getComputedStyle(root).getPropertyValue("--topbar-total-current");
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
      else setActive("");
    }, { rootMargin: "-25% 0px -65% 0px", threshold: [0.12, 0.25, 0.4, 0.6] });

    sections.forEach(s => obs.observe(s));
  }

  // ===== Scroll reveal (sem opacidade; só “entrada” sutil) =====
  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  const update = () => {
    const vh = window.innerHeight || 1;
    const start = vh * 0.90;
    const end   = vh * 0.40;

    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = clamp((start - r.top) / (start - end), 0, 1);
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

  update();
  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);

  // ===== Navegação suave (sem blur/"wipe") =====
  const navTriggers = Array.from(document.querySelectorAll(
    ".navlink, .mobile__link, .logo, .footer__link[href^='#']"
  ));

  const scrollToTarget = (target, hash) => {
    const offset = target.getBoundingClientRect().top + window.scrollY - getTopbarHeight();
    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";
    window.scrollTo({ top: offset, behavior });
    if (hash) history.replaceState(null, "", hash);
  };

  navTriggers.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#") || link.classList.contains("skip")) return;
    link.addEventListener("click", (event) => {
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      scrollToTarget(target, href);
    });
  });
})();
