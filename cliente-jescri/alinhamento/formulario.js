(() => {
  const ENDPOINT = window.__FORM_ENDPOINT__;
  const PASS = window.__FORM_PASSWORD__;
  const GATE_KEY = window.__FORM_GATE_KEY__ || "ela_cliente_gate_ok";

  // gate
  const gate = document.getElementById("gate");
  const gateForm = document.getElementById("gateForm");
  const gatePass = document.getElementById("gatePass");
  const gateErr = document.getElementById("gateErr");

  function openGate() {
    gate.setAttribute("aria-hidden", "false");
    setTimeout(() => gatePass && gatePass.focus(), 50);
  }
  function closeGate() {
    gate.setAttribute("aria-hidden", "true");
  }

  try {
    if (localStorage.getItem(GATE_KEY) === "1") closeGate();
    else openGate();
  } catch {
    openGate();
  }

  gateForm?.addEventListener("submit", (e) => {
    e.preventDefault();
    const val = (gatePass?.value || "").trim();
    if (val === PASS) {
      try { localStorage.setItem(GATE_KEY, "1"); } catch {}
      closeGate();
      gateErr.textContent = "";
      gatePass.value = "";
    } else {
      gateErr.textContent = "senha incorreta";
      gatePass.select();
    }
  });

  // checkbox max + other handling helper
  function setupChecks(container) {
    const max = Number(container.dataset.max || "999");
    const entryName = container.dataset.entry; // e.g. entry.128...
    const otherName = container.dataset.otherName; // e.g. entry.128....other_option_response
    const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
    const otherInput = container.querySelector('[data-other-input]');

    function enforce() {
      const checked = checkboxes.filter(c => c.checked);
      if (checked.length >= max) {
        checkboxes.filter(c => !c.checked).forEach(c => c.disabled = true);
      } else {
        checkboxes.forEach(c => c.disabled = false);
      }
    }
    checkboxes.forEach(c => c.addEventListener("change", enforce));
    enforce();

    return { entryName, otherName, checkboxes, otherInput };
  }

  const checksGroups = Array.from(document.querySelectorAll(".checks")).map(setupChecks);

  const form = document.getElementById("customForm");
  const statusEl = document.getElementById("status");
  const submitBtn = document.getElementById("submitBtn");

  function setStatus(msg) {
    if (statusEl) statusEl.textContent = msg || "";
  }

  function validateRequiredRadios() {
    // we rely on native required for radios; but some browsers don't show messages in custom UI
    // We'll do a lightweight check to block submit if missing.
    const requiredRadios = Array.from(form.querySelectorAll('input[type="radio"][required]'));
    const groups = {};
    requiredRadios.forEach(r => { groups[r.name] = groups[r.name] || []; groups[r.name].push(r); });

    for (const name in groups) {
      if (!groups[name].some(r => r.checked)) return false;
    }
    return true;
  }

  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    setStatus("");

    if (!validateRequiredRadios()) {
      setStatus("revise: há campos obrigatórios sem resposta");
      return;
    }

    submitBtn.disabled = true;
    setStatus("enviando...");

    const fd = new FormData();

    // Radios + text inputs (direct entry.* names)
    Array.from(form.querySelectorAll('input[name^="entry."]')).forEach((el) => {
      const name = el.getAttribute("name");
      if (!name) return;

      if (el.type === "radio") {
        if (el.checked) fd.append(name, el.value);
      } else if (el.type === "text") {
        const v = (el.value || "").trim();
        if (v) fd.append(name, v);
      }
    });

    // Checkbox groups (we intentionally DID NOT name them to avoid browser posting duplicates unexpectedly)
    checksGroups.forEach(g => {
      const chosen = g.checkboxes.filter(c => c.checked).map(c => c.value);
      chosen.forEach(v => fd.append(g.entryName, v));

      const otherVal = (g.otherInput?.value || "").trim();
      if (otherVal) {
        // include "Outro" in the selection + the other response field (Google standard)
        fd.append(g.entryName, "Outro");
        if (g.otherName) fd.append(g.otherName, otherVal);
      }
    });

    try {
      await fetch(ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        body: fd
      });

      // opção a: limpa
      form.reset();
      // re-enable disabled checkboxes after reset
      checksGroups.forEach(g => g.checkboxes.forEach(c => c.disabled = false));
      setStatus("enviado. obrigada!");
      setTimeout(() => setStatus(""), 4500);
    } catch (err) {
      console.error(err);
      setStatus("não foi possível enviar agora. tente novamente.");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
