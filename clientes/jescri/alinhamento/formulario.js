/*
  formulário semestral (custom)
  - html + css da página
  - envio via google forms (post)
  - validação clara, scroll até a primeira pendência
*/

(() => {
  const form = document.getElementById('customForm');
  if (!form) return;

  const statusEl = document.getElementById('status');
  const btn = form.querySelector('button[type="submit"]');
  const success = document.getElementById('success');

  const ENDPOINT = form.dataset.endpoint || '';

  const qs = (sel, root = document) => root.querySelector(sel);
  const qsa = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setStatus(msg){
    if (!statusEl) return;
    statusEl.textContent = msg;
  }

  function clearErrors(){
    qsa('.field.error').forEach(el => el.classList.remove('error'));
    qsa('[data-err-for]').forEach(el => { el.textContent = ''; });
  }

  function markError(blockId, message){
    const field = document.getElementById(blockId);
    if (field) field.classList.add('error');
    const err = qs(`[data-err-for="${blockId}"]`);
    if (err) err.textContent = message;
  }

  function scrollToFirstError(){
    const first = qs('.field.error');
    if (!first) return;
    first.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function enforceMaxChecks(group){
    const max = Number(group.dataset.max || 0);
    if (!max) return;
    const checks = qsa('input[type="checkbox"]', group);
    const update = () => {
      const checked = checks.filter(c => c.checked);
      const lock = checked.length >= max;
      checks.forEach(c => { if (!c.checked) c.disabled = lock; });
    };
    checks.forEach(c => c.addEventListener('change', update));
    update();
  }

  qsa('[data-max]').forEach(enforceMaxChecks);

  function collectFormData(){
    const fd = new FormData();

    // radios
    qsa('fieldset[data-entry]').forEach(fs => {
      const key = fs.dataset.entry;
      const checked = qs('input[type="radio"]:checked', fs);
      if (checked) fd.append(key, checked.value);
    });

    // checkboxes (com limite + outro)
    qsa('[data-group][data-entry]').forEach(group => {
      const key = group.dataset.entry;
      const max = Number(group.dataset.max || 0);
      const selected = qsa('input[type="checkbox"]:checked', group).map(i => i.value);

      if (max && selected.length > max) {
        // corta por segurança, a ui já bloqueia, mas garantimos
        selected.length = max;
      }

      selected.forEach(v => fd.append(key, v));

      if (group.dataset.other === 'true') {
        const otherKey = group.dataset.otherName || '';
        const otherInput = qs('input[data-other-input]', group);
        const otherText = otherInput ? String(otherInput.value || '').trim() : '';
        if (otherText) {
          fd.append(key, 'outro');
          if (otherKey) fd.append(otherKey, otherText);
        }
      }
    });

    // texto livre
    qsa('[data-text-entry]').forEach(wrap => {
      const key = wrap.dataset.textEntry;
      const ta = qs('textarea', wrap);
      const val = ta ? String(ta.value || '').trim() : '';
      if (val) fd.append(key, val);
    });

    // inputs de texto simples
    qsa('input[type="text"][name^="entry."]', form).forEach(inp => {
      const key = inp.name;
      const val = String(inp.value || '').trim();
      if (val) fd.append(key, val);
    });

    return fd;
  }

  function validate(){
    clearErrors();
    setStatus('');

    let ok = true;
    let firstErrorId = '';

    // required radios
    qsa('fieldset[data-required="true"]').forEach(fs => {
      const has = !!qs('input[type="radio"]:checked', fs);
      if (!has) {
        ok = false;
        const id = fs.id;
        if (!firstErrorId) firstErrorId = id;
        markError(id, 'resposta obrigatória');
      }
    });

    // checkbox groups
    qsa('[data-group][data-required="true"]').forEach(group => {
      const id = group.id;
      const max = Number(group.dataset.max || 0);
      const selected = qsa('input[type="checkbox"]:checked', group);

      if (!selected.length) {
        ok = false;
        if (!firstErrorId) firstErrorId = id;
        markError(id, 'selecione pelo menos uma opção');
        return;
      }

      if (max && selected.length > max) {
        ok = false;
        if (!firstErrorId) firstErrorId = id;
        markError(id, 'selecione no máximo 3 opções');
      }
    });

    if (!ok) {
      setStatus('revise os campos marcados');
      scrollToFirstError();
    }

    return ok;
  }

  function setLoading(isLoading){
    if (!btn) return;
    btn.disabled = isLoading;
    btn.dataset.loading = isLoading ? '1' : '';
    btn.textContent = isLoading ? 'enviando…' : 'enviar';
  }

  async function submitToForms(fd){
    if (!ENDPOINT) throw new Error('endpoint ausente');

    const res = await fetch(ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      body: fd
    });

    // em no-cors, o fetch resolve sem acesso ao status, então só seguimos
    return res;
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (!validate()) return;

    try {
      setLoading(true);
      setStatus('enviando…');

      const fd = collectFormData();
      await submitToForms(fd);

      setStatus('');
      form.hidden = true;
      if (success) success.hidden = false;
    } catch (err) {
      setStatus('não foi possível enviar agora. tente novamente.');
    } finally {
      setLoading(false);
    }
  });
})();
