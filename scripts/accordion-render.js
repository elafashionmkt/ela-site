/* render do acordeão do site principal a partir de um arquivo de configuração
   - também inicializa o comportamento (toggle) depois do html ser injetado
*/

(function () {
  const mount = document.querySelector('[data-ela-accordion]');
  if (!mount) return;

  const OV_KEY = 'ela_accordion_override';

  // suporta publicação na raiz do domínio e também em subpasta (ex: /ela-site/)
  const basePath = (function () {
    const p = window.location.pathname || '/';
    if (p.startsWith('/ela-site/')) return '/ela-site';
    return '';
  })();

  const SRC = `${basePath}/data/accordion-config.json`;

  function safeJsonParse(str) {
    try { return JSON.parse(str); } catch (e) { return null; }
  }

  function esc(value) {
    const s = String(value || '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normId(id) {
    const raw = String(id || '').toLowerCase().trim();
    return raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'macro';
  }

  function buildMacro(macro, idx) {
    const macroId = normId(macro.id || idx + 1);
    const bodyId = `module-${macroId}`;
    const triggerId = `module-${macroId}-trigger`;

    const titleStrong = esc((macro.titleStrong || '').toLowerCase());
    const titleText = esc((macro.titleText || '').toLowerCase());

    const items = Array.isArray(macro.items) ? macro.items : [];
    const itemsHtml = items.map((it) => {
      const t = esc((it.title || '').toLowerCase());
      const p = esc((it.text || '').toLowerCase());
      return `
        <div class="module__item">
          <h3>${t}</h3>
          <p>${p}</p>
        </div>
      `.trim();
    }).join('');

    return `
      <article class="module reveal" data-module>
        <button class="module__head" type="button" aria-expanded="false" aria-controls="${bodyId}" id="${triggerId}">
          <span class="module__title"><strong>${titleStrong}</strong> <span aria-hidden="true">•</span> ${titleText}</span>
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

  async function loadConfig() {
    let override = null;
    try { override = safeJsonParse(localStorage.getItem(OV_KEY) || ''); } catch (e) { override = null; }

    if (override && override.macros) return override;

    const res = await fetch(SRC, { cache: 'no-store' });
    if (!res.ok) return { macros: [] };
    return await res.json();
  }

  function initAccordionBehavior() {
    const modules = Array.from(mount.querySelectorAll('[data-module]'));
    if (!modules.length) return;

    const setOpen = (moduleEl, open) => {
      const btn = moduleEl.querySelector('.module__head');
      const body = moduleEl.querySelector('.module__body');
      if (!btn || !body) return;

      moduleEl.classList.toggle('is-open', open);
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      body.setAttribute('aria-hidden', open ? 'false' : 'true');

      if (open) body.style.height = body.scrollHeight + 'px';
      else body.style.height = '0px';
    };

    const closeAllExcept = (keepEl) => {
      modules.forEach((m) => {
        if (m !== keepEl) setOpen(m, false);
      });
    };

    // init fechado
    modules.forEach((m) => setOpen(m, false));

    // bind
    modules.forEach((m) => {
      const btn = m.querySelector('.module__head');
      const body = m.querySelector('.module__body');
      if (!btn || !body) return;

      btn.addEventListener('click', () => {
        const isOpen = m.classList.contains('is-open');
        closeAllExcept(m);
        setOpen(m, !isOpen);
      });

      window.addEventListener('resize', () => {
        if (m.classList.contains('is-open')) {
          body.style.height = body.scrollHeight + 'px';
        }
      });
    });
  }

  loadConfig()
    .then((cfg) => {
      const macros = Array.isArray(cfg.macros) ? cfg.macros : [];
      mount.innerHTML = macros.map(buildMacro).join('');
      initAccordionBehavior();
    })
    .catch(() => {
      mount.innerHTML = '';
    });
})();
