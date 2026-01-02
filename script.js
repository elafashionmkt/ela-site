(() => {
  // menu mobile
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  const openMenu = () => {
    hamburger.classList.add("open");
    mobileMenu.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = hamburger.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.addEventListener("click", (e) => {
    if (e.target && e.target.tagName === "A") closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // acordeão (multi-open)
  const headers = document.querySelectorAll(".accordion-header");

  const setPanelHeight = (panel, open) => {
    if (!panel) return;
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + "px";
    } else {
      panel.style.maxHeight = "0px";
    }
  };

  headers.forEach((header) => {
    const panel = header.nextElementSibling;

    // inicia fechado
    if (panel) panel.style.maxHeight = "0px";

    header.addEventListener("click", () => {
      const isOpen = header.classList.contains("open");
      header.classList.toggle("open", !isOpen);
      setPanelHeight(panel, !isOpen);
    });
  });

  // recalcula alturas abertas no resize
  window.addEventListener("resize", () => {
    document.querySelectorAll(".accordion-header.open").forEach((header) => {
      const panel = header.nextElementSibling;
      setPanelHeight(panel, true);
    });
  });
})();
