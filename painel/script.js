(function(){
  const ta = document.getElementById('configJson');
  const st = document.getElementById('status');
  const btnLoad = document.getElementById('btnLoad');
  const btnSave = document.getElementById('btnSave');
  const btnClear = document.getElementById('btnClear');
  const btnExport = document.getElementById('btnExport');
  const fileImport = document.getElementById('fileImport');

  function setStatus(msg, ok){
    st.textContent = msg || '';
    st.style.opacity = msg ? '1' : '0';
    st.style.color = ok ? '#fff' : '#ffe8a3';
  }

  function pretty(obj){
    return JSON.stringify(obj, null, 2);
  }

  function safeParse(str){
    try{ return JSON.parse(str); }catch(e){ return null; }
  }

  function getOverride(){
    try{ return safeParse(localStorage.getItem('ela_config_override') || ''); }catch(e){ return null; }
  }

  function setOverride(obj){
    try{
      localStorage.setItem('ela_config_override', JSON.stringify(obj || {}));
      return true;
    }catch(e){
      return false;
    }
  }

  function clearOverride(){
    try{ localStorage.removeItem('ela_config_override'); }catch(e){}
  }

  function loadCurrent(){
    const cfg = window.elaGetConfig ? window.elaGetConfig() : (window.ELA_CONFIG_DEFAULT || {});
    ta.value = pretty(cfg);
    setStatus('config carregada', true);
  }

  btnLoad.addEventListener('click', loadCurrent);

  btnSave.addEventListener('click', () => {
    const obj = safeParse(ta.value || '');
    if(!obj){
      setStatus('json inválido', false);
      return;
    }
    if(setOverride(obj)){
      setStatus('override salva no navegador', true);
      return;
    }
    setStatus('não foi possível salvar no navegador', false);
  });

  btnClear.addEventListener('click', () => {
    clearOverride();
    setStatus('override removida', true);
  });

  btnExport.addEventListener('click', () => {
    const obj = safeParse(ta.value || '') || window.elaGetConfig();
    const blob = new Blob([pretty(obj)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'ela-config.json';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setStatus('json exportado', true);
  });

  fileImport.addEventListener('change', async () => {
    const f = fileImport.files && fileImport.files[0];
    if(!f) return;
    const txt = await f.text();
    const obj = safeParse(txt);
    if(!obj){
      setStatus('json inválido', false);
      return;
    }
    ta.value = pretty(obj);
    setStatus('json importado', true);
  });

  // carrega ao abrir
  loadCurrent();
})();
