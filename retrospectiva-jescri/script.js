(function () {
  // =======================
  // helpers (sem TDZ)
  // =======================
  function closeNav(){
    const navPanel = document.getElementById("navPanel");
    const toggle = document.querySelector(".nav__toggle");
    if (!navPanel) return;

    navPanel.classList.remove("is-open");
    navPanel.setAttribute("aria-hidden", "true");
    if (toggle) toggle.setAttribute("aria-expanded", "false");
    document.documentElement.style.overflow = "";
  }

  function openNav(){
    const navPanel = document.getElementById("navPanel");
    const toggle = document.querySelector(".nav__toggle");
    if (!navPanel) return;

    navPanel.classList.add("is-open");
    navPanel.setAttribute("aria-hidden", "false");
    if (toggle) toggle.setAttribute("aria-expanded", "true");
    document.documentElement.style.overflow = "hidden";
  }

  // =======================
  // auth (bloqueio visual)
  // sempre pede senha ao carregar
  // =======================
  const PASSWORD = "jescri#2025";

  const body = document.body;
  const form = document.getElementById("authForm");
  const passInput = document.getElementById("authPass");
  const errorEl = document.getElementById("authError");

  function setAuthed(ok){
    if (ok){
      body.classList.add("is-auth");
      // foco no pdf para setas funcionarem melhor
      setTimeout(() => {
        const pdf = document.getElementById("pdfFrame");
        if (pdf) pdf.focus();
      }, 250);
    } else {
      body.classList.remove("is-auth");
      closeNav();
      setTimeout(() => passInput && passInput.focus(), 160);
    }
  }

  // sempre começa bloqueado
  setAuthed(false);
  setTimeout(() => passInput && passInput.focus(), 220);

  if (form){
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const val = (passInput?.value || "").trim();
      if (val === PASSWORD){
        if (errorEl) errorEl.style.display = "none";
        if (passInput) passInput.value = "";
        setAuthed(true);
      } else {
        if (errorEl) errorEl.style.display = "block";
        if (passInput) passInput.focus();
      }
    });
  }

  // =======================
  // mobile nav
  // =======================
  const toggle = document.querySelector(".nav__toggle");
  const navPanel = document.getElementById("navPanel");
  const closeBtn = document.querySelector(".navPanel__close");
  const logoutBtn = document.getElementById("logoutBtn");

  if (toggle){
    toggle.addEventListener("click", () => {
      const isOpen = navPanel?.classList.contains("is-open");
      isOpen ? closeNav() : openNav();
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

  document.querySelectorAll(".navPanel__links a[href^='#']").forEach((a) => {
    a.addEventListener("click", () => closeNav());
  });

  if (logoutBtn){
    logoutBtn.addEventListener("click", () => setAuthed(false));
  }

  // =======================
  // fullscreen + keyboard
  // =======================
  const fsBtn = document.getElementById("fsBtn");
  const pdf = document.getElementById("pdfFrame");
  const kbdHint = document.getElementById("kbdHint");
  const PDF_URL = "retrospectiva.pdf#view=FitH&toolbar=0&navpanes=0";

  function inFullscreen(){
    return !!document.fullscreenElement;
  }

  function setFsLabel(){
    if (!fsBtn) return;
    fsBtn.textContent = inFullscreen() ? "sair da tela cheia" : "tela cheia";
  }

  function openPdfTab(){
    window.open(PDF_URL, "_blank", "noopener");
  }

  if (fsBtn){
    fsBtn.addEventListener("click", async () => {
      // iOS Safari e alguns webviews não suportam fullscreen em elementos
      if (!document.fullscreenEnabled || !pdf || !pdf.requestFullscreen){
        openPdfTab();
        return;
      }
      try{
        if (inFullscreen()){
          await document.exitFullscreen();
        } else {
          await pdf.requestFullscreen();
        }
      } catch(e){
        openPdfTab();
      }
      setFsLabel();
    });
  }
  document.addEventListener("fullscreenchange", setFsLabel);
  setFsLabel();

  // foco do pdf ao clicar, melhora setas
  if (pdf){
    pdf.addEventListener("load", () => {
      if (body.classList.contains("is-auth")){
        setTimeout(() => pdf.focus(), 200);
      }
    });
    pdf.addEventListener("click", () => pdf.focus());
  }

  // Se a pessoa apertar setas fora do iframe, focamos o pdf e avisamos
  const KEY_HINT_KEYS = new Set(["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","PageDown","PageUp"," "]);
  document.addEventListener("keydown", (e) => {
    if (!body.classList.contains("is-auth")) return;
    const tag = (e.target && e.target.tagName) ? e.target.tagName.toLowerCase() : "";
    const inField = tag === "input" || tag === "textarea";
    if (inField) return;

    if (KEY_HINT_KEYS.has(e.key) && pdf && document.activeElement !== pdf){
      pdf.focus();
      if (kbdHint) kbdHint.textContent = "teclas ativas no pdf. aperte novamente.";
      setTimeout(() => { if (kbdHint) kbdHint.textContent = ""; }, 1800);
    }
  });

  // =======================
  // avaliação (abre e-mail)
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
      const bodyMail = encodeURIComponent(
        `nota: ${selected}/5\n\ncomentário: ${comment || "(sem comentário)"}\n\n(enviado pela página da retrospectiva)`
      );
      window.location.href = `mailto:contato@elafashionmkt.com.br?subject=${subject}&body=${bodyMail}`;
      if (statusEl) statusEl.textContent = "e-mail aberto com a avaliação";
    });
  }
})();