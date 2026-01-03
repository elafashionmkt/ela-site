(() => {
  const byId = (id) => document.getElementById(id);

  const scrollToEl = (el, offset = 24) => {
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, y), behavior: "smooth" });
  };

  // IDs do layout (seções)
  const SECTION_IDS = [
    { key: "sobre", id: "19_10" },
    { key: "servicos", id: "19_15" },
    { key: "cafe", id: "18_24" },
  ];

  // Hero menu (Pixso IDs)
  const heroLinks = [
    { el: byId("2_14"), target: "19_10" }, // sobre nós
    { el: byId("2_13"), target: "19_15" }, // arquitetura
    { el: byId("2_15"), target: "18_24" }, // café
  ];

  heroLinks.forEach(({ el, target }) => {
    if (!el) return;
    el.addEventListener("click", () => scrollToEl(byId(target), 32));
    el.setAttribute("role", "link");
    el.tabIndex = 0;
    el.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") scrollToEl(byId(target), 32);
    });
  });

  // Sticky bar
  const stickybar = byId("stickybar");
  const stickyTop = byId("stickyTop");
  const burger = byId("burger");
  const drawer = byId("drawer");

  const stickyLinks = Array.from(document.querySelectorAll(".uLink[data-target]"));

  stickyTop?.addEventListener("click", (e) => {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // Drawer toggle (mobile)
  const closeDrawer = () => {
    drawer?.classList.remove("is-open");
    burger?.setAttribute("aria-expanded", "false");
    drawer?.setAttribute("aria-hidden", "true");
  };
  burger?.addEventListener("click", () => {
    const open = drawer?.classList.toggle("is-open");
    burger?.setAttribute("aria-expanded", open ? "true" : "false");
    drawer?.setAttribute("aria-hidden", open ? "false" : "true");
  });

  // Sticky links click
  stickyLinks.forEach((a) => {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const target = a.getAttribute("data-target");
      scrollToEl(byId(target), 56);
      closeDrawer();
    });
  });

  // Mostrar stickybar após o hero (usando topo do "sobre nós" como referência)
  const aboutEl = byId("19_10");
  const getAboutTop = () => (aboutEl ? aboutEl.getBoundingClientRect().top + window.scrollY : 999999);

  const setActive = (activeId) => {
    // hero
    heroLinks.forEach(({ el, target }) => el?.classList.toggle("is-active", target === activeId));
    // sticky
    stickyLinks.forEach((a) => a.classList.toggle("is-active", a.getAttribute("data-target") === activeId));
  };

  const onScroll = () => {
    const y = window.scrollY;

    // sticky visible quando chega perto do "sobre"
    const trigger = getAboutTop() - 60;
    if (stickybar) stickybar.classList.toggle("is-visible", y >= trigger);

    // seção ativa
    const offsets = SECTION_IDS.map(({ id }) => {
      const el = byId(id);
      const top = el ? el.getBoundingClientRect().top + window.scrollY : 999999;
      return { id, top };
    }).sort((a, b) => a.top - b.top);

    const current = offsets
      .filter((s) => y >= s.top - 120)
      .slice(-1)[0];

    if (current?.id) setActive(current.id);
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", onScroll);
  onScroll();

  // Reveal sutil (estilo NOT – leve)
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && e.target.classList.add("is-visible")),
      { threshold: 0.12 }
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
})();
