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
  // auth
  // esta página usa o mesmo login da área do cliente.
  // =======================
  const SESSION_KEY = "ela_auth_session_v1";
  const body = document.body;

  function requireSession(){
    try{
      const raw = localStorage.getItem(SESSION_KEY);
      if (!raw) throw new Error("sem sessão");
      const data = JSON.parse(raw);
      if (!data || data.clientId !== "jescri") throw new Error("cliente inválido");
      if (!data.expiresAt || Date.now() > data.expiresAt) throw new Error("sessão expirada");
      body.classList.add("is-auth");
      setTimeout(() => {
        const pdf = document.getElementById("pdfFrame");
        if (pdf) pdf.focus();
      }, 250);
    } catch(_e){
      const next = encodeURIComponent(location.pathname + location.search + location.hash);
      location.href = `/area-do-cliente/?next=${next}`;
    }
  }

  requireSession();

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
    logoutBtn.addEventListener("click", () => {
      try{ localStorage.removeItem(SESSION_KEY); } catch(_e){}
      const next = encodeURIComponent(location.pathname + location.search + location.hash);
      location.href = `/area-do-cliente/?next=${next}`;
    });
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
  // avaliação (envio automático via google forms)
  // GOOGLE_FORMS_AUTOSUBMIT_V2
  // =======================
  const FORM_POST_URL = "https://docs.google.com/forms/d/e/1FAIpQLSeZvuCUzldwv02gqtE-auA1mMt87wE0frygYrs6tqklLCOfhQ/formResponse";
  const ENTRY_RATE = "entry.622540097";
  const ENTRY_COMMENT = "entry.1419897417";
  const ENTRY_DATE = "entry.1369629969";
  const ENTRY_TIME = "entry.1466132269";

  const ratingBtns = Array.from(document.querySelectorAll(".rating__btn"));
  const feedbackBox = document.getElementById("feedback");
  const sendBtn = document.getElementById("sendFeedback");
  const statusEl = document.getElementById("feedbackStatus");
  let selected = null;
  let sending = false;

  function pad2(n){ return String(n).padStart(2, "0"); }

  function nowDateStr(){ 
    const d = new Date();
    return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())}`;
  }

  function nowTimeStr(){ 
    const d = new Date();
    return `${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
  }

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

  async function sendToForms(rate, comment){
    const params = new URLSearchParams();
    params.append(ENTRY_RATE, String(rate));
    params.append(ENTRY_COMMENT, comment || "");
    params.append(ENTRY_DATE, nowDateStr());
    params.append(ENTRY_TIME, nowTimeStr());

    await fetch(FORM_POST_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      body: params.toString()
    });
  }

  if (sendBtn){
    sendBtn.addEventListener("click", async () => {
      if (sending) return;
      if (!selected){
        if (statusEl) statusEl.textContent = "escolhe uma nota primeiro";
        return;
      }

      sending = true;
      sendBtn.disabled = true;
      const old = sendBtn.textContent;
      sendBtn.textContent = "enviando…";
      if (statusEl) statusEl.textContent = "enviando sua avaliação…";

      const comment = (feedbackBox?.value || "").trim();

      try {
        await sendToForms(selected, comment);
        if (statusEl) statusEl.textContent = "enviado ✓ obrigada!";
        if (feedbackBox) feedbackBox.value = "";
        setSelected(null);
      } catch (e) {
        if (statusEl) statusEl.textContent = "não consegui enviar. tenta de novo.";
      } finally {
        sending = false;
        sendBtn.disabled = false;
        sendBtn.textContent = old || "enviar";
      }
    });
  }

})();