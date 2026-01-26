/* helper: carrega config padrão e aplica override via localStorage */

(function(){
  function safeJsonParse(str){
    try{ return JSON.parse(str); }catch(e){ return null; }
  }

  function deepMerge(base, extra){
    if(!extra || typeof extra !== 'object') return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base || {});
    Object.keys(extra).forEach((k) => {
      const bv = base ? base[k] : undefined;
      const ev = extra[k];
      if(Array.isArray(ev)){
        out[k] = ev.slice();
        return;
      }
      if(ev && typeof ev === 'object'){
        out[k] = deepMerge(bv && typeof bv === 'object' ? bv : {}, ev);
        return;
      }
      out[k] = ev;
    });
    return out;
  }

  window.elaGetConfig = function(){
    const base = window.ELA_CONFIG_DEFAULT || {};
    let ov = null;
    try{ ov = safeJsonParse(localStorage.getItem('ela_config_override') || ''); }catch(e){ ov = null; }
    if(!ov) return base;
    return deepMerge(base, ov);
  };
})();
