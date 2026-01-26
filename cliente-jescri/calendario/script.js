(() => {
  'use strict';

  // sem travessão, tudo em caixa baixa
  const CAL_ID = 'calRoot';
  const wrap = document.getElementById(CAL_ID);
  if(!wrap) return;

  const VIEW = wrap.getAttribute('data-view') || 'semestral'; // 'semestral' | 'mensal'
  const MONTHS = [
    '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  // cores com mais leitura (mesma lógica do bullet/legenda)
  const TYPE_DOT = {
    'lancamento': '#b93a4b',
    'comercial': '#197c9b',
    'pagamento': '#1f8a3e',
    'awareness': '#a77800'
  };

  const TYPE_CLASS = {
    'lançamento': 'lancamento',
    'lancamento': 'lancamento',
    'comercial': 'comercial',
    'pagamento': 'pagamento',
    'awareness': 'awareness'
  };

  const DOW = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

  function normalizeVisibleText(v){
    return String(v || '')
      .replace(/—/g, '-')
      .trim()
      .toLowerCase();
  }

  
  function stripAccents(s){
    try{ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }catch(e){ return (s||''); }
  }

  function csvParseLine(line){
    const out = [];
    let cur = '';
    let inQ = false;
    for(let i=0;i<line.length;i++){
      const ch = line[i];
      if(ch === '"'){
        if(inQ && line[i+1] === '"'){ cur += '"'; i++; }
        else { inQ = !inQ; }
        continue;
      }
      if(ch === ',' && !inQ){
        out.push(cur);
        cur = '';
        continue;
      }
      cur += ch;
    }
    out.push(cur);
    return out.map(v => (v||'').trim());
  }

  function csvToRows(text){
    const clean = (text||'').replace(/^\uFEFF/, '');
    const lines = clean.split(/\r?\n/).filter(l => l.trim().length);
    if(!lines.length) return { headers: [], rows: [] };
    const headersRaw = csvParseLine(lines[0]);
    const headersNorm = headersRaw.map(h => stripAccents(h.toLowerCase()));
    const rows = [];
    for(let i=1;i<lines.length;i++){
      const cols = csvParseLine(lines[i]);
      const obj = {};
      headersNorm.forEach((h, idx) => { obj[h] = cols[idx] || ''; });
      rows.push(obj);
    }
    return { headers: headersNorm, rows };
  }

  function coalesce(obj, keys){
    for(const k of keys){
      const nk = stripAccents(k.toLowerCase());
      if(obj[nk] != null && String(obj[nk]).trim() !== '') return String(obj[nk]).trim();
    }
    return '';
  }

  function parsePeriodoToStartEnd(periodo){
    // aceita "dd/mm/aaaa" ou "dd/mm/aaaa a dd/mm/aaaa"
    const s = String(periodo || '').trim();
    let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})\s*a\s*(\d{2})\/(\d{2})\/(\d{4})$/i);
    if(m){
      return { start: `${m[1]}/${m[2]}/${m[3]}`, end: `${m[4]}/${m[5]}/${m[6]}` };
    }
    m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if(m){
      return { start: `${m[1]}/${m[2]}/${m[3]}`, end: `${m[1]}/${m[2]}/${m[3]}` };
    }
    return null;
  }

  function ddmmyyyyToIso(ddmmyyyy){
    const m = String(ddmmyyyy || '').match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if(!m) return '';
    return `${m[3]}-${m[2]}-${m[1]}`;
  }

  function normalizeTipo(tipo){
    const t = stripAccents((tipo||'').toLowerCase().trim());
    if(t.includes('lan')) return 'lançamento';
    if(t.includes('comercial')) return 'comercial';
    if(t.includes('paga')) return 'pagamento';
    if(t.includes('awareness') || t.includes('topo') || t.includes('marca')) return 'awareness';
    return (tipo||'').toLowerCase().trim();
  }

  const CSV_SOURCES = [
    {
      name: 'lançamentos',
      url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbaV1QRExs5RMeSiSRFDEbUzagw6TeZOVn4y8bPbj0CJMcTOZr8KIW4Oja4qiOsnUTtnqEtlM5CfQl/pub?gid=22436027&single=true&output=csv'
    },
    {
      name: 'oportunidades',
      url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbaV1QRExs5RMeSiSRFDEbUzagw6TeZOVn4y8bPbj0CJMcTOZr8KIW4Oja4qiOsnUTtnqEtlM5CfQl/pub?gid=0&single=true&output=csv'
    }
  ];

  async function loadEventsFromCSVs(){
    const all = [];
    for(const src of CSV_SOURCES){
      try{
        const res = await fetch(src.url, { cache: 'no-store' });
        if(!res.ok) throw new Error(`fetch failed: ${res.status}`);
        const text = await res.text();
        const { rows } = csvToRows(text);

        for(const r of rows){
        const periodo = coalesce(r, ['periodo', 'período', 'data', 'dia']);
        const evento = coalesce(r, ['evento', 'event']);
        const tipoRaw = coalesce(r, ['tipo', 'type']);
        const impacto = coalesce(r, ['por que impacta', 'porque impacta', 'por_que_impacta', 'por que impacta?', 'impacto']);

        const pe = parsePeriodoToStartEnd(periodo);
        if(!pe || !evento) continue;

        const tipo = normalizeTipo(tipoRaw);
        const startIso = ddmmyyyyToIso(pe.start);
        const endIso = ddmmyyyyToIso(pe.end);

          all.push({
          evento: normalizeVisibleText(evento),
          tipo: tipo,
          impacto: normalizeVisibleText(impacto),
          periodo: periodo,
          start: startIso,
          end: endIso
        });
        }
      }catch(err){
        // se uma fonte falhar, seguimos com as outras
        continue;
      }
    }
    // dedupe simple
    const seen = new Set();
    return all.filter(e => {
      const k = [e.start,e.end,e.evento,e.tipo].join('|');
      if(seen.has(k)) return false;
      seen.add(k);
      return true;
    });
  }

  async function loadEvents(){
    const csvEvents = await loadEventsFromCSVs().catch(() => []);
    if(csvEvents && csvEvents.length) return csvEvents;

    // fallback local (mesmo layout do site) para não quebrar em produção se o google bloquear cors
    try{
      const res = await fetch('eventos-semestral-2026.json', { cache: 'no-store' });
      if(!res.ok) throw new Error('fallback json missing');
      const data = await res.json();
      const out = [];
      (Array.isArray(data) ? data : []).forEach(e => {
        const pe = parsePeriodoToStartEnd(e.data || e.periodo || '');
        const startIso = ddmmyyyyToIso(pe ? pe.start : '');
        if(!startIso) return;
        const tipo = normalizeTipo(e.tipo || '');
        out.push({
          evento: normalizeVisibleText(e.evento),
          tipo: tipo,
          impacto: normalizeVisibleText(e.impacto),
          periodo: e.data || '',
          start: startIso,
          end: startIso
        });
      });
      return out;
    }catch(err){
      return [];
    }
  }

function pad2(n){ return String(n).padStart(2, '0'); }

  function parseISODate(s){
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(s || '').trim());
    if(!m) return null;
    return new Date(parseInt(m[1],10), parseInt(m[2],10)-1, parseInt(m[3],10));
  }

  function formatRange(periodo){
    // "01/02/2026 a 15/02/2026" -> "01 a 15"
    const s = String(periodo || '');
    const m = /^(\d{2})\/(\d{2})\/(\d{4})\s*a\s*(\d{2})\/(\d{2})\/(\d{4})/.exec(s);
    if(!m) return '';
    return `${m[1]} a ${m[4]}`;
  }

  function monthKey(y, m){
    return `${y}-${pad2(m)}`;
  }

  function buildMonth(y, m, eventsByDay){
    const first = new Date(y, m-1, 1);
    const last = new Date(y, m, 0);
    const daysInMonth = last.getDate();

    // monday-first index
    const firstIdx = (first.getDay() + 6) % 7;

    const monthEl = document.createElement('section');
    monthEl.className = 'month';
    monthEl.setAttribute('data-month', monthKey(y,m));

    const head = document.createElement('div');
    head.className = 'month__head';

    const title = document.createElement('h4');
    title.className = 'month__title';
    title.textContent = MONTHS[m];

    const range = document.createElement('div');
    range.className = 'month__range';
    range.textContent = `${pad2(1)}/${pad2(m)}/${y} a ${pad2(daysInMonth)}/${pad2(m)}/${y}`;

    head.appendChild(title);
    head.appendChild(range);

    const dow = document.createElement('div');
    dow.className = 'dow';
    DOW.forEach(d => {
      const s = document.createElement('div');
      s.className = 'dow__item';
      s.textContent = d;
      dow.appendChild(s);
    });

    const grid = document.createElement('div');
    grid.className = 'grid';

    // blanks
    for(let i=0;i<firstIdx;i++){
      const cell = document.createElement('div');
      cell.className = 'day is-empty';
      grid.appendChild(cell);
    }

    // days
    for(let day=1; day<=daysInMonth; day++){
      const cell = document.createElement('div');
      cell.className = 'day';

      const num = document.createElement('div');
      num.className = 'day__num';
      num.textContent = String(day);
      cell.appendChild(num);

      const list = document.createElement('div');
      list.className = 'evts';

      const iso = `${y}-${pad2(m)}-${pad2(day)}`;
      const items = eventsByDay.get(iso) || [];

      items.forEach((evt) => {
        const btn = document.createElement('div');
        btn.className = 'evt';
        btn.setAttribute('tabindex', '0');

        const dot = document.createElement('span');
        dot.className = 'evt__dot';
        const tClass = TYPE_CLASS[String(evt.tipo || '').toLowerCase()] || 'awareness';
        dot.style.background = TYPE_DOT[tClass] || 'rgba(255,255,255,0.7)';

        const text = document.createElement('div');

        const ttl = document.createElement('div');
        ttl.className = 'evt__title';
        ttl.textContent = normalizeVisibleText(evt.evento);

        const meta = document.createElement('span');
        meta.className = 'evt__meta';

        const rangeTxt = evt.end ? formatRange(evt.periodo) : '';
        const labelBits = [];
        labelBits.push(normalizeVisibleText(evt.tipo));
        if(rangeTxt) labelBits.push(rangeTxt);
        meta.textContent = labelBits.filter(Boolean).join(' · ');

        const tip = document.createElement('div');
        tip.className = 'tip';
        const strong = document.createElement('strong');
        strong.textContent = 'por que impacta';
        const p = document.createElement('div');
        p.textContent = normalizeVisibleText(evt.impacto) || 'sem observações no momento.';
        tip.appendChild(strong);
        tip.appendChild(p);

        text.appendChild(ttl);
        text.appendChild(meta);

        btn.appendChild(dot);
        btn.appendChild(text);
        btn.appendChild(tip);

        list.appendChild(btn);
      });

      cell.appendChild(list);
      grid.appendChild(cell);
    }

    monthEl.appendChild(head);
    monthEl.appendChild(dow);
    monthEl.appendChild(grid);

    return monthEl;
  }

  function groupByDay(events){
    const map = new Map();
    (events || []).forEach(e => {
      const s = parseISODate(e.start);
      const end = parseISODate(e.end || e.start);
      if(!s || !end) return;

      // inclusive range
      const cur = new Date(s.getTime());
      while(cur <= end){
        const key = `${cur.getFullYear()}-${pad2(cur.getMonth()+1)}-${pad2(cur.getDate())}`;
        if(!map.has(key)) map.set(key, []);
        map.get(key).push(e);
        cur.setDate(cur.getDate()+1);
      }
    });

    // sort within day by type then title
    for(const [k, list] of map.entries()){
      list.sort((a,b) => {
        const ta = TYPE_CLASS[String(a.tipo||'').toLowerCase()] || 'z';
        const tb = TYPE_CLASS[String(b.tipo||'').toLowerCase()] || 'z';
        if(ta < tb) return -1;
        if(ta > tb) return 1;
        return String(a.evento||'').localeCompare(String(b.evento||''), 'pt-BR');
      });
    }
    return map;
  }

  function initTooltip(){
    const tipEl = document.createElement('div');
    tipEl.className = 'calTip';
    tipEl.innerHTML = `
      <div class="calTip__inner">
        <div class="calTip__title"></div>
        <div class="calTip__meta"></div>
        <div class="calTip__body"></div>
      </div>
    `;
    document.body.appendChild(tipEl);

    const titleEl = tipEl.querySelector('.calTip__title');
    const metaEl = tipEl.querySelector('.calTip__meta');
    const bodyEl = tipEl.querySelector('.calTip__body');

    let activeTarget = null;
    let hideT = null;

    function positionNear(target){
      const r = target.getBoundingClientRect();
      const pad = 12;
      const w = tipEl.offsetWidth;
      const h = tipEl.offsetHeight;

      let left = r.left + window.scrollX + (r.width / 2) - (w / 2);
      let top = r.top + window.scrollY - h - 10;

      // keep inside viewport
      const minLeft = window.scrollX + pad;
      const maxLeft = window.scrollX + window.innerWidth - w - pad;
      left = Math.max(minLeft, Math.min(maxLeft, left));

      const minTop = window.scrollY + pad;
      if(top < minTop){
        top = r.bottom + window.scrollY + 10;
      }

      tipEl.style.left = `${left}px`;
      tipEl.style.top = `${top}px`;
    }

    function show(target){
      if(!target) return;
      const t = target.querySelector('.evt__title');
      const m = target.querySelector('.evt__meta');
      const p = target.querySelector('.tip > div:last-child');

      titleEl.textContent = t ? t.textContent : '';
      metaEl.textContent = m ? m.textContent : '';
      bodyEl.textContent = p ? p.textContent : '';

      tipEl.classList.add('is-visible');
      positionNear(target);
      activeTarget = target;
    }

    function hide(){
      tipEl.classList.remove('is-visible');
      activeTarget = null;
    }

    function scheduleHide(){
      clearTimeout(hideT);
      hideT = setTimeout(hide, 120);
    }

    // events
    wrap.addEventListener('mouseover', (e) => {
      const evt = e.target.closest('.evt');
      if(!evt || !wrap.contains(evt)) return;
      clearTimeout(hideT);
      show(evt);
    });

    wrap.addEventListener('mouseout', (e) => {
      const evt = e.target.closest('.evt');
      if(!evt || !wrap.contains(evt)) return;
      scheduleHide();
    });

    // keep open when hovering tooltip itself
    tipEl.addEventListener('mouseover', () => {
      clearTimeout(hideT);
    });
    tipEl.addEventListener('mouseout', () => {
      scheduleHide();
    });

    // keyboard
    wrap.addEventListener('focusin', (e) => {
      const evt = e.target.closest('.evt');
      if(!evt || !wrap.contains(evt)) return;
      clearTimeout(hideT);
      show(evt);
    });
    wrap.addEventListener('focusout', (e) => {
      const evt = e.target.closest('.evt');
      if(!evt || !wrap.contains(evt)) return;
      scheduleHide();
    });

    // click outside to close
    document.addEventListener('click', (e) => {
      if(!activeTarget) return;
      if(activeTarget.contains(e.target)) return;
      if(tipEl.contains(e.target)) return;
      hide();
    });

    // reposition on scroll/resize
    window.addEventListener('scroll', () => {
      if(activeTarget) positionNear(activeTarget);
    }, { passive: true });

    window.addEventListener('resize', () => {
      if(activeTarget) positionNear(activeTarget);
    });
  }

  function renderLegenda(){
    const legend = wrap.querySelector('[data-legend]');
    if(!legend) return;

    legend.innerHTML = `
      <span class="chip chip--lancamento"><span class="chip__dot"></span> lançamento</span>
      <span class="chip chip--comercial"><span class="chip__dot"></span> comercial</span>
      <span class="chip chip--pagamento"><span class="chip__dot"></span> pagamento</span>
      <span class="chip chip--awareness"><span class="chip__dot"></span> awareness</span>
    `;
  }

  function getMonthsToRender(){
    if(VIEW === 'mensal'){
      const y = parseInt(wrap.getAttribute('data-year') || '2026', 10);
      const m = parseInt(wrap.getAttribute('data-month') || '2', 10);
      return [{ y, m }];
    }
    // semestral default: fev a jul 2026
    return [
      { y: 2026, m: 2 },
      { y: 2026, m: 3 },
      { y: 2026, m: 4 },
      { y: 2026, m: 5 },
      { y: 2026, m: 6 },
      { y: 2026, m: 7 }
    ];
  }

  function renderMonths(eventsByDay){
    const host = wrap.querySelector('[data-months]');
    if(!host) return;
    host.innerHTML = '';

    const months = getMonthsToRender();
    months.forEach(({y,m}) => {
      host.appendChild(buildMonth(y, m, eventsByDay));
    });
  }

  function setLoading(isLoading){
    const el = wrap.querySelector('[data-loading]');
    if(!el) return;
    el.style.display = isLoading ? 'block' : 'none';
  }

  async function init(){
    try{
      setLoading(true);
      renderLegenda();
      initTooltip();

      const eventsByDay = groupByDay(await loadEvents());
      renderMonths(eventsByDay);
    }catch(err){
      // fail silently (sem travessão, sem texto extra)
    }finally{
      setLoading(false);
    }
  }

  init();
})();
