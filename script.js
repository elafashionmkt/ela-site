(() => {
  "use strict";

  document.documentElement.classList.add("js");

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)") || { matches: false };

  // ========== Header compact ==========
  const setCompact = (compact) => {
    root.classList.toggle("is-compact", !!compact);
  };

  const onScrollCompact = () => {
    // Compact after a small scroll, matching the “hero -> compact” behavior
    setCompact(window.scrollY > 24);
  };

  onScrollCompact();
  window.addEventListener("scroll", onScrollCompact, { passive: true });

  // ========== Mobile menu ==========
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
    window.setTimeout(() => { mobile.hidden = true; }, 260);
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = mobile && !mobile.hidden;
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn?.addEventListener("click", closeMenu);
  mobile?.addEventListener("click", (e) => { if (e.target === mobile) closeMenu(); });
  mobile?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // ========== Smooth anchor navigation ==========
  const getTopbarHeight = () => {
    const v = getComputedStyle(root).getPropertyValue("--topbar-h");
    const n = parseFloat(v);
    return Number.isFinite(n) ? n : 0;
  };

  const scrollToHash = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;

    const top = hash === "#top"
      ? 0
      : (target.getBoundingClientRect().top + window.scrollY - getTopbarHeight());

    window.scrollTo({
      top,
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
    });

    history.replaceState(null, "", hash);
  };

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    a.addEventListener("click", (e) => {
      const el = document.querySelector(href);
      if (!el) return;
      e.preventDefault();
      scrollToHash(href);
    });
  });

  // ========== Nav active (NO active in hero/top) ==========
  const navLinks = Array.from(document.querySelectorAll(".navlink"))
    .filter((a) => (a.getAttribute("href") || "").startsWith("#"));

  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  const computeSectionTops = () =>
    sections.map((s) => s.getBoundingClientRect().top + window.scrollY);

  let sectionTops = computeSectionTops();

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("is-active", !!id && href === `#${id}`);
    });
  };

  const updateActiveOnScroll = () => {
    if (!sections.length) return;

    // Slight offset so the active changes in a “grid-correct” moment
    const y = window.scrollY + getTopbarHeight() + 120;

    // If we're above the first section, NOTHING is active (hero/top)
    if (y < sectionTops[0]) {
      setActive(null);
      return;
    }

    let activeIndex = 0;
    for (let i = 0; i < sectionTops.length; i++) {
      if (y >= sectionTops[i]) activeIndex = i;
    }

    setActive(sections[activeIndex].id);
  };

  // ========== Accordion from spec/acordeon.md ==========
  const accordionHost = document.getElementById("servicesAccordion");

  const parseSpec = (raw) => {
    const text = String(raw || "").replace(/\r\n?/g, "\n");
    const blocks = text
      .split(/\n\s*\n+/g)
      .map((b) => b.trim())
      .filter(Boolean);

    return blocks.map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.replace(/\t+/g, " ").trim())
        .filter(Boolean);

      const titleLine = lines[0] || "";
      const bullets = lines
        .slice(1)
        .map((l) => l.replace(/^•\s*/, "").trim())
        .filter((l) => l.length > 0);

      const c = titleLine.indexOf(":");
      const key = c >= 0 ? titleLine.slice(0, c + 1).trim() : titleLine.trim();
      const rest = c >= 0 ? titleLine.slice(c + 1).trim() : "";

      return { key, rest, bullets };
    }).filter((it) => it.key);
  };

  const buildAccordion = (items) => {
    if (!accordionHost) return;

    const frag = document.createDocumentFragment();

    items.forEach((item, idx) => {
      const details = document.createElement("details");
      details.className = "acc";
      if (idx === 0) details.open = true;

      const summary = document.createElement("summary");
      summary.className = "acc__sum";

      const title = document.createElement("span");
      title.className = "acc__title";
      title.innerHTML = `<strong>${item.key}</strong> ${item.rest}`.trim();

      const icon = document.createElement("span");
      icon.className = "acc__icon";
      icon.setAttribute("aria-hidden", "true");

      summary.appendChild(title);
      summary.appendChild(icon);

      const ruleWrap = document.createElement("div");
      ruleWrap.className = "acc__line";
      ruleWrap.setAttribute("aria-hidden", "true");
      const rule = document.createElement("img");
      rule.className = "acc__rule";
      rule.src = "./assets/linha.svg";
      rule.alt = "";
      ruleWrap.appendChild(rule);

      const body = document.createElement("div");
      body.className = "acc__body";

      const ul = document.createElement("ul");
      ul.className = "acc__list";

      item.bullets.forEach((b) => {
        const li = document.createElement("li");
        const c = b.indexOf(":");
        if (c >= 0) {
          const label = b.slice(0, c + 1).trim();
          const rest = b.slice(c + 1).trim();
          li.innerHTML = `<strong>${label}</strong> ${rest}`.trim();
        } else {
          li.textContent = b;
        }
        ul.appendChild(li);
      });

      body.appendChild(ul);

      details.appendChild(summary);
      details.appendChild(ruleWrap);
      details.appendChild(body);

      frag.appendChild(details);
    });

    accordionHost.replaceChildren(frag);

    // Close others on open
    const accs = Array.from(accordionHost.querySelectorAll("details.acc"));
    accs.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        accs.forEach((o) => { if (o !== d) o.open = false; });
      });
    });
  };

  const initAccordion = async () => {
    if (!accordionHost) return;
    const specUrl = accordionHost.getAttribute("data-spec") || "./spec/acordeon.md";
    try {
      const res = await fetch(specUrl, { cache: "no-store" });
      if (!res.ok) return;
      const txt = await res.text();
      const items = parseSpec(txt);
      if (!items.length) return;
      buildAccordion(items);
    } catch {
      // silent (no console errors)
    }
  };

  // ========== Reveal (no opacity, no blur) ==========
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const updateReveal = () => {
    if (prefersReducedMotion.matches) return;
    const vh = window.innerHeight || 1;
    const start = vh * 0.9;
    const end = vh * 0.4;

    revealEls.forEach((el) => {
      const r = el.getBoundingClientRect();
      const p = (start - r.top) / (start - end);
      const clamped = Math.max(0, Math.min(1, p));
      const ty = (1 - clamped) * 14;
      el.style.setProperty("--ty", `${ty.toFixed(2)}px`);
    });
  };

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateReveal();
      updateActiveOnScroll();
      ticking = false;
    });
  };

  // Init
  initAccordion();
  updateReveal();
  updateActiveOnScroll();

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    sectionTops = computeSectionTops();
    onScroll();
  });
  window.addEventListener("load", () => {
    sectionTops = computeSectionTops();
    updateActiveOnScroll();
  });
})();
