// script.js
(function () {
  const body = document.body;

  // ---------- mobile menu ----------
  const hamburger = document.querySelector(".hamburger");
  const mobileMenu = document.getElementById("mobileMenu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  function openMenu() {
    if (!hamburger || !mobileMenu) return;
    body.classList.add("menu-open");
    mobileMenu.hidden = false;
    hamburger.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    if (!hamburger || !mobileMenu) return;
    body.classList.remove("menu-open");
    hamburger.setAttribute("aria-expanded", "false");
    window.setTimeout(() => {
      if (!body.classList.contains("menu-open")) mobileMenu.hidden = true;
    }, 250);
  }

  if (hamburger && mobileMenu) {
    hamburger.addEventListener("click", () => {
      const isOpen = body.classList.contains("menu-open");
      isOpen ? closeMenu() : openMenu();
    });

    mobileMenu.addEventListener("click", (e) => {
      if (e.target === mobileMenu) closeMenu();
    });

    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") closeMenu();
    });

    mobileLinks.forEach((a) => a.addEventListener("click", () => closeMenu()));
  }

  // ---------- accordion (abre vários) ----------
  const items = document.querySelectorAll("[data-acc]");

  function setPanelHeight(panel, open) {
    panel.style.overflow = "hidden";
    panel.style.transition = "max-height 220ms ease";
    panel.style.maxHeight = open ? panel.scrollHeight + "px" : "0px";
  }

  items.forEach((item) => {
    const trigger = item.querySelector(".accordion-trigger");
    const panel = item.querySelector(".accordion-panel");
    if (!trigger || !panel) return;

    panel.hidden = false; // anima via max-height
    panel.setAttribute("aria-hidden", "true");
    setPanelHeight(panel, false);

    trigger.addEventListener("click", () => {
      const isOpen = item.classList.contains("open");

      if (isOpen) {
        item.classList.remove("open");
        trigger.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
        setPanelHeight(panel, false);
      } else {
        item.classList.add("open");
        trigger.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
        setPanelHeight(panel, true);
      }
    });

    window.addEventListener("resize", () => {
      setPanelHeight(panel, item.classList.contains("open"));
    });
  });
})();
