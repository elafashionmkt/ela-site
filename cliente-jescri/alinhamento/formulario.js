/* formulário semestral jescri
 * envio via google forms (formResponse)
 * tudo em caixa baixa por padrão do projeto
 */
(() => {
  const __FORM_ENDPOINT__ = "https://docs.google.com/forms/d/e/1FAIpQLSeM22fzoLKsWeDQEkj8Mptf4FwOaBbghl9XIDH5WuEGWB2Beg/formResponse";

  const form = document.getElementById("customForm");
  const statusEl = document.getElementById("formStatus");
  if(!form) return;

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

  function setStatus(msg, kind="info"){
    if(!statusEl) return;
    statusEl.textContent = msg;
    statusEl.dataset.kind = kind;
  }

  function clearErrors(){
    $$(".field.error", form).forEach(f => f.classList.remove("error"));
    $$(".field__error", form).forEach(n => n.remove());
  }

  function markError(field, msg){
    field.classList.add("error");
    const div = document.createElement("div");
    div.className = "field__error";
    div.textContent = msg;
    field.appendChild(div);
  }

  function validate(){
    clearErrors();
    const fields = $$(".field", form);
    let firstBad = null;

    fields.forEach(field => {
      // radio groups dentro do field
      const radios = $$('input[type="radio"]', field);
      if(radios.length){
        const names = Array.from(new Set(radios.map(r => r.name).filter(Boolean)));
        names.forEach(n => {
          const any = radios.some(r => r.name === n && r.checked);
          if(!any){
            if(!firstBad) firstBad = field;
            markError(field, "responda esta pergunta para enviar.");
          }
        });
      }

      // checkbox groups (div.checks) dentro do field
      const checks = $$(".checks", field);
      checks.forEach(g => {
        const checked = $$('input[type="checkbox"]:checked', g);
        if(!checked.length){
          if(!firstBad) firstBad = field;
          markError(field, "selecione pelo menos uma opção.");
        }
      });
    });

    if(firstBad){
      firstBad.scrollIntoView({ behavior: "smooth", block: "center" });
      return false;
    }
    return true;
  }

  function appendRadios(fd){
    const checkedRadios = $$('input[type="radio"]:checked', form);
    checkedRadios.forEach(r => fd.append(r.name, r.value));
  }

  function appendChecks(fd){
    const groups = $$(".checks", form);
    groups.forEach(g => {
      const entry = g.dataset.entry;
      if(!entry) return;

      const checked = $$('input[type="checkbox"]:checked', g);
      checked.forEach(c => fd.append(entry, c.value));

      const otherKey = g.dataset.other;
      const otherInput = otherKey ? $(`input[name="${otherKey}"]`, g) : null;
      const otherVal = otherInput ? otherInput.value.trim() : "";
      if(otherKey && otherVal){
        // google forms costuma esperar o valor "outro" no entry e o texto em other_option_response
        fd.append(entry, "Outro");
        fd.append(otherKey, otherVal);
      }
    });
  }

  async function submit(){
    const fd = new FormData();

    // parâmetros "fantasmas" do google forms (aumenta compatibilidade)
    fd.append("fvv", "1");
    fd.append("fbzx", String(Date.now()));
    fd.append("pageHistory", "0");

    appendRadios(fd);
    appendChecks(fd);

    await fetch(__FORM_ENDPOINT__, {
      method: "POST",
      mode: "no-cors",
      body: fd
    });
  }

  form.addEventListener("submit", async (ev) => {
    ev.preventDefault();
    setStatus("", "info");

    if(!validate()){
      setStatus("revise os campos marcados acima.", "error");
      return;
    }

    const btn = $('button[type="submit"]', form);
    if(btn){
      btn.disabled = true;
      btn.dataset.loading = "true";
    }

    try{
      await submit();
      form.reset();
      setStatus("enviado. obrigada!", "ok");
    }catch(e){
      console.error(e);
      setStatus("não consegui enviar agora. tente novamente em instantes.", "error");
    }finally{
      if(btn){
        btn.disabled = false;
        btn.dataset.loading = "false";
      }
    }
  });
})();