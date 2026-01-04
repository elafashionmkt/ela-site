// script.js
(() => {
  // Progressive enhancement
  document.documentElement.classList.add("js");

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
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
    const fallback = () => setCompact(window.scrollY > hero.offsetHeight);
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
    window.setTimeout(() => { mobile.hidden = true; }, 260);
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = mobile && !mobile.hidden;
    isOpen ? closeMenu() : openMenu();
  });

  closeBtn?.addEventListener("click", closeMenu);

  mobile?.addEventListener("click", (e) => {
    if (e.target === mobile) closeMenu();
  });

  mobile?.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));

  // ===== Smooth anchor navigation (no blur / no wipe) =====
  const anchorLinks = Array.from(document.querySelectorAll('a[href^="#"]'))
    .filter((a) => a.getAttribute("href") && a.getAttribute("href") !== "#");

  const scrollToHash = (hash) => {
    const target = document.querySelector(hash);
    if (!target) return;

    const top = hash === "#top"
      ? 0
      : (target.getBoundingClientRect().top + window.scrollY - getTopbarHeight());

    const behavior = prefersReducedMotion.matches ? "auto" : "smooth";
    window.scrollTo({ top, behavior });
    history.replaceState(null, "", hash);
  };

  anchorLinks.forEach((a) => {
    a.addEventListener("click", (event) => {
      const href = a.getAttribute("href");
      if (!href || !href.startsWith("#")) return;
      const target = document.querySelector(href);
      if (!target) return;
      event.preventDefault();
      scrollToHash(href);
    });
  });

  // ===== Accordion (from spec/acordeon.md) =====
  const accordionHost = document.getElementById("servicesAccordion");

  const parseAccordionSpec = (raw) => {
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
        .filter((l) => l.startsWith("•"))
        .map((l) => l.replace(/^•\s*/, "").trim());

      const colon = titleLine.indexOf(":");
      const key = colon >= 0 ? titleLine.slice(0, colon + 1).trim() : titleLine.trim();
      const rest = colon >= 0 ? titleLine.slice(colon + 1).trim() : "";

      return { key, rest, bullets };
    }).filter((b) => b.key);
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

      const lineWrap = document.createElement("div");
      lineWrap.className = "acc__line";
      lineWrap.setAttribute("aria-hidden", "true");
      const rule = document.createElement("img");
      rule.className = "acc__rule";
      rule.src = "./assets/linha.svg";
      rule.alt = "";
      rule.setAttribute("aria-hidden", "true");
      lineWrap.appendChild(rule);

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
      details.appendChild(lineWrap);
      details.appendChild(body);

      frag.appendChild(details);
    });

    accordionHost.replaceChildren(frag);

    // fecha os outros ao abrir
    const accs = Array.from(accordionHost.querySelectorAll("details.acc"));
    accs.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        accs.forEach((o) => { if (o !== d) o.open = false; });
      });
    });
  };

  if (accordionHost) {
    const specUrl = accordionHost.getAttribute("data-spec") || "./spec/acordeon.md";
    fetch(specUrl)
      .then((r) => {
        if (!r.ok) throw new Error(`fetch failed: ${r.status}`);
        return r.text();
      })
      .then((txt) => buildAccordion(parseAccordionSpec(txt)))
      .catch((err) => {
        console.warn("accordion spec not loaded", err);
      });
  }

  // ===== Nav active (scroll) =====
  const navLinks = Array.from(document.querySelectorAll(".navlink"))
    .filter((a) => (a.getAttribute("href") || "").startsWith("#"));

  const sections = navLinks
    .map((a) => document.querySelector(a.getAttribute("href")))
    .filter(Boolean);

  let sectionTops = [];
  const measureSections = () => {
    sectionTops = sections.map((s) => s.getBoundingClientRect().top + window.scrollY);
  };

  const setActive = (id) => {
    navLinks.forEach((a) => {
      const href = a.getAttribute("href");
      a.classList.toggle("is-active", !!id && href === `#${id}`);
    });
  };

  const updateActive = () => {
    if (!sections.length) return;

    const y = window.scrollY + getTopbarHeight() + 120;

    let activeIdx = -1;
    for (let i = 0; i < sections.length; i++) {
      if (y >= sectionTops[i]) activeIdx = i;
    }

    if (activeIdx < 0) {
      setActive(null);
      return;
    }

    setActive(sections[activeIdx].id);
  };

  // ===== Scroll reveal (sem blur) =====
  const revealEls = Array.from(document.querySelectorAll(".reveal"));
  const updateReveal = () => {
    const vh = window.innerHeight || 1;
    const start = vh * 0.90;
    const end = vh * 0.40;

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
      updateReveal();
      updateActive();
      ticking = false;
    });
  };

  // init
  measureSections();
  updateReveal();
  updateActive();

  window.addEventListener("load", () => {
    measureSections();
    updateActive();
  });

  window.addEventListener("scroll", onScroll, { passive: true });
  window.addEventListener("resize", () => {
    measureSections();
    onScroll();
  });

  prefersReducedMotion.addEventListener?.("change", () => {
    updateReveal();
  });
})();
