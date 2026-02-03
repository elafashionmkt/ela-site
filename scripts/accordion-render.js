/* render do acordeão do site principal a partir de um arquivo de configuração */

(function(){
  const mount = document.querySelector('[data-ela-accordion]');
  if(!mount) return;

  const OV_KEY = 'ela_accordion_override';
  // usa caminho relativo para funcionar em root e também quando o site estiver em subpasta
  const SRC = 'data/accordion-config.json';

  function safeJsonParse(str){
    try{ return JSON.parse(str); }catch(e){ return null; }
  }

  function esc(value){
    const s = String(value || '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normId(id){
    const raw = String(id || '').toLowerCase().trim();
    return raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'macro';
  }

  function buildMacro(macro, idx){
    const macroId = normId(macro.id || idx+1);
    const bodyId = `module-${macroId}`;
    const triggerId = `module-${macroId}-trigger`;

    const titleStrong = esc((macro.titleStrong || '').toLowerCase());
    const titleText = esc((macro.titleText || '').toLowerCase());

    const paragraphs = Array.isArray(macro.paragraphs) ? macro.paragraphs : [];
    const itemsHtml = paragraphs.map((p) => {
      const text = esc((p || '').toLowerCase());
      return `
        <div class="module__item">
          <p>${text}</p>
        </div>
      `.trim();
    }).join('');

    return `
      <article class="module reveal" data-module>
        <button class="module__head" type="button" aria-expanded="false" aria-controls="${bodyId}" id="${triggerId}">
          <span class="module__title"><strong>${titleStrong}</strong> ${titleText}</span>
          <span class="module__chev" aria-hidden="true"></span>
        </button>

        <div class="module__body" role="region" id="${bodyId}" aria-labelledby="${triggerId}" aria-hidden="true">
          <div class="module__inner">
            ${itemsHtml}
          </div>
        </div>
      </article>
    `.trim();
  }

  async function loadConfig(){
    let override = null;
    try{ override = safeJsonParse(localStorage.getItem(OV_KEY) || ''); }catch(e){ override = null; }

    if(override && override.macros){
      return override;
    }

    // tenta primeiro o caminho relativo; se falhar (ambiente legado), tenta o absoluto
    const tryFetch = async (url) => {
      const res = await fetch(url, { cache: 'no-store' });
      if(!res.ok) return null;
      return await res.json();
    };

    const dataRel = await tryFetch(SRC);
    if(dataRel && dataRel.macros) return dataRel;

    const dataAbs = await tryFetch('/' + SRC);
    if(dataAbs && dataAbs.macros) return dataAbs;

    return { macros: [] };
  }

  loadConfig()
    .then((cfg) => {
      const macros = Array.isArray(cfg.macros) ? cfg.macros : [];
      mount.innerHTML = macros.map(buildMacro).join('');
      window.dispatchEvent(new CustomEvent('ela:accordion-rendered', { detail: { count: macros.length } }));
    })
    .catch(() => {
      mount.innerHTML = '';
    });
})();
