/* clientes app
   - login simples por config
   - tooltip padrão (hover)
   - helpers para calendário
*/
(function () {
  const cfg = window.elaGetConfig ? window.elaGetConfig() : { clients: [] };

  const $ = (sel, root) => (root || document).querySelector(sel);
  const $$ = (sel, root) => Array.from((root || document).querySelectorAll(sel));

  // -----------------------------
  // tooltip (hover)
  // -----------------------------
  const tip = document.createElement('div');
  tip.className = 'tooltip';
  tip.style.display = 'none';
  document.body.appendChild(tip);

  const showTip = (text, x, y) => {
    if (!text) return;
    tip.textContent = text;
    tip.style.display = 'block';
    const pad = 14;
    const w = tip.offsetWidth || 320;
    const h = tip.offsetHeight || 80;
    let left = x + 12;
    let top = y + 12;
    if (left + w + pad > window.innerWidth) left = x - w - 12;
    if (top + h + pad > window.innerHeight) top = y - h - 12;
    tip.style.left = left + 'px';
    tip.style.top = top + 'px';
  };
  const hideTip = () => {
    tip.style.display = 'none';
  };

  document.addEventListener('mousemove', (e) => {
    const el = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null;
    if (!el) return;
    const t = el.getAttribute('data-tooltip') || '';
    if (tip.style.display === 'none') showTip(t, e.clientX, e.clientY);
    else showTip(t, e.clientX, e.clientY);
  });

  document.addEventListener('mouseleave', hideTip, true);
  document.addEventListener('mouseover', (e) => {
    const el = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null;
    if (!el) return;
    const t = el.getAttribute('data-tooltip') || '';
    showTip(t, e.clientX, e.clientY);
  });
  document.addEventListener('mouseout', (e) => {
    const leaving = e.target && e.target.closest ? e.target.closest('[data-tooltip]') : null;
    const entering = e.relatedTarget && e.relatedTarget.closest ? e.relatedTarget.closest('[data-tooltip]') : null;
    if (leaving && !entering) hideTip();
  });

  // -----------------------------
// login (pixso: jescri fixo)
// -----------------------------
const SESSION_KEY = 'ela_auth_session_v1';
const loginForm = $('#ela-login-form');
if (loginForm) {
  const userInput = $('#ela-user');
  const passInput = $('#ela-pass');
  const msg = $('#ela-login-msg');

  function normalizeUserInput(u) {
    return String(u || '').trim().toLowerCase().replace(/^@+/, '');
  }

  function findJescriClient(raw) {
    const arr = Array.isArray(raw) ? raw : (raw && typeof raw === 'object' ? Object.keys(raw).map((k) => raw[k]) : []);
    let found = arr.find((c) => c && typeof c === 'object' && String(c.id || '').trim().toLowerCase() === 'jescri');
    if (found) return found;
    found = arr.find((c) => c && typeof c === 'object' && String(c.label || '').trim().toLowerCase().includes('jescri'));
    if (found) return found;
    return arr[0] || null;
  }

  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const u = normalizeUserInput(userInput ? userInput.value : '');
    const p = String(passInput ? passInput.value : '').trim();

    const c = findJescriClient(cfg && cfg.clients ? cfg.clients : []);
    if (!c) {
      if (msg) msg.textContent = 'configuração incompleta';
      return;
    }

    const expectedUser = normalizeUserInput(c.username || c.instagram || c.user || '');
    const expectedPass = String(c.password || '').trim();

    if (!expectedUser || !expectedPass) {
      if (msg) msg.textContent = 'configuração incompleta';
      return;
    }

    if (u !== expectedUser || p !== expectedPass) {
      if (msg) msg.textContent = 'acesso inválido';
      return;
    }

    const session = {
      clientId: 'jescri',
      createdAt: Date.now(),
      expiresAt: Date.now() + (24 * 60 * 60 * 1000)
    };

    try { localStorage.setItem(SESSION_KEY, JSON.stringify(session)); } catch (_e) {}

    const params = new URLSearchParams(window.location.search || '');
    const next = params.get('next');
    const fallback = String(c.redirect || '/clientes/jescri/') || '/clientes/jescri/';
    const target = next ? decodeURIComponent(next) : fallback;

    window.location.href = target;
  });
}

  // -----------------------------
  // csv helper
  // -----------------------------
  const parseCSV = (text) => {
    // parser simples (aspas básicas)
    const rows = [];
    let cur = '';
    let inQuotes = false;
    const pushCell = (row, cell) => row.push(cell.replace(/\r/g, ''));
    let row = [];
    for (let i = 0; i < text.length; i++) {
      const ch = text[i];
      if (ch === '"') {
        const next = text[i + 1];
        if (inQuotes && next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = !inQuotes;
        }
      } else if (ch === ',' && !inQuotes) {
        pushCell(row, cur);
        cur = '';
      } else if (ch === '\n' && !inQuotes) {
        pushCell(row, cur);
        rows.push(row);
        row = [];
        cur = '';
      } else {
        cur += ch;
      }
    }
    pushCell(row, cur);
    rows.push(row);
    return rows.filter((r) => r.some((c) => String(c || '').trim() !== ''));
  };

  const rowsToObjects = (rows) => {
    const header = (rows[0] || []).map((h) => String(h || '').trim());
    return rows.slice(1).map((r) => {
      const o = {};
      header.forEach((h, idx) => (o[h] = r[idx] !== undefined ? r[idx] : ''));
      return o;
    });
  };

  const toDateKey = (d) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const parseBrDateTime = (raw) => {
    // aceita: 2026-02-01 19:30, 01/02/2026 19:30, 01/02/2026
    const s = String(raw || '').trim();
    if (!s) return null;

    // yyyy-mm-dd
    const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2}))?/);
    if (iso) {
      const y = Number(iso[1]);
      const mo = Number(iso[2]) - 1;
      const da = Number(iso[3]);
      const hh = iso[4] ? Number(iso[4]) : 0;
      const mm = iso[5] ? Number(iso[5]) : 0;
      return new Date(y, mo, da, hh, mm, 0, 0);
    }

    // dd/mm/yyyy
    const br = s.match(/^(\d{2})\/(\d{2})\/(\d{4})(?:[ T](\d{2}):(\d{2}))?/);
    if (br) {
      const da = Number(br[1]);
      const mo = Number(br[2]) - 1;
      const y = Number(br[3]);
      const hh = br[4] ? Number(br[4]) : 0;
      const mm = br[5] ? Number(br[5]) : 0;
      return new Date(y, mo, da, hh, mm, 0, 0);
    }

    return null;
  };

  const formatTime = (d) => String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');

  // -----------------------------
  // calendário mensal (eventos json)
  // -----------------------------
  const renderMonth = (mount, year, monthIndex, eventsByDate, label) => {
    if (!mount) return;
    mount.innerHTML = '';

    const first = new Date(year, monthIndex, 1);
    const startDow = (first.getDay() + 6) % 7; // segunda=0
    const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();

    const grid = document.createElement('div');
    grid.className = 'calendar-grid';

    const dayNames = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];
    dayNames.forEach((n) => {
      const h = document.createElement('div');
      h.className = 'cal-day glass';
      h.style.minHeight = 'auto';
      h.style.padding = '10px 12px';
      h.innerHTML = `<strong style="font-size:12px;">${n}</strong>`;
      grid.appendChild(h);
    });

    for (let i = 0; i < startDow; i++) {
      const empty = document.createElement('div');
      empty.className = 'cal-day';
      empty.style.opacity = '0';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const d = new Date(year, monthIndex, day);
      const key = toDateKey(d);
      const dayBox = document.createElement('div');
      dayBox.className = 'cal-day glass';

      const num = document.createElement('div');
      num.className = 'cal-day__num';
      num.textContent = String(day);
      dayBox.appendChild(num);

      const list = document.createElement('div');
      list.className = 'cal-events';

      const items = (eventsByDate[key] || []).slice(0, 6);
      items.forEach((ev) => {
        const chip = document.createElement('div');
        chip.className = 'cal-item';
        const dot = document.createElement('span');
        dot.className = 'cal-dot';
        dot.style.background = ev.color || '#cd0005';

        const title = document.createElement('span');
        title.textContent = String(ev.title || '').toLowerCase();

        chip.appendChild(dot);
        chip.appendChild(title);

        if (ev.tooltip) chip.setAttribute('data-tooltip', String(ev.tooltip).toLowerCase());

        list.appendChild(chip);
      });

      dayBox.appendChild(list);
      grid.appendChild(dayBox);
    }

    mount.appendChild(grid);

    if (label) {
      const t = document.querySelector('[data-month-label]');
      if (t) t.textContent = String(label).toLowerCase();
    }
  };

  // expõe para páginas
  window.elaClients = {
    cfg,
    parseCSV,
    rowsToObjects,
    parseBrDateTime,
    toDateKey,
    formatTime,
    renderMonth
  };
})();
