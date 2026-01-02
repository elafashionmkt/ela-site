(() => {
  const body = document.body;

  // ---------- Mobile menu ----------
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.querySelector(".mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  const openMenu = () => {
    body.classList.add("menu-open");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    body.classList.remove("menu-open");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  };

  if (hamburger) {
    hamburger.addEventListener("click", () => {
      const isOpen = body.classList.contains("menu-open");
      isOpen ? closeMenu() : openMenu();
    });
  }

  mobileLinks.forEach((a) => {
    a.addEventListener("click", () => closeMenu());
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // Close mobile menu if switching to desktop
  window.addEventListener("resize", () => {
    if (window.matchMedia("(min-width: 981px)").matches) closeMenu();
    syncAccordionHeights();
  });

  // ---------- Accordion ----------
  const accordionRoot = document.getElementById("accordion");
  const data = Array.isArray(window.ELA_ACCORDION_DATA) ? window.ELA_ACCORDION_DATA : [];

  const escapeHtml = (str) =>
    String(str)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const buildAccordion = () => {
    if (!accordionRoot || !data.length) return;

    const fragment = document.createDocumentFragment();

    data.forEach((module) => {
      const item = document.createElement("div");
      item.className = "acc-item";
      item.dataset.open = "false";

      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "acc-trigger";
      btn.setAttribute("aria-expanded", "false");

      const title = document.createElement("div");
      title.className = "acc-title";
      title.innerHTML = `
        <span class="stable-bold" data-text="${escapeHtml(module.etapa)}: ${escapeHtml(module.descricao)}">
          ${escapeHtml(module.etapa)}: ${escapeHtml(module.descricao)}
        </span>
      `;

      const icon = document.createElement("span");
      icon.className = "acc-icon";
      icon.setAttribute("aria-hidden", "true");

      btn.appendChild(title);
      btn.appendChild(icon);

      const panel = document.createElement("div");
      panel.className = "acc-panel";
      panel.setAttribute("role", "region");
      panel.setAttribute("aria-label", module.etapa);

      const inner = document.createElement("div");
      inner.className = "acc-panel-inner";

      // conteúdo (serviços)
      module.servicos.forEach((svc) => {
        const p = document.createElement("p");
        p.className = "service";
        p.innerHTML = `<strong>${escapeHtml(svc.titulo)}</strong>: ${escapeHtml(svc.texto)}`;
        inner.appendChild(p);
      });

      panel.appendChild(inner);

      btn.addEventListener("click", () => {
        const isOpen = item.dataset.open === "true";
        if (isOpen) {
          item.dataset.open = "false";
          btn.setAttribute("aria-expanded", "false");
          panel.style.maxHeight = "0px";
        } else {
          item.dataset.open = "true";
          btn.setAttribute("aria-expanded", "true");
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });

      item.appendChild(btn);
      item.appendChild(panel);
      fragment.appendChild(item);
    });

    accordionRoot.appendChild(fragment);
  };

  const syncAccordionHeights = () => {
    document.querySelectorAll(".acc-item[data-open='true'] .acc-panel").forEach((panel) => {
      panel.style.maxHeight = panel.scrollHeight + "px";
    });
  };

  buildAccordion();
  window.addEventListener("load", syncAccordionHeights);
})();
