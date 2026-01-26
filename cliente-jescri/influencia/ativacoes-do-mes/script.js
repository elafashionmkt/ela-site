/* ativações do mês (js puro)
   - fonte: csv publicado (aba datas) + fallback local
   - mapeamento: col a (influenciadora) | col e (data + hora) | col f (tipo)
   - exibição no calendário: a + f
   - tooltip: hora (da coluna e)
   - mês: usa mês atual se tiver eventos; se não tiver, usa o próximo mês futuro com eventos
   - sem mês escrito na interface
*/

(function () {
  'use strict';

  const root = document.querySelector('[data-ativacoes-root]');
  if (!root) return;

  const loadingEl = root.querySelector('[data-loading]');
  const emptyEl = root.querySelector('[data-empty]');
  const gridHost = root.querySelector('[data-grid]');

  const CSV_URL =
    'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBp1ORyL7U0f1PJNho0_vrsJjoXjSCU1O1-p_BzlAjL6ggO7LktE0se1DtjeITVc1h2RmXWaodhhWU/pub?gid=1397300240&single=true&output=csv';
  const FALLBACK_JSON =
    '/cliente-jescri/influencia/ativacoes-do-mes/ativacoes-fallback.json';

  const DOW = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

  function pad2(n) {
    return String(n).padStart(2, '0');
  }

  function stripAccents(s) {
    try {
      return (s || '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
    } catch (e) {
      return s || '';
    }
  }

  function normalizeText(v) {
    return String(v || '')
      .replace(/[—–]/g, '-') /* evita travessão invisível */
      .trim()
      .toLowerCase();
  }

  function csvParseLine(line) {
    const out = [];
    let cur = '';
    let inQ = false;

    for (let i = 0; i < line.length; i++) {
      const ch = line[i];

      if (ch === '"') {
        if (inQ && line[i + 1] === '"') {
          cur += '"';
          i++;
        } else {
          inQ = !inQ;
        }
        continue;
      }

      if (ch === ',' && !inQ) {
        out.push(cur);
        cur = '';
        continue;
      }

      cur += ch;
    }

    out.push(cur);
    return out.map((v) => (v || '').trim());
  }

  function csvToMatrix(text) {
    const clean = String(text || '').replace(/^\uFEFF/, '');
    const lines = clean.split(/\r?\n/).filter((l) => l.trim().length);
    return lines.map(csvParseLine);
  }

  function parsePtDateTime(raw) {
    const s = String(raw || '').trim();
    if (!s) return null;

    // dd/mm/aaaa hh:mm ou dd/mm/aaaa
    const m = s.match(
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/
    );
    if (m) {
      const dd = parseInt(m[1], 10);
      const mm = parseInt(m[2], 10);
      const yyyy = parseInt(m[3], 10);
      const hh = m[4] != null ? parseInt(m[4], 10) : null;
      const mi = m[5] != null ? parseInt(m[5], 10) : null;

      const d = new Date(yyyy, mm - 1, dd, hh || 0, mi || 0, 0);
      d.__hasTime = hh != null && mi != null;
      return d;
    }

    const d = new Date(s);
    if (isNaN(d.getTime())) return null;
    d.__hasTime = true;
    return d;
  }

  function mondayFirstIndex(d) {
    return (d.getDay() + 6) % 7;
  }

  function setLoading(v) {
    if (loadingEl) loadingEl.style.display = v ? 'block' : 'none';
  }

  function setEmpty(v) {
    if (emptyEl) emptyEl.style.display = v ? 'block' : 'none';
  }

  async function fetchText(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('fetch failed');
    return r.text();
  }

  async function fetchJson(url) {
    const r = await fetch(url, { cache: 'no-store' });
    if (!r.ok) throw new Error('fetch failed');
    return r.json();
  }

  async function loadRows() {
    try {
      const text = await fetchText(CSV_URL);
      const matrix = csvToMatrix(text);
      if (matrix.length < 2) return [];

      const headers = matrix[0].map((h) =>
        stripAccents(String(h || '').toLowerCase())
      );

      return matrix.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = row[i] != null ? row[i] : '';
        });

        // mapeamento obrigatório por posição (a, e, f)
        obj.a = row[0] != null ? row[0] : '';
        obj.e = row[4] != null ? row[4] : '';
        obj.f = row[5] != null ? row[5] : '';
        return obj;
      });
    } catch (e) {
      try {
        const fb = await fetchJson(FALLBACK_JSON);
        return Array.isArray(fb) ? fb : [];
      } catch (_e) {
        return [];
      }
    }
  }

  function extractItem(r) {
    const nome = r.a || r['influenciadora'] || r['nome'] || '';
    const dtRaw = r.e || r['data + hora'] || r['data e hora'] || r['data'] || '';
    const tipo = r.f || r['tipo'] || '';

    const dt = parsePtDateTime(dtRaw);
    if (!dt) return null;

    const dayKey = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(
      dt.getDate()
    )}`;

    const title = [normalizeText(nome), normalizeText(tipo)].filter(Boolean).join(' ').trim();
    const hour = dt.__hasTime ? `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}` : '';

    return { title, hour, dt, _dayKey: dayKey };
  }

  // regra nova:
  // 1) se tiver evento no mês atual, usa ele
  // 2) senão, usa o próximo mês futuro com eventos (o mais próximo)
  // 3) se não existir futuro, usa o último mês passado com eventos
  function pickTargetMonth(items) {
    if (!items.length) return null;

    const now = new Date();
    const nowIndex = now.getFullYear() * 12 + now.getMonth();

    const monthSet = new Set(
      items.map((it) => it.dt.getFullYear() * 12 + it.dt.getMonth())
    );

    if (monthSet.has(nowIndex)) {
      return { year: now.getFullYear(), month: now.getMonth() };
    }

    const future = [];
    const past = [];
    monthSet.forEach((idx) => {
      if (idx > nowIndex) future.push(idx);
      else past.push(idx);
    });

    if (future.length) {
      future.sort((a, b) => a - b);
      const idx = future[0];
      return { year: Math.floor(idx / 12), month: idx % 12 };
    }

    past.sort((a, b) => b - a);
    const idx = past[0];
    return { year: Math.floor(idx / 12), month: idx % 12 };
  }

  // tooltip global
  function ensureTip() {
    let el = document.querySelector('.calTip');
    if (el) return el;

    el = document.createElement('div');
    el.className = 'calTip';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML =
      '<div class="calTip__title"></div><div class="calTip__meta"></div><div class="calTip__body"></div>';
    document.body.appendChild(el);
    return el;
  }

  function positionTip(anchor, tipEl) {
    const r = anchor.getBoundingClientRect();
    const margin = 10;

    tipEl.style.left = '0px';
    tipEl.style.top = '0px';
    const tr = tipEl.getBoundingClientRect();

    let left = r.left;
    let top = r.bottom + margin;

    if (top + tr.height > window.innerHeight - margin) {
      top = r.top - tr.height - margin;
    }

    if (left + tr.width > window.innerWidth - margin) {
      left = window.innerWidth - tr.width - margin;
    }

    if (left < margin) left = margin;
    if (top < margin) top = margin;

    tipEl.style.left = `${Math.round(left)}px`;
    tipEl.style.top = `${Math.round(top)}px`;
  }

  function showTip(evtEl, tipEl) {
    const raw = evtEl.querySelector('.tip');
    if (!raw) return;

    // tooltip só com hora
    const body = (raw.querySelector('.tip__body')?.textContent || '').trim();

    const t = tipEl.querySelector('.calTip__title');
    const m = tipEl.querySelector('.calTip__meta');
    const b = tipEl.querySelector('.calTip__body');

    t.textContent = '';
    m.textContent = '';
    b.textContent = body;

    t.style.display = 'none';
    m.style.display = 'none';
    b.style.display = body ? 'block' : 'none';

    tipEl.classList.add('is-visible');
    tipEl.setAttribute('aria-hidden', 'false');
    positionTip(evtEl, tipEl);
  }

  function hideTip(tipEl) {
    tipEl.classList.remove('is-visible');
    tipEl.setAttribute('aria-hidden', 'true');
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function buildMonthGrid(year, month, items) {
    const first = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const daysInMonth = last.getDate();

    const byDay = new Map();
    items.forEach((it) => {
      if (it.dt.getFullYear() !== year) return;
      if (it.dt.getMonth() !== month) return;

      const k = it._dayKey;
      if (!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(it);
    });

    // ordena por horário
    for (const entry of byDay.entries()) {
      const k = entry[0];
      const list = entry[1];
      list.sort((a, b) => a.dt.getTime() - b.dt.getTime());
      byDay.set(k, list);
    }

    const monthEl = document.createElement('section');
    monthEl.className = 'month';

    // sem cabeçalho do mês (não exibir mês escrito)
    const dow = document.createElement('div');
    dow.className = 'dow';
    DOW.forEach((d) => {
      const s = document.createElement('span');
      s.textContent = d;
      dow.appendChild(s);
    });
    monthEl.appendChild(dow);

    const grid = document.createElement('div');
    grid.className = 'grid';

    const blanks = mondayFirstIndex(first);
    for (let i = 0; i < blanks; i++) {
      const empty = document.createElement('div');
      empty.className = 'day is-empty';
      grid.appendChild(empty);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${pad2(month + 1)}-${pad2(day)}`;

      const cell = document.createElement('div');
      cell.className = 'day';

      const num = document.createElement('div');
      num.className = 'day__num';
      num.textContent = String(day);
      cell.appendChild(num);

      const list = document.createElement('div');
      list.className = 'evts';

      const todays = byDay.get(key) || [];
      todays.forEach((it) => {
        const evt = document.createElement('div');
        evt.className = 'evt evt--awareness';
        evt.setAttribute('tabindex', '0');

        // visível: a + f
        const t = document.createElement('div');
        t.className = 'evt__title';
        t.textContent = it.title;

        // tooltip: hora
        const tip = document.createElement('div');
        tip.className = 'tip';
        tip.innerHTML =
          `<div class="tip__body">${escapeHtml(it.hour)}</div>`;

        evt.appendChild(t);
        evt.appendChild(tip);
        list.appendChild(evt);
      });

      cell.appendChild(list);
      grid.appendChild(cell);
    }

    monthEl.appendChild(grid);
    return monthEl;
  }

  async function init() {
    setLoading(true);
    setEmpty(false);

    const rows = await loadRows();
    const items = rows.map(extractItem).filter(Boolean);

    if (!items.length) {
      setEmpty(true);
      setLoading(false);
      return;
    }

    const target = pickTargetMonth(items);
    if (!target) {
      setEmpty(true);
      setLoading(false);
      return;
    }

    if (gridHost) {
      gridHost.innerHTML = '';
      gridHost.appendChild(buildMonthGrid(target.year, target.month, items));
    }

    const tipEl = ensureTip();
    let active = null;

    const evts = Array.from(root.querySelectorAll('.evt'));
    evts.forEach((el) => {
      el.addEventListener('mouseenter', () => {
        active = el;
        showTip(el, tipEl);
      });
      el.addEventListener('mouseleave', () => {
        active = null;
        hideTip(tipEl);
      });
      el.addEventListener('focus', () => {
        active = el;
        showTip(el, tipEl);
      });
      el.addEventListener('blur', () => {
        active = null;
        hideTip(tipEl);
      });
    });

    window.addEventListener(
      'scroll',
      () => {
        if (active) positionTip(active, tipEl);
      },
      { passive: true }
    );
    window.addEventListener('resize', () => {
      if (active) positionTip(active, tipEl);
    });

    setLoading(false);
  }

  init();
})();
