(function(){
  const PANEL_PASS = 'Bruce@2207';
  const PANEL_SESSION_KEY = 'ela_painel_editorial_ok_v1';

  const gate = document.getElementById('painelGate');
  const gateForm = document.getElementById('gateForm');
  const gatePass = document.getElementById('gatePass');
  const gateError = document.getElementById('gateError');
  const body = document.getElementById('painelBody');

  function setGateError(msg){
    if(!gateError) return;
    gateError.textContent = msg || '';
  }

  function setAuthed(ok){
    try{ localStorage.setItem(PANEL_SESSION_KEY, ok ? '1' : '0'); }catch(e){}
  }

  function isAuthed(){
    try{ return localStorage.getItem(PANEL_SESSION_KEY) === '1'; }catch(e){ return false; }
  }

  function openPanel(){
    if(gate) gate.style.display = 'none';
    if(body){
      body.style.display = '';
      body.removeAttribute('aria-hidden');
    }
  }

  function closePanel(){
    if(gate) gate.style.display = '';
    if(body){
      body.style.display = 'none';
      body.setAttribute('aria-hidden', 'true');
    }
  }

  // -----------------------------
  // gate
  // -----------------------------
  if(isAuthed()){
    openPanel();
  }else{
    closePanel();
  }

  if(gateForm){
    gateForm.addEventListener('submit', (e) => {
      e.preventDefault();
      setGateError('');

      const value = String(gatePass && gatePass.value || '').trim();
      if(!value){
        setGateError('digite a senha.');
        return;
      }

      if(value === PANEL_PASS){
        setAuthed(true);
        openPanel();
        gatePass.value = '';
        return;
      }

      setAuthed(false);
      setGateError('senha inválida.');
      gatePass.select();
    });
  }

  // -----------------------------
  // tabs
  // -----------------------------
  const tabBtnConfig = document.getElementById('tabBtnConfig');
  const tabBtnAccordion = document.getElementById('tabBtnAccordion');
  const tabConfig = document.getElementById('tab-config');
  const tabAccordion = document.getElementById('tab-accordion');

  function setTab(which){
    const isConfig = which === 'config';
    if(tabBtnConfig){
      tabBtnConfig.classList.toggle('is-on', isConfig);
      tabBtnConfig.setAttribute('aria-selected', isConfig ? 'true' : 'false');
    }
    if(tabBtnAccordion){
      tabBtnAccordion.classList.toggle('is-on', !isConfig);
      tabBtnAccordion.setAttribute('aria-selected', isConfig ? 'false' : 'true');
    }
    if(tabConfig) tabConfig.classList.toggle('is-on', isConfig);
    if(tabAccordion) tabAccordion.classList.toggle('is-on', !isConfig);
  }

  if(tabBtnConfig) tabBtnConfig.addEventListener('click', () => setTab('config'));
  if(tabBtnAccordion) tabBtnAccordion.addEventListener('click', () => setTab('accordion'));

  // -----------------------------
  // editor de config (site)
  // -----------------------------
  const ta = document.getElementById('configJson');
  const st = document.getElementById('status');
  const btnLoad = document.getElementById('btnLoad');
  const btnSave = document.getElementById('btnSave');
  const btnClear = document.getElementById('btnClear');
  const btnExport = document.getElementById('btnExport');
  const fileImport = document.getElementById('fileImport');

  function setStatus(el, msg, ok){
    if(!el) return;
    el.textContent = msg || '';
    el.style.opacity = msg ? '1' : '0';
    el.style.color = ok ? '#fff' : '#ffe8a3';
  }

  function pretty(obj){
    return JSON.stringify(obj, null, 2);
  }

  function safeParse(str){
    try{ return JSON.parse(str); }catch(e){ return null; }
  }

  function setOverride(key, obj){
    try{
      localStorage.setItem(key, JSON.stringify(obj || {}));
      return true;
    }catch(e){
      return false;
    }
  }

  function clearOverride(key){
    try{ localStorage.removeItem(key); }catch(e){}
  }

  function loadCurrent(){
    const cfg = window.elaGetConfig ? window.elaGetConfig() : (window.ELA_CONFIG_DEFAULT || {});
    if(ta) ta.value = pretty(cfg);
    setStatus(st, 'config carregada', true);
  }

  if(btnLoad) btnLoad.addEventListener('click', loadCurrent);

  if(btnSave) btnSave.addEventListener('click', () => {
    const obj = safeParse(ta && ta.value || '');
    if(!obj){
      setStatus(st, 'json inválido', false);
      return;
    }
    if(setOverride('ela_config_override', obj)){
      setStatus(st, 'override salva no navegador', true);
      return;
    }
    setStatus(st, 'não foi possível salvar no navegador', false);
  });

  if(btnClear) btnClear.addEventListener('click', () => {
    clearOverride('ela_config_override');
    setStatus(st, 'override removida', true);
  });

  if(btnExport) btnExport.addEventListener('click', () => {
    const obj = safeParse(ta && ta.value || '') || (window.elaGetConfig ? window.elaGetConfig() : window.ELA_CONFIG_DEFAULT);
    const blob = new Blob([pretty(obj)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ela-config.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(st, 'json exportado', true);
  });

  if(fileImport) fileImport.addEventListener('change', async () => {
    const f = fileImport.files && fileImport.files[0];
    if(!f) return;
    const txt = await f.text();
    const obj = safeParse(txt);
    if(!obj){
      setStatus(st, 'json inválido', false);
      return;
    }
    if(ta) ta.value = pretty(obj);
    setStatus(st, 'json importado', true);
  });

  // -----------------------------
  // editor do acordeão
  // -----------------------------
  const OV_ACC_KEY = 'ela_accordion_override';
  // suporta publicação na raiz do domínio e também em subpasta (ex: /ela-site/)
  const ACC_BASE = (function(){
    const p = window.location.pathname || '/';
    if(p.startsWith('/ela-site/')) return '/ela-site';
    return '';
  })();
  const ACC_SRC = `${ACC_BASE}/data/accordion-config.json`;

  const taAcc = document.getElementById('accordionJson');
  const stAcc = document.getElementById('statusAcc');
  const btnAccLoad = document.getElementById('btnAccLoad');
  const btnAccSave = document.getElementById('btnAccSave');
  const btnAccClear = document.getElementById('btnAccClear');
  const btnAccExport = document.getElementById('btnAccExport');
  const fileAccImport = document.getElementById('fileAccImport');

  const macroList = document.getElementById('macroList');
  const btnMacroAdd = document.getElementById('btnMacroAdd');
  const macroEmpty = document.getElementById('macroEmpty');
  const macroForm = document.getElementById('macroForm');

  const macroId = document.getElementById('macroId');
  const macroStrong = document.getElementById('macroStrong');
  const macroText = document.getElementById('macroText');
  const btnMacroRemove = document.getElementById('btnMacroRemove');

  const itemsList = document.getElementById('itemsList');
  const btnItemAdd = document.getElementById('btnItemAdd');

  let accCfg = { macros: [] };
  let selectedMacroIndex = -1;

  function lower(v){ return String(v || '').toLowerCase(); }

  function sanitizeMacroId(v){
    const raw = lower(v).trim();
    return raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }

  function getAccOverride(){
    try{ return safeParse(localStorage.getItem(OV_ACC_KEY) || ''); }catch(e){ return null; }
  }

  async function loadAccFromFile(){
    const res = await fetch(ACC_SRC, { cache: 'no-store' });
    if(!res.ok) return { macros: [] };
    return await res.json();
  }

  function accPretty(obj){
    return JSON.stringify(obj, null, 2);
  }

  function syncAccTextarea(){
    if(taAcc) taAcc.value = accPretty(accCfg);
  }

  function renderMacroList(){
    if(!macroList) return;

    macroList.innerHTML = '';
    const macros = Array.isArray(accCfg.macros) ? accCfg.macros : [];

    macros.forEach((m, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'accEdit__macroBtn' + (idx === selectedMacroIndex ? ' is-on' : '');
      const label = (m && m.titleStrong ? lower(m.titleStrong) : 'macro') + (m && m.id ? ` (${lower(m.id)})` : '');
      btn.textContent = label;
      btn.addEventListener('click', () => {
        selectedMacroIndex = idx;
        renderMacroList();
        renderMacroForm();
      });
      macroList.appendChild(btn);
    });

    if(!macros.length){
      selectedMacroIndex = -1;
      renderMacroForm();
    }
  }

  function renderItems(){
    if(!itemsList) return;
    itemsList.innerHTML = '';

    const macro = accCfg.macros[selectedMacroIndex];
    const items = (macro && Array.isArray(macro.items)) ? macro.items : [];

    items.forEach((it, idx) => {
      const wrap = document.createElement('div');
      wrap.className = 'accItem';

      const row = document.createElement('div');
      row.className = 'accItem__row';

      const title = document.createElement('p');
      title.style.margin = '0';
      title.style.fontSize = '12px';
      title.style.opacity = '0.95';
      title.textContent = `item ${idx+1}`;

      const rm = document.createElement('button');
      rm.type = 'button';
      rm.className = 'accItem__remove';
      rm.textContent = 'remover';
      rm.addEventListener('click', () => {
        items.splice(idx, 1);
        macro.items = items;
        renderItems();
        syncAccTextarea();
      });

      row.appendChild(title);
      row.appendChild(rm);

      const f1 = document.createElement('label');
      f1.className = 'field';
      f1.innerHTML = `<span class="field__label">título</span><input type="text" value="${(it && it.title) ? String(it.title).replace(/"/g,'&quot;') : ''}">`;
      const inputTitle = f1.querySelector('input');

      const f2 = document.createElement('label');
      f2.className = 'field';
      f2.innerHTML = `<span class="field__label">texto</span><textarea rows="4">${(it && it.text) ? String(it.text) : ''}</textarea>`;
      const textareaText = f2.querySelector('textarea');

      inputTitle.addEventListener('input', () => {
        it.title = lower(inputTitle.value);
        syncAccTextarea();
        renderMacroList();
      });

      textareaText.addEventListener('input', () => {
        it.text = lower(textareaText.value);
        syncAccTextarea();
      });

      wrap.appendChild(row);
      wrap.appendChild(f1);
      wrap.appendChild(f2);
      itemsList.appendChild(wrap);
    });
  }

  function renderMacroForm(){
    const macros = Array.isArray(accCfg.macros) ? accCfg.macros : [];

    if(selectedMacroIndex < 0 || selectedMacroIndex >= macros.length){
      if(macroEmpty) macroEmpty.style.display = '';
      if(macroForm) macroForm.hidden = true;
      return;
    }

    if(macroEmpty) macroEmpty.style.display = 'none';
    if(macroForm) macroForm.hidden = false;

    const macro = macros[selectedMacroIndex] || {};
    if(macroId) macroId.value = lower(macro.id || '');
    if(macroStrong) macroStrong.value = lower(macro.titleStrong || '');
    if(macroText) macroText.value = lower(macro.titleText || '');

    renderItems();
  }

  function bindMacroInputs(){
    if(macroId) macroId.addEventListener('input', () => {
      const macro = accCfg.macros[selectedMacroIndex];
      if(!macro) return;
      macro.id = sanitizeMacroId(macroId.value);
      macroId.value = macro.id;
      syncAccTextarea();
      renderMacroList();
    });

    if(macroStrong) macroStrong.addEventListener('input', () => {
      const macro = accCfg.macros[selectedMacroIndex];
      if(!macro) return;
      macro.titleStrong = lower(macroStrong.value);
      syncAccTextarea();
      renderMacroList();
    });

    if(macroText) macroText.addEventListener('input', () => {
      const macro = accCfg.macros[selectedMacroIndex];
      if(!macro) return;
      macro.titleText = lower(macroText.value);
      syncAccTextarea();
    });

    if(btnMacroRemove) btnMacroRemove.addEventListener('click', () => {
      if(selectedMacroIndex < 0) return;
      accCfg.macros.splice(selectedMacroIndex, 1);
      selectedMacroIndex = Math.min(selectedMacroIndex, accCfg.macros.length - 1);
      renderMacroList();
      renderMacroForm();
      syncAccTextarea();
    });

    if(btnMacroAdd) btnMacroAdd.addEventListener('click', () => {
      const next = {
        id: `macro-${accCfg.macros.length+1}`,
        titleStrong: 'nova macro',
        titleText: 'edite o título aqui',
        items: [
          { title: 'novo item', text: 'edite o texto aqui' }
        ]
      };
      accCfg.macros.push(next);
      selectedMacroIndex = accCfg.macros.length - 1;
      renderMacroList();
      renderMacroForm();
      syncAccTextarea();
    });

    if(btnItemAdd) btnItemAdd.addEventListener('click', () => {
      const macro = accCfg.macros[selectedMacroIndex];
      if(!macro) return;
      if(!Array.isArray(macro.items)) macro.items = [];
      macro.items.push({ title: 'novo item', text: 'edite o texto aqui' });
      renderItems();
      syncAccTextarea();
    });

    if(taAcc) taAcc.addEventListener('input', () => {
      const obj = safeParse(taAcc.value || '');
      if(!obj || !Array.isArray(obj.macros)){
        setStatus(stAcc, 'json inválido', false);
        return;
      }
      accCfg = obj;
      selectedMacroIndex = Math.min(selectedMacroIndex, (accCfg.macros.length || 1) - 1);
      setStatus(stAcc, 'json atualizado', true);
      renderMacroList();
      renderMacroForm();
    });
  }

  bindMacroInputs();

  async function loadAccCurrent(){
    const ov = getAccOverride();
    if(ov && Array.isArray(ov.macros)){
      accCfg = ov;
    }else{
      accCfg = await loadAccFromFile();
    }

    if(!Array.isArray(accCfg.macros)) accCfg.macros = [];
    selectedMacroIndex = accCfg.macros.length ? 0 : -1;

    syncAccTextarea();
    renderMacroList();
    renderMacroForm();
    setStatus(stAcc, 'acordeão carregado', true);
  }

  if(btnAccLoad) btnAccLoad.addEventListener('click', loadAccCurrent);

  if(btnAccSave) btnAccSave.addEventListener('click', () => {
    const obj = safeParse(taAcc && taAcc.value || '');
    if(!obj || !Array.isArray(obj.macros)){
      setStatus(stAcc, 'json inválido', false);
      return;
    }
    if(setOverride(OV_ACC_KEY, obj)){
      accCfg = obj;
      setStatus(stAcc, 'override salva no navegador', true);
      renderMacroList();
      renderMacroForm();
      return;
    }
    setStatus(stAcc, 'não foi possível salvar no navegador', false);
  });

  if(btnAccClear) btnAccClear.addEventListener('click', () => {
    clearOverride(OV_ACC_KEY);
    setStatus(stAcc, 'override removida', true);
  });

  if(btnAccExport) btnAccExport.addEventListener('click', () => {
    const obj = safeParse(taAcc && taAcc.value || '') || accCfg;
    const blob = new Blob([accPretty(obj)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ela-accordion.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus(stAcc, 'json exportado', true);
  });

  if(fileAccImport) fileAccImport.addEventListener('change', async () => {
    const f = fileAccImport.files && fileAccImport.files[0];
    if(!f) return;
    const txt = await f.text();
    const obj = safeParse(txt);
    if(!obj || !Array.isArray(obj.macros)){
      setStatus(stAcc, 'json inválido', false);
      return;
    }
    accCfg = obj;
    selectedMacroIndex = accCfg.macros.length ? 0 : -1;
    syncAccTextarea();
    renderMacroList();
    renderMacroForm();
    setStatus(stAcc, 'json importado', true);
  });

  // init
  loadCurrent();
  loadAccCurrent();
  setTab('config');
})();
