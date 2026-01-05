(() => {
  const root = document.documentElement;

  // ====== Compact on scroll (quando sai do topo/hero) ======
  const hero = document.querySelector(".hero");

  const setCompact = (v) => root.classList.toggle("is-compact", v);

  const computeCompact = () => {
    // No topo (antes de “passar” o hero), mantém estático
    const y = window.scrollY || 0;
    // Ajuste fino: quando passar 10px do topo já pode compactar? aqui não:
    // compacta só quando sair de um “respiro” (hero)
    if (!hero) return setCompact(y > 40);

    const heroBottom = hero.offsetTop + hero.offsetHeight;
    // compacta quando o scroll passa um pedaço do hero (fica natural)
    setCompact(y > (heroBottom - 220));
  };

  computeCompact();
  window.addEventListener("scroll", computeCompact, { passive: true });
  window.addEventListener("resize", computeCompact);

  // ====== Mobile menu ======
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
    setTimeout(() => { mobile.hidden = true; }, 240);
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

  // ====== Accordion: fecha os outros ao abrir ======
  const accs = Array.from(document.querySelectorAll(".acc"));
  accs.forEach((d) => {
    d.addEventListener("toggle", () => {
      if (!d.open) return;
      accs.forEach((o) => { if (o !== d) o.open = false; });
    });
  });

  // ====== Active menu (sem marcar no topo) ======
  const navLinks = Array.from(document.querySelectorAll(".navlink"))
    .filter(a => (a.getAttribute("href") || "").startsWith("#"));

  const targets = navLinks
    .map(a => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const clearActive = () => navLinks.forEach(a => a.classList.remove("is-active"));
  const setActive = (id) => {
    navLinks.forEach(a => {
      a.classList.toggle("is-active", a.getAttribute("href") === `#${id}`);
    });
  };

  // no topo: não marca nada
  const ensureTopNeutral = () => {
    const y = window.scrollY || 0;
    if (y < 80) clearActive();
  };

  ensureTopNeutral();
  window.addEventListener("scroll", ensureTopNeutral, { passive: true });

  if ("IntersectionObserver" in window && targets.length) {
    const obs = new IntersectionObserver((entries) => {
      // se está no topo, não marca
      if ((window.scrollY || 0) < 80) return clearActive();

      const visible = entries
        .filter(e => e.isIntersecting)
        .sort((a,b) => b.intersectionRatio - a.intersectionRatio)[0];

      if (visible?.target?.id) setActive(visible.target.id);
    }, {
      rootMargin: "-45% 0px -45% 0px",
      threshold: [0.15, 0.25, 0.35, 0.5, 0.7]
    });

    targets.forEach(s => obs.observe(s));
  }
})();
