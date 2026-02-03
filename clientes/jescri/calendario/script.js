/* calendário (js puro)
   - semestral: 6 meses (fev a jul)
   - mensal: um mês inteiro
   - fonte: csv publicado; fallback local json para não quebrar
*/

(function(){
  'use strict';

  const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const DOW = ['seg','ter','qua','qui','sex','sáb','dom'];

  const TYPE_CLASS = {
    'lançamento': 'lancamento',
    'lancamento': 'lancamento',
    'comercial': 'comercial',
    'pagamento': 'pagamento',
    'awareness': 'awareness'
  };

  const TYPE_COLOR = {
    lancamento: '#b93a4b',
    comercial: '#197c9b',
    pagamento: '#1f8a3e',
    awareness: '#a77800'
  };

  function pad2(n){ return String(n).padStart(2,'0'); }

  function stripAccents(s){
    try{ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }catch(e){ return (s||''); }
  }

  function normType(raw){
    const key = stripAccents(String(raw||'').trim().toLowerCase());
    return TYPE_CLASS[key] || 'awareness';
  }

  function parsePtDate(raw){
    const s = String(raw||'').trim();
    if(!s) return null;

    // dd/mm/yyyy
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if(m){
      const dd = parseInt(m[1],10);
      const mm = parseInt(m[2],10);
      const yyyy = parseInt(m[3],10);
      return new Date(yyyy, mm-1, dd);
    }

    const d = new Date(s);
    if(isNaN(d.getTime())) return null;
    return d;
  }

  function csvParseLine(line){
    const out = [];
    let cur = '';
    let inQ = false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(ch === '"'){
        if(inQ && line[i+1] === '"'){ cur += '"'; i++; }
        else{ inQ = !inQ; }
        continue;
      }
      if(ch === ',' && !inQ){ out.push(cur); cur = ''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(v => (v||'').trim());
  }

  function csvToRows(text){
    const clean = String(text||'').replace(/^\uFEFF/, '');
    const lines = clean.split(/\r?\n/).filter(l => l.trim().length);
    if(!lines.length) return [];

    const headersRaw = csvParseLine(lines[0]);
    const headersNorm = headersRaw.map(h => stripAccents(String(h||'').toLowerCase()));

    const rows = [];
    for(let i=1;i<lines.length;i++){
      const cols = csvParseLine(lines[i]);
      const obj = {};
      headersNorm.forEach((h, idx) => { obj[h] = cols[idx] || ''; });
      rows.push(obj);
    }
    return rows;
  }

  function normalizeVisibleText(v){
    return String(v||'')
      .replace(/[\u2014\u2013]/g, '-')
      .trim()
      .toLowerCase();
  }

  // tooltip global
  function ensureTip(){
    let el = document.querySelector('.calTip');
    if(el) return el;

    el = document.createElement('div');
    el.className = 'calTip';
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<div class="calTip__title"></div><div class="calTip__meta"></div><div class="calTip__body"></div>';
    document.body.appendChild(el);
    return el;
  }

  function showTipForEvent(evtEl, tipEl){
    if(!evtEl || !tipEl) return;
    const raw = evtEl.querySelector('.tip');
    if(!raw) return;

    let title = '';
    let meta = '';
    let body = raw.innerHTML || '';

    const titleEl = raw.querySelector('.tip__title');
    const metaEl = raw.querySelector('.tip__meta');
    const bodyEl = raw.querySelector('.tip__body');

    if(titleEl) title = titleEl.textContent || '';
    if(metaEl) meta = metaEl.textContent || '';
    if(bodyEl) body = bodyEl.innerHTML || '';

    tipEl.querySelector('.calTip__title').textContent = title;
    tipEl.querySelector('.calTip__meta').textContent = meta;
    tipEl.querySelector('.calTip__body').innerHTML = body;

    tipEl.classList.add('is-visible');
    tipEl.setAttribute('aria-hidden', 'false');

    positionTip(evtEl, tipEl);
  }

  function hideTip(tipEl){
    if(!tipEl) return;
    tipEl.classList.remove('is-visible');
    tipEl.setAttribute('aria-hidden', 'true');
  }

  function positionTip(evtEl, tipEl){
    if(!evtEl || !tipEl) return;

    const r = evtEl.getBoundingClientRect();
    const margin = 10;

    // mede depois de popular
    tipEl.style.left = '0px';
    tipEl.style.top = '0px';

    const tr = tipEl.getBoundingClientRect();

    let left = r.left;
    let top = r.bottom + margin;

    // preferir encaixe embaixo, mas evitar sair da tela
    if(top + tr.height > window.innerHeight - margin){
      top = r.top - tr.height - margin;
    }

    if(left + tr.width > window.innerWidth - margin){
      left = window.innerWidth - tr.width - margin;
    }

    if(left < margin) left = margin;
    if(top < margin) top = margin;

    tipEl.style.left = `${Math.round(left)}px`;
    tipEl.style.top = `${Math.round(top)}px`;
  }

  function startOfMonthRange(date){
    const y = date.getFullYear();
    const m = date.getMonth();
    const start = new Date(y, m, 1);
    const end = new Date(y, m + 1, 0);
    return { start, end };
  }

  function mondayFirstIndex(d){
    return (d.getDay() + 6) % 7; // 0 seg
  }

  function fmtDate(d){
    return `${pad2(d.getDate())}/${pad2(d.getMonth()+1)}/${d.getFullYear()}`;
  }

  function buildMonth(monthDate, events, view){
    const { start, end } = startOfMonthRange(monthDate);

    const wrap = document.createElement('section');
    wrap.className = 'month';

    const head = document.createElement('div');
    head.className = 'month__head';

    const title = document.createElement('h2');
    title.className = 'month__title';
    title.textContent = MONTHS[monthDate.getMonth()];

    const range = document.createElement('div');
    range.className = 'month__range';
    range.textContent = `${fmtDate(start)} a ${fmtDate(end)}`;

    head.appendChild(title);
    head.appendChild(range);
    wrap.appendChild(head);

    const dow = document.createElement('div');
    dow.className = 'dow';
    DOW.forEach((d) => {
      const el = document.createElement('span');
      el.textContent = d;
      dow.appendChild(el);
    });
    wrap.appendChild(dow);

    const grid = document.createElement('div');
    grid.className = 'grid';

    const first = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
    const daysInMonth = end.getDate();

    const blanks = mondayFirstIndex(first);
    for(let i=0;i<blanks;i++){
      const empty = document.createElement('div');
      empty.className = 'day is-empty';
      grid.appendChild(empty);
    }

    for(let day=1; day<=daysInMonth; day++){
      const cellDate = new Date(monthDate.getFullYear(), monthDate.getMonth(), day);
      const iso = `${cellDate.getFullYear()}-${pad2(cellDate.getMonth()+1)}-${pad2(cellDate.getDate())}`;

      const cell = document.createElement('div');
      cell.className = 'day';

      const num = document.createElement('div');
      num.className = 'day__num';
      num.textContent = String(day);
      cell.appendChild(num);

      const list = document.createElement('div');
      list.className = 'evts';

      const todays = events.filter((e) => e._iso === iso);

      if(view === 'semestral'){
        // dots
        todays.forEach((e) => {
          const btn = document.createElement('div');
          btn.className = `evt evt--${e._type}`;
          btn.setAttribute('tabindex', '0');

          const dot = document.createElement('span');
          dot.className = 'evt__dot';
          dot.style.background = TYPE_COLOR[e._type] || TYPE_COLOR.awareness;

          const titleEl = document.createElement('span');
          titleEl.className = 'evt__title';
          titleEl.textContent = e.evento;

          const metaEl = document.createElement('span');
          metaEl.className = 'evt__meta';
          metaEl.textContent = e.tipo;

          const tip = document.createElement('div');
          tip.className = 'tip';
          tip.innerHTML = `<div class="tip__title">${escapeHtml(e.evento)}</div><div class="tip__meta">${escapeHtml(e._meta)}</div><div class="tip__body">${escapeHtml(e._body)}</div>`;

          btn.appendChild(dot);
          btn.appendChild(titleEl);
          btn.appendChild(metaEl);
          btn.appendChild(tip);
          list.appendChild(btn);
        });
      } else {
        // mensal: eventos minimalistas (bolinha + nome), detalhes no tooltip
        todays.forEach((e) => {
          const btn = document.createElement('div');
          btn.className = `evt evt--${e._type}`;
          btn.setAttribute('tabindex', '0');

          const dot = document.createElement('span');
          dot.className = 'evt__dot';
          dot.style.background = TYPE_COLOR[e._type] || TYPE_COLOR.awareness;

          const titleEl = document.createElement('div');
          titleEl.className = 'evt__title';
          titleEl.textContent = e.evento;

          const tip = document.createElement('div');
          tip.className = 'tip';
          tip.innerHTML = `<div class="tip__title">${escapeHtml(e.evento)}</div><div class="tip__meta">${escapeHtml(e._meta)}</div><div class="tip__body">${escapeHtml(e._body)}</div>`;
          btn.appendChild(dot);
          btn.appendChild(titleEl);
          btn.appendChild(tip);

          list.appendChild(btn);
        });
      }

      cell.appendChild(list);
      grid.appendChild(cell);
    }

    wrap.appendChild(grid);
    return wrap;
  }

  function escapeHtml(str){
    return String(str||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function normalizeEvents(rawList){
    const list = Array.isArray(rawList) ? rawList : [];

    return list.map((e) => {
      const evento = normalizeVisibleText(e.evento || e.titulo || e.nome || '');
      const tipo = normalizeVisibleText(e.tipo || '');
      const impacto = normalizeVisibleText(e.impacto || e.categoria || '');
      const periodo = normalizeVisibleText(e.periodo || '');

      const start = parsePtDate(e.start || e.data || e.inicio || '');
      const end = parsePtDate(e.end || e.fim || e.termino || e.start || '');

      const s = start || end;

      const iso = s ? `${s.getFullYear()}-${pad2(s.getMonth()+1)}-${pad2(s.getDate())}` : '';

      const t = normType(tipo);
      const metaBits = [];
      if(tipo) metaBits.push(tipo);
      if(impacto) metaBits.push(impacto);
      if(periodo) metaBits.push(periodo);

      return {
        evento,
        tipo,
        impacto,
        periodo,
        start,
        end,
        _iso: iso,
        _type: t,
        _meta: metaBits.join(' · '),
        _body: ''
      };
    }).filter(e => e._iso);
  }

  async function fetchWithFallback(){
    const sources = [
      // csv publicado do calendário semestral
      { type: 'csv', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBp1ORyL7U0f1PJNho0_vrsJjoXjSCU1O1-p_BzlAjL6ggO7LktE0se1DtjeITVc1h2RmXWaodhhWU/pub?gid=22436027&single=true&output=csv' },
      // fallback local
      { type: 'json', url: '/clientes/jescri/calendario/eventos-semestral-2026.json' }
    ];

    for(const src of sources){
      try{
        const res = await fetch(src.url, { cache: src.type === 'csv' ? 'no-store' : 'force-cache' });
        if(!res.ok) throw new Error('fetch failed');

        if(src.type === 'csv'){
          const text = await res.text();
          const rows = csvToRows(text);

          // tenta mapear por headers conhecidos
          const events = rows.map((r) => {
            const k = Object.keys(r);
            const evento = r['evento'] || r['nome'] || r['titulo'] || r[k[0]] || '';
            const tipo = r['tipo'] || r[k[1]] || '';
            const impacto = r['impacto'] || r[k[2]] || '';
            const periodo = r['periodo'] || r[k[3]] || '';
            const start = r['start'] || r['data'] || r['inicio'] || r[k[4]] || '';
            const end = r['end'] || r['fim'] || r[k[5]] || '';

            return { evento, tipo, impacto, periodo, start, end };
          });

          return normalizeEvents(events);
        }

        const json = await res.json();
        return normalizeEvents(json);
      }catch(e){
        // tenta o próximo
      }
    }

    return [];
  }

  async function renderCalendar(root){
    const view = String(root.getAttribute('data-view') || '').trim().toLowerCase();
    const year = parseInt(root.getAttribute('data-year') || '2026', 10);

    // mensal: data-month (1-12)
    const month = parseInt(root.getAttribute('data-month') || '0', 10);

    const loadingEl = root.querySelector('[data-loading]');
    const monthsHost = root.querySelector('[data-months]');

    if(!monthsHost) return;

    const setLoading = (v) => {
      if(!loadingEl) return;
      loadingEl.style.display = v ? 'block' : 'none';
    };

    setLoading(true);

    const events = await fetchWithFallback();

    // tooltip
    const tip = ensureTip();
    let activeEl = null;

    function bindTips(){
      const evts = Array.from(monthsHost.querySelectorAll('.evt'));

      evts.forEach((el) => {
        el.addEventListener('mouseenter', () => { activeEl = el; showTipForEvent(el, tip); });
        el.addEventListener('mouseleave', () => { activeEl = null; hideTip(tip); });
        el.addEventListener('focus', () => { activeEl = el; showTipForEvent(el, tip); });
        el.addEventListener('blur', () => { activeEl = null; hideTip(tip); });
      });

      window.addEventListener('scroll', () => { if(activeEl) positionTip(activeEl, tip); }, { passive: true });
      window.addEventListener('resize', () => { if(activeEl) positionTip(activeEl, tip); });
    }

    monthsHost.innerHTML = '';

    if(view === 'semestral'){
      const startMonth = 2; // fev
      const count = 6;

      for(let i=0;i<count;i++){
        const m = startMonth - 1 + i;
        const monthDate = new Date(year, m, 1);

        const monthEvents = events.filter((e) => e.start && e.start.getFullYear() === year && e.start.getMonth() === m);
        monthsHost.appendChild(buildMonth(monthDate, monthEvents, 'semestral'));
      }

      bindTips();
      setLoading(false);
      return;
    }

    // mensal
    const m0 = Math.max(1, Math.min(12, month)) - 1;
    const monthDate = new Date(year, m0, 1);
    const monthEvents = events.filter((e) => e.start && e.start.getFullYear() === year && e.start.getMonth() === m0);

    monthsHost.appendChild(buildMonth(monthDate, monthEvents, 'mensal'));
    bindTips();

    setLoading(false);
  }

  // boot
  const roots = Array.from(document.querySelectorAll('[data-cal-root]'));
  if(!roots.length) return;
  roots.forEach((r) => renderCalendar(r));
})();
