(() => {
  const ENDPOINT = window.__FORM_ENDPOINT__;
  const PASS = window.__FORM_PASSWORD__;
  const GATE_KEY = window.__FORM_GATE_KEY__ || "ela_cliente_gate_ok";

  // gate
  const gate = document.getElementById("gate");
  const gateForm = document.getElementById("gateForm");
  const gatePass = document.getElementById("gatePass");
  const gateErr = document.getElementById("gateErr");

  function showGate(){ gate?.setAttribute("aria-hidden","false"); setTimeout(()=>gatePass?.focus(),60); }
  function hideGate(){ gate?.setAttribute("aria-hidden","true"); }

  try { localStorage.getItem(GATE_KEY)==="1" ? hideGate() : showGate(); }
  catch { showGate(); }

  gateForm?.addEventListener("submit",(e)=>{
    e.preventDefault();
    const v=(gatePass?.value||"").trim();
    if(v===PASS){
      try{ localStorage.setItem(GATE_KEY,"1"); }catch{}
      hideGate(); gateErr.textContent=""; gatePass.value="";
    }else{
      gateErr.textContent="senha incorreta";
      gatePass?.select();
    }
  });

  const form = document.getElementById("customForm");
  const statusEl = document.getElementById("status");
  const submitBtn = document.getElementById("submitBtn");

  const setStatus = (m)=>{ if(statusEl) statusEl.textContent = m || ""; };
  const clearErrors = ()=> document.querySelectorAll(".err[data-err]").forEach(p=>p.textContent="");
  const setErr = (k,m)=>{ const p=document.querySelector(`.err[data-err="${k}"]`); if(p) p.textContent=m||""; };

  function setupChecks(container){
    const max = Number(container.dataset.max || "999");
    const min = Number(container.dataset.min || "0");
    const required = (container.dataset.required || "false") === "true";
    const entryName = container.dataset.entry;
    const otherName = container.dataset.otherName;
    const checkboxes = Array.from(container.querySelectorAll('input[type="checkbox"]'));
    const otherInput = container.querySelector('[data-other-input]');

    function enforceMax(){
      const checked = checkboxes.filter(c=>c.checked);
      if(checked.length >= max){
        checkboxes.filter(c=>!c.checked).forEach(c=>c.disabled=true);
      } else {
        checkboxes.forEach(c=>c.disabled=false);
      }
    }
    checkboxes.forEach(c=>c.addEventListener("change", ()=>{ enforceMax(); setErr(entryName,""); }));
    otherInput?.addEventListener("input", ()=> setErr(entryName,""));
    enforceMax();

    function isValid(){
      const checkedCount = checkboxes.filter(c=>c.checked).length;
      const otherVal = (otherInput?.value || "").trim();
      const total = checkedCount + (otherVal ? 1 : 0);
      if(required && total < min) return false;
      if(total > max) return false;
      return true;
    }

    return {entryName, otherName, checkboxes, otherInput, min, max, required, isValid};
  }

  const checkGroups = Array.from(document.querySelectorAll(".checks")).map(setupChecks);

  function validate(){
    clearErrors();
    let firstInvalid = null;

    // required radio groups
    const requiredRadios = Array.from(form.querySelectorAll('input[type="radio"][required]'));
    const groups = {};
    requiredRadios.forEach(r=>{ groups[r.name]=groups[r.name]||[]; groups[r.name].push(r); });

    for(const name in groups){
      if(!groups[name].some(r=>r.checked)){
        setErr(name, "selecione uma opção");
        if(!firstInvalid) firstInvalid = groups[name][0];
      }
    }

    // required checkbox groups (min/max)
    for(const g of checkGroups){
      if(!g.isValid()){
        setErr(g.entryName, `selecione de ${g.min} a ${g.max}`);
        if(!firstInvalid) firstInvalid = g.checkboxes[0] || g.otherInput;
      }
    }

    if(firstInvalid){
      firstInvalid.scrollIntoView({behavior:"smooth", block:"center"});
      return false;
    }
    return true;
  }

  form?.addEventListener("submit", async (e)=>{
    e.preventDefault();
    setStatus("");

    if(!validate()){
      setStatus("revise: há campos obrigatórios sem resposta");
      return;
    }

    submitBtn.disabled = true;
    setStatus("enviando...");

    const fd = new FormData();

    // radios + text
    Array.from(form.querySelectorAll('input[name^="entry."]')).forEach((el)=>{
      const name = el.getAttribute("name");
      if(!name) return;

      if(el.type==="radio"){
        if(el.checked) fd.append(name, el.value);
      } else if(el.type==="text") {
        const v=(el.value||"").trim();
        if(v) fd.append(name, v);
      }
    });

    // checkbox groups (we append correctly for Google)
    checkGroups.forEach(g=>{
      g.checkboxes.filter(c=>c.checked).forEach(c=>fd.append(g.entryName, c.value));
      const otherVal = (g.otherInput?.value || "").trim();
      if(otherVal){
        fd.append(g.entryName, "Outro");
        if(g.otherName) fd.append(g.otherName, otherVal);
      }
    });

    try{
      await fetch(ENDPOINT, { method:"POST", mode:"no-cors", body: fd });
      form.reset();
      checkGroups.forEach(g=>g.checkboxes.forEach(c=>c.disabled=false));
      clearErrors();
      setStatus("enviado. obrigada!");
      setTimeout(()=>setStatus(""), 5000);
    } catch(err){
      console.error(err);
      setStatus("não foi possível enviar agora. tente novamente.");
    } finally {
      submitBtn.disabled = false;
    }
  });
})();
