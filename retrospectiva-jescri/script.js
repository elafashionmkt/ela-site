(function () {
  // =======================
  // auth (bloqueio visual)
  // =======================
  const STORAGE_KEY = "jescri_retro_auth_v2";
  const PASSWORD = "jescri#2025";

  const body = document.body;
  const form = document.getElementById("authForm");
  const passInput = document.getElementById("authPass");
  const errorEl = document.getElementById("authError");

  const logoutBtn = document.getElementById("logoutBtn");

  function setAuthed(ok){
    if (ok){
      localStorage.setItem(STORAGE_KEY, "1");
      body.classList.add("is-auth");
    } else {
      localStorage.removeItem(STORAGE_KEY);
      body.classList.remove("is-auth");
      closeNav();
      setTimeout(() => passInput && passInput.focus(), 120);
    }
  }

  if (localStorage.getItem(STORAGE_KEY) === "1"){
    setAuthed(true);
  } else {
    setTimeout(() => passInput && passInput.focus(), 200);
  }

  if (form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (passInput?.value || "").trim();
      if (val === PASSWORD){
        if (errorEl) errorEl.style.display = "none";
        setAuthed(true);
        if (passInput) passInput.value = "";
      } else {
        if (errorEl) errorEl.style.display = "block";
        if (passInput) passInput.focus();
      }
    });
  }

  if (logoutBtn){
    logoutBtn.addEventListener("click", () => setAuthed(false));
  }

  // =======================
  // mobile nav
  // =======================
  const navPanel = document.getElementById("navPanel");
  const toggle = document.querySelector(".nav__toggle");
  const closeBtn = document.querySelector(".navPanel__close");

  function openNav(){
    if (!navPanel) return;
    navPanel.classList.add("is-open");
    navPanel.setAttribute("aria-hidden", "false");
    toggle && toggle.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  }

  function closeNav(){
    if (!navPanel) return;
    navPanel.classList.remove("is-open");
    navPanel.setAttribute("aria-hidden", "true");
    toggle && toggle.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  }

  if (toggle){
    toggle.addEventListener("click", () => {
      const open = navPanel?.classList.contains("is-open");
      open ? closeNav() : openNav();
    });
  }
  if (closeBtn){ closeBtn.addEventListener("click", closeNav); }
  if (navPanel){
    navPanel.addEventListener("click", (e) => {
      if (e.target === navPanel) closeNav();
    });
  }
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeNav();
  });

  // fechar menu ao clicar em link
  document.querySelectorAll(".navPanel__links a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => closeNav());
  });

  // =======================
  // avaliação
  // =======================
  const ratingBtns = Array.from(document.querySelectorAll(".rating__btn"));
  const feedbackBox = document.getElementById("feedback");
  const sendBtn = document.getElementById("sendFeedback");
  const statusEl = document.getElementById("feedbackStatus");
  let selected = null;

  function setSelected(n){
    selected = n;
    ratingBtns.forEach((b) => {
      const on = Number(b.dataset.rate) === n;
      b.classList.toggle("is-on", on);
    });
    if (statusEl){
      statusEl.textContent = n ? `nota selecionada: ${n}` : "";
    }
  }

  ratingBtns.forEach((b) => {
    b.addEventListener("click", () => setSelected(Number(b.dataset.rate)));
  });

  if (sendBtn){
    sendBtn.addEventListener("click", () => {
      if (!selected){
        if (statusEl) statusEl.textContent = "escolhe uma nota primeiro";
        return;
      }
      const comment = (feedbackBox?.value || "").trim();
      const subject = encodeURIComponent("avaliação | retrospectiva jescri 2025");
      const body = encodeURIComponent(
        `nota: ${selected}/5\n\ncomentário: ${comment || "(sem comentário)"}\n\n(enviado pela página da retrospectiva)`
      );

      // abre o e-mail preenchido
      window.location.href = `mailto:contato@elafashionmkt.com.br?subject=${subject}&body=${body}`;

      if (statusEl) statusEl.textContent = "e-mail aberto com a avaliação";
    });
  }
})();