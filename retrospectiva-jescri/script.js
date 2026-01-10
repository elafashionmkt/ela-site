(function () {
  // ----------------------
  // Auth (visual gate)
  // ----------------------
  const STORAGE_KEY = "jescri_retro_auth_v1";
  const PASSWORD = "jescri#2025";

  const body = document.body;
  const form = document.getElementById("authForm");
  const passInput = document.getElementById("authPass");
  const errorEl = document.getElementById("authError");
  const logoutLink = document.getElementById("logoutLink");

  const setAuthed = (value) => {
    if (value) {
      localStorage.setItem(STORAGE_KEY, "1");
      body.classList.add("is-auth");
      if (logoutLink) logoutLink.style.display = "";
    } else {
      localStorage.removeItem(STORAGE_KEY);
      body.classList.remove("is-auth");
      if (logoutLink) logoutLink.style.display = "none";
    }
  };

  // Auto auth if already stored
  if (localStorage.getItem(STORAGE_KEY) === "1") {
    setAuthed(true);
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (passInput?.value || "").trim();
      if (val === PASSWORD) {
        errorEl && (errorEl.style.display = "none");
        setAuthed(true);
        passInput && (passInput.value = "");
      } else {
        errorEl && (errorEl.style.display = "block");
        passInput && passInput.focus();
      }
    });
  }

  if (logoutLink) {
    logoutLink.addEventListener("click", (e) => {
      e.preventDefault();
      setAuthed(false);
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(() => passInput && passInput.focus(), 250);
    });
  }

  // ----------------------
  // Mobile nav toggle (elã)
  // ----------------------
  const nav = document.querySelector(".nav");
  const navToggle = document.querySelector(".nav__toggle");
  const navLinks = document.querySelector(".nav__links");

  const closeNav = () => {
    if (!nav) return;
    nav.classList.remove("is-open");
    document.documentElement.classList.remove("nav-open");
    navToggle && navToggle.setAttribute("aria-expanded", "false");
  };

  if (navToggle && nav) {
    navToggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      document.documentElement.classList.toggle("nav-open", open);
      navToggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
  }

  if (navLinks) {
    navLinks.querySelectorAll('a[href^="#"]').forEach((a) => {
      a.addEventListener("click", () => closeNav());
    });
  }

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });
})();