/* elã config default
   - stack: html, css, js puro
   - credenciais podem ser sobrescritas por localStorage via /painel/
*/
(function () {
  const DEFAULT = {
    site: {
      navClientLabel: 'área do cliente'
    },
    clients: {
      jescri: {
        id: 'jescri',
        label: 'jescri',
        username: 'jescri',
        password: 'bruce@2207',
        redirect: '/clientes/jescri/',
        logoPath: '/clientes/jescri/assets/logo-jescri.svg',
        activationsCsv: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBp1ORyL7U0f1PJNho0_vrsJjoXjSCU1O1-p_BzlAjL6ggO7LktE0se1DtjeITVc1h2RmXWaodhhWU/pub?output=csv',
        calendarJson: '/data/calendario-jescri.json'
      }
    }
  };

  const safeJsonParse = (s) => {
    try { return JSON.parse(s); } catch (e) { return null; }
  };

  const deepMerge = (base, override) => {
    if (!override || typeof override !== 'object') return base;
    const out = Array.isArray(base) ? base.slice() : Object.assign({}, base);
    Object.keys(override).forEach((k) => {
      const bv = base ? base[k] : undefined;
      const ov = override[k];
      if (ov && typeof ov === 'object' && !Array.isArray(ov) && bv && typeof bv === 'object' && !Array.isArray(bv)) {
        out[k] = deepMerge(bv, ov);
      } else {
        out[k] = ov;
      }
    });
    return out;
  };

  window.elaGetConfig = function () {
    const ls = safeJsonParse(localStorage.getItem('ela_config_override') || '');
    const win = (window.elaConfigOverride && typeof window.elaConfigOverride === 'object') ? window.elaConfigOverride : null;
    let cfg = deepMerge(DEFAULT, win);
    cfg = deepMerge(cfg, ls);
    return cfg;
  };
})();
