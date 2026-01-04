(() => {
  // Progressive enhancement: só ativa efeitos se JS rodar.
  document.documentElement.classList.add("js");

  const root = document.documentElement;
  const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const hero = document.querySelector(".hero");

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

    const delay = prefersReducedMotion.matches ? 0 : 260;
    window.setTimeout(() => { mobile.hidden = true; }, delay);
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

  // ===== Nav active (scrollspy) =====
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
    }, { rootMargin: "-45% 0px -45% 0px", threshold: [0.12, 0.25, 0.4, 0.6] });

    sections.forEach(s => obs.observe(s));
  }

  // ===== Accordion: carrega do spec/acordeon.md (sem quebrar se falhar) =====
  const accordionRoot = document.getElementById("accordion");

  const mdToHtmlBody = (md) => {
    const safe = md
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const lines = safe.split("\n").map(l => l.trim());
    let html = "";
    let inList = false;

    for (const line of lines) {
      if (!line) continue;

      const isBullet = /^[-*]\s+/.test(line);
      if (isBullet) {
        if (!inList) { inList = true; html += "<ul class=\"acc__list\">"; }
        const li = line.replace(/^[-*]\s+/, "").replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html += `<li>${li}</li>`;
      } else {
        if (inList) { inList = false; html += "</ul>"; }
        const p = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
        html += `<p class="body">${p}</p>`;
      }
    }
    if (inList) html += "</ul>";
    return html;
  };

  const parseAccordionItems = (md) => {
    const normalized = md.replace(/\r/g, "");
    const parts = normalized.split(/\n##\s+/g);

    // Remove o que vier antes do primeiro "##"
    const chunks = parts.slice(1);

    return chunks.map(chunk => {
      const block = chunk.trim();
      const [titleLine, ...rest] = block.split("\n");
      return {
        title: (titleLine || "").trim(),
        body: rest.join("\n").trim(),
      };
    }).filter(it => it.title && it.body);
  };

  const renderAccordion = (items) => {
    if (!accordionRoot) return;

    accordionRoot.innerHTML = items.map((it) => {
      const titleHtml = it.title.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return `
        <details class="acc">
          <summary class="acc__sum">
            <span class="acc__title">${titleHtml}</span>
            <span class="acc__icon" aria-hidden="true"></span>
          </summary>
          <div class="acc__body">
            ${mdToHtmlBody(it.body)}
          </div>
        </details>
      `.trim();
    }).join("");
  };

  const wireAccordionCloseOthers = () => {
    const accs = Array.from(document.querySelectorAll(".acc"));
    accs.forEach((d) => {
      d.addEventListener("toggle", () => {
        if (!d.open) return;
        accs.forEach((o) => { if (o !== d) o.open = false; });
      });
    });
  };

  const initAccordionFromSpec = async () => {
    if (!accordionRoot) return;

    try {
      const res = await fetch("./spec/acordeon.md", { cache: "no-store" });
      if (!res.ok) return;

      const md = await res.text();
      const items = parseAccordionItems(md);

      if (!items.length) return;

      renderAccordion(items);
      wireAccordionCloseOthers();
    } catch {
      // Silencioso: não quebra o site e não polui console.
    }
  };

  // Mantém comportamento atual e depois tenta substituir pelo spec
  wireAccordionCloseOthers();
  initAccordionFromSpec();

  // ===== Scroll reveal (sem opacidade) =====
  if (!prefersReducedMotion.matches) {
    const revealEls = Array.from(document.querySelectorAll(".reveal"));
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

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
  }
})();
