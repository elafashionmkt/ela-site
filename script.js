// script.js
(() => {
  // Progressive enhancement: só ativa efeitos se JS rodar.
  document.documentElement.classList.add("js");

  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0.1, 0.2, 0.35, 0.5, 0.7] });

    sections.forEach(s => obs.observe(s));
  }

  // ===== Scroll reveal (sem opacidade; mais “mask/clip” tipo ref) =====
  const supportsClip = CSS?.supports?.("clip-path", "inset(0 0 0 0)");
  const revealEls = Array.from(document.querySelectorAll(".reveal"));

  // se não suporta clip, ainda dá um leve translate/blur (ou nada)
  const update = () => {
    const vh = window.innerHeight || 1;

    // “start/end” para sensação de scrub
    const start = vh * 0.90;
    const end   = vh * 0.40;

    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();

      // progresso 0..1 baseado na posição do topo do elemento
      const p = clamp((start - r.top) / (start - end), 0, 1);

      // clip do fundo (100% escondido -> 0% visível)
      const clipB = (1 - p) * 100;

      // movimento sutil (sem opacidade)
      const ty = (1 - p) * 18;
      const blur = (1 - p) * 6;

      if (supportsClip) el.style.setProperty("--clipB", `${clipB.toFixed(2)}%`);
      el.style.setProperty("--ty", `${ty.toFixed(2)}px`);
      el.style.setProperty("--blur", `${blur.toFixed(2)}px`);
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
})();