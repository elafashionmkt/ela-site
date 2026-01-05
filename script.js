(() => {
  const root = document.documentElement;

  const hero = document.querySelector(".hero");
  const hamburger = document.querySelector(".hamburger");
  const mobile = document.getElementById("mobileMenu");
  const closeBtn = mobile?.querySelector(".mobile__close");
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const getTopbarHeight = () => {
    const v = getComputedStyle(root).getPropertyValue("--topbar-total-current");
    return Number.parseFloat(v) || 0;
  };

  // ===== Topbar compacta ao rolar =====
  const setCompact = (isCompact) => root.classList.toggle("is-compact", isCompact);

  const onTopbarScroll = () => setCompact(window.scrollY > 12);
  onTopbarScroll();
  window.addEventListener("scroll", onTopbarScroll, { passive: true });

  // ===== Mobile menu =====
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
  mobile?.addEventListener("click", (e) => { if (e.target === mobile) closeMenu(); });
  mobile?.querySelectorAll("a").forEach(a => a.addEventListener("click", closeMenu));

  // ===== Accordion: fecha os outros ao abrir =====
  const accs = Array.from(document.querySelectorAll(".acc"));
  accs.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      accs.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  // ===== Menu ativo (NENHUM ativo no topo/hero) =====
  const navLinks = Array.from(document.querySelectorAll(".navlink"))
    .filter(a => (a.getAttribute("href") || "").startsWith("#"));

  const sections = navLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const clearActive = () => navLinks.forEach(a => a.classList.remove("is-active"));

  const setActive = (id) => {
    navLinks.forEach(a => a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`));
  };

  const computeActive = () => {
    // Se hero ainda domina a viewport, NÃO ativa nada
    if (hero) {
      const heroBottom = hero.getBoundingClientRect().bottom + window.scrollY;
      if (window.scrollY < (heroBottom - getTopbarHeight() - 140)) {
        clearActive();
        return;
      }
    }

    const top = window.scrollY + getTopbarHeight() + 90;
    let current = "";

    for (const s of sections) {
      if (!s?.id) continue;
      if (top >= s.offsetTop) current = s.id;
    }

    if (!current) clearActive();
    else setActive(current);
  };

  computeActive();
  window.addEventListener("scroll", computeActive, { passive: true });
  window.addEventListener("resize", computeActive);

  // ===== Scroll suave com offset do header (sem blur) =====
  const scrollToTarget = (target, hash) => {
    const offset = target.getBoundingClientRect().top + window.scrollY - getTopbarHeight();
    window.scrollTo({ top: offset, behavior: prefersReducedMotion.matches ? "auto" : "smooth" });
    if (hash) history.replaceState(null, "", hash);
  };

  const clickableAnchors = Array.from(document.querySelectorAll(
    ".navlink, .mobile__link, .logo, .footer__link[href^='#']"
  ));

  clickableAnchors.forEach((link) => {
    const href = link.getAttribute("href") || "";
    if (!href.startsWith("#")) return;

    link.addEventListener("click", (e) => {
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      scrollToTarget(target, href);
    });
  });
})();
