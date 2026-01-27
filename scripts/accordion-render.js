/* accordion render
   - lê /data/accordion-config.json
   - permite override por localStorage (painel)
*/
(function () {
  const mount = document.querySelector('[data-ela-accordion]');
  if (!mount) return;

  const safeJsonParse = (s) => {
    try { return JSON.parse(s); } catch (e) { return null; }
  };

  const normalize = (raw) => {
    if (!raw) return [];
    if (Array.isArray(raw)) return raw;
    if (raw.macros && Array.isArray(raw.macros)) return raw.macros;
    if (raw.items && Array.isArray(raw.items)) return raw.items;
    return [];
  };

  const escapeHtml = (s) =>
    String(s || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const tplItem = (item, idx) => {
    const title = escapeHtml(item.title || '');
    const subtitle = escapeHtml(item.subtitle || '');
    const body = escapeHtml(item.body || '');
    const id = `module-${idx}`;
    return `
      <article class="module" data-module>
        <button class="module__head" type="button" aria-expanded="false" aria-controls="${id}">
          <span class="module__title">${title}</span>
          <span class="module__icon" aria-hidden="true">+</span>
        </button>
        <div class="module__body" id="${id}" aria-hidden="true">
          <div class="module__inner">
            ${subtitle ? `<p class="module__lead">${subtitle}</p>` : ''}
            ${body ? `<p class="module__text">${body}</p>` : ''}
          </div>
        </div>
      </article>
    `;
  };

  const render = (items) => {
    mount.innerHTML = items.map(tplItem).join('');
    document.dispatchEvent(new CustomEvent('ela:accordion-ready'));
  };

  // override do painel
  const override = safeJsonParse(localStorage.getItem('ela_accordion_override') || '');
  if (override) {
    render(normalize(override));
    return;
  }

  const url = '/data/accordion-config.json';

  fetch(url, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : Promise.reject(new Error('accordion json not found'))))
    .then((raw) => render(normalize(raw)))
    .catch(() => render([]));
})();
