/* painel
   - acordeão: salva em localStorage (ela_accordion_override)
   - config: salva em localStorage (ela_config_override)
*/
(function () {
  const $ = (sel) => document.querySelector(sel);
  const $$ = (sel) => Array.from(document.querySelectorAll(sel));

  const tabs = $$('[data-tab]');
  const panes = $$('[data-pane]');

  const setTab = (name) => {
    tabs.forEach((b) => b.classList.toggle('is-active', b.getAttribute('data-tab') === name));
    panes.forEach((p) => (p.style.display = p.getAttribute('data-pane') === name ? '' : 'none'));
  };

  tabs.forEach((b) => b.addEventListener('click', () => setTab(b.getAttribute('data-tab'))));

  const safeJsonParse = (s) => {
    try { return JSON.parse(s); } catch (e) { return null; }
  };

  const sanitizeText = (s) => {
    return String(s || '')
      .replace(/—/g, '')
      .replace(/\u2013/g, '-')
      .toLowerCase();
  };

  const sanitizeAccordion = (arr) => {
    if (!Array.isArray(arr)) return [];
    return arr.map((it) => ({
      title: sanitizeText(it.title),
      subtitle: sanitizeText(it.subtitle),
      body: sanitizeText(it.body)
    }));
  };

  const download = (filename, text) => {
    const blob = new Blob([text], { type: 'application/json;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    URL.revokeObjectURL(a.href);
    a.remove();
  };

  // -----------------------------
  // acordeão
  // -----------------------------
  const accordionArea = $('#ela-accordion-json');
  const accordionMsg = $('#ela-accordion-msg');
  const accSave = $('#ela-accordion-save');
  const accExport = $('#ela-accordion-export');
  const accReset = $('#ela-accordion-reset');

  const loadDefaultAccordion = () =>
    fetch('/data/accordion-config.json', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : []))
      .then((raw) => (Array.isArray(raw) ? raw : (raw.items || raw.macros || [])));

  const loadAccordionTextarea = () => {
    const saved = safeJsonParse(localStorage.getItem('ela_accordion_override') || '');
    if (saved) {
      accordionArea.value = JSON.stringify(saved, null, 2);
      return;
    }
    loadDefaultAccordion().then((arr) => {
      accordionArea.value = JSON.stringify(arr, null, 2);
    });
  };

  if (accordionArea) loadAccordionTextarea();

  if (accSave) {
    accSave.addEventListener('click', () => {
      const parsed = safeJsonParse(accordionArea.value);
      if (!parsed || !Array.isArray(parsed)) {
        accordionMsg.textContent = 'json inválido (precisa ser um array)';
        return;
      }
      const cleaned = sanitizeAccordion(parsed);
      localStorage.setItem('ela_accordion_override', JSON.stringify(cleaned));
      accordionArea.value = JSON.stringify(cleaned, null, 2);
      accordionMsg.textContent = 'salvo. recarregue a home para ver';
    });
  }

  if (accExport) {
    accExport.addEventListener('click', () => {
      const parsed = safeJsonParse(accordionArea.value) || [];
      download('accordion-config.json', JSON.stringify(parsed, null, 2));
    });
  }

  if (accReset) {
    accReset.addEventListener('click', () => {
      localStorage.removeItem('ela_accordion_override');
      accordionMsg.textContent = 'resetado';
      loadAccordionTextarea();
    });
  }

  // -----------------------------
  // config
  // -----------------------------
  const configArea = $('#ela-config-json');
  const configMsg = $('#ela-config-msg');
  const cfgSave = $('#ela-config-save');
  const cfgExport = $('#ela-config-export');
  const cfgReset = $('#ela-config-reset');

  const loadConfigTextarea = () => {
    const saved = safeJsonParse(localStorage.getItem('ela_config_override') || '');
    if (saved) {
      configArea.value = JSON.stringify(saved, null, 2);
      return;
    }
    const current = (window.elaGetConfig ? window.elaGetConfig() : {});
    // sugere apenas o bloco editável, para não duplicar tudo
    const suggest = {
      clients: current.clients || {}
    };
    configArea.value = JSON.stringify(suggest, null, 2);
  };

  if (configArea) loadConfigTextarea();

  if (cfgSave) {
    cfgSave.addEventListener('click', () => {
      const parsed = safeJsonParse(configArea.value);
      if (!parsed || typeof parsed !== 'object') {
        configMsg.textContent = 'json inválido';
        return;
      }
      localStorage.setItem('ela_config_override', JSON.stringify(parsed));
      configMsg.textContent = 'salvo. volte para /clientes/ para testar o login';
    });
  }

  if (cfgExport) {
    cfgExport.addEventListener('click', () => {
      const parsed = safeJsonParse(configArea.value) || {};
      download('config-override.json', JSON.stringify(parsed, null, 2));
    });
  }

  if (cfgReset) {
    cfgReset.addEventListener('click', () => {
      localStorage.removeItem('ela_config_override');
      configMsg.textContent = 'resetado';
      loadConfigTextarea();
    });
  }
})();
