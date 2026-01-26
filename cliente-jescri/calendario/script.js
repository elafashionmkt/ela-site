(function(){
  const wrap = document.getElementById('calWrap');
  const loading = document.getElementById('calLoading');
  const root = document.querySelector('.cal');

  if(!wrap || !root) return;

  const VIEW = root.getAttribute('data-view') || 'semestral';
  const MONTH_ONLY = parseInt(root.getAttribute('data-month') || '', 10);

  const CSV_SOURCES = [
    { key: 'lancamentos', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbaV1QRExs5RMeSiSRFDEbUzagw6TeZOVn4y8bPbj0CJMcTOZr8KIW4Oja4qiOsnUTtnqEtlM5CfQl/pub?gid=22436027&single=true&output=csv' },
    { key: 'oportunidades', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbaV1QRExs5RMeSiSRFDEbUzagw6TeZOVn4y8bPbj0CJMcTOZr8KIW4Oja4qiOsnUTtnqEtlM5CfQl/pub?gid=953716292&single=true&output=csv' },
    { key: 'comerciais', url: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRbaV1QRExs5RMeSiSRFDEbUzagw6TeZOVn4y8bPbj0CJMcTOZr8KIW4Oja4qiOsnUTtnqEtlM5CfQl/pub?gid=614552034&single=true&output=csv' }
  ];

  const TYPE_CLASS = {
    'lançamento': 'lancamento',
    'lancamento': 'lancamento',
    'comercial': 'comercial',
    'pagamento': 'pagamento',
    'awareness': 'awareness'
  };

  // cores com mais leitura (mesma lógica do bullet/legenda)
  const TYPE_DOT = {
    'lancamento': '#b93a4b',
    'comercial': '#197c9b',
    'pagamento': '#1f8a3e',
    'awareness': '#a77800'
  };

  const MONTHS = [
    '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

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

  function parsePeriodoToStartEnd(periodo){
    const p = (periodo||'').trim();
    const m = p.match(/(\d{2})\/(\d{2})\/(\d{4})/g);
    if(!m || !m.length) return null;
    const start = m[0];
    const end = m[1] || m[0];
    return { start, end };
  }

  function ddmmyyyyToIso(d){
    const [dd,mm,yyyy] = d.split('/');
    return `${yyyy}-${mm}-${dd}`;
  }

  function coalesce(obj, keys){
    for(const k of keys){
      if(obj[k] && String(obj[k]).trim()) return String(obj[k]).trim();
    }
    return '';
  }

  function normalizeTipo(tipo){
    const t = stripAccents((tipo||'').toLowerCase().trim());
    if(t.includes('lan')) return 'lançamento';
    if(t.includes('comercial')) return 'comercial';
    if(t.includes('paga')) return 'pagamento';
    if(t.includes('awareness') || t.includes('topo') || t.includes('marca')) return 'awareness';
    return (tipo||'').toLowerCase().trim();
  }

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
      const s = document.createElement('span');
      s.textContent = d;
      dow.appendChild(s);
    });

    const grid = document.createElement('div');
    grid.className = 'grid';

    // blanks before
    for(let i=0;i<firstIdx;i++){
      const d = document.createElement('div');
      d.className = 'day is-empty';
      d.innerHTML = '<div class="day__num">&nbsp;</div>';
      grid.appendChild(d);
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

  function getViewYear(){
    const yAttr = parseInt(root.getAttribute('data-year') || '', 10);
    if(Number.isFinite(yAttr) && yAttr > 2000) return yAttr;
    const today = new Date();
    return today.getFullYear();
  }

  function getMonthsToRender(){
    if(VIEW === 'mensal' && MONTH_ONLY) return [MONTH_ONLY];

    const startAttr = parseInt(root.getAttribute('data-start') || '', 10);
    const today = new Date();
    const startMonth = (Number.isFinite(startAttr) && startAttr >= 1 && startAttr <= 12)
      ? startAttr
      : (today.getMonth() + 1);

    const len = (VIEW === 'trimestral') ? 3 : 6;
    const out = [];
    for(let i=0;i<len;i++){
      const m = startMonth + i;
      out.push(((m - 1) % 12) + 1);
    }
    return out;
  }

  function groupByDay(events){
    const map = new Map();
    events.forEach(e => {
      const key = String(e.start);
      if(!map.has(key)) map.set(key, []);
      map.get(key).push(e);
    });

    // ordena dentro do dia
    map.forEach((arr) => {
      arr.sort((a,b) => String(a.tipo).localeCompare(String(b.tipo)));
    });

    return map;
  }

  async function init(){
    try{
      const eventsByDay = groupByDay(await loadEvents());
      const year = getViewYear();
      const monthsToRender = getMonthsToRender();

      wrap.innerHTML = '';
      monthsToRender.forEach(m => {
        const monthEl = buildMonth(year, m, eventsByDay);
        wrap.appendChild(monthEl);
      });

      initTooltip();

    }catch(err){
      wrap.innerHTML = '<div class="cal__loading">não foi possível carregar o calendário.</div>';
    }finally{
      if(loading) loading.remove();
    }
  }

  function initTooltip(){
    const existing = document.querySelector('.calTip');
    const tipEl = existing || document.createElement('div');
    if(!existing){
      tipEl.className = 'calTip';
      document.body.appendChild(tipEl);
    }

    let active = null;

    function clamp(n, min, max){
      return Math.max(min, Math.min(max, n));
    }

    function hide(){
      tipEl.classList.remove('is-on');
      active = null;
    }

    function show(forEvt){
      if(!forEvt) return;

      const title = (forEvt.querySelector('.evt__title')?.textContent || '').trim();
      const meta = (forEvt.querySelector('.evt__meta')?.textContent || '').trim();
      const tipTitle = (forEvt.querySelector('.tip strong')?.textContent || 'por que impacta').trim();
      const tipBody = (forEvt.querySelector('.tip')?.textContent || '').replace(tipTitle, '').trim();
      const body = tipBody || 'sem observações no momento.';

      tipEl.innerHTML = '';
      const s = document.createElement('strong');
      s.textContent = tipTitle;
      const p = document.createElement('div');
      p.textContent = body;
      const h = document.createElement('div');
      h.style.fontWeight = '600';
      h.style.marginBottom = '6px';
      h.textContent = title;
      const m = document.createElement('div');
      m.style.opacity = '0.9';
      m.style.marginBottom = '8px';
      m.textContent = meta;
      tipEl.appendChild(h);
      tipEl.appendChild(m);
      tipEl.appendChild(s);
      tipEl.appendChild(p);

      tipEl.style.left = '12px';
      tipEl.style.top = '12px';
      tipEl.classList.add('is-on');

      const rect = forEvt.getBoundingClientRect();
      const tipRect = tipEl.getBoundingClientRect();
      const pad = 12;

      let x = clamp(rect.left, pad, window.innerWidth - tipRect.width - pad);
      let y = rect.bottom + 12;
      if(y + tipRect.height + pad > window.innerHeight){
        y = rect.top - tipRect.height - 12;
      }
      y = clamp(y, pad, window.innerHeight - tipRect.height - pad);

      tipEl.style.left = `${x}px`;
      tipEl.style.top = `${y}px`;
    }

    function onEnter(evt){
      const el = evt.target && evt.target.closest ? evt.target.closest('.evt') : null;
      if(!el || el === active) return;
      active = el;
      show(el);
    }

    function onLeave(evt){
      const rel = evt.relatedTarget;
      if(rel && active && active.contains(rel)) return;
      const insideTip = rel && tipEl.contains(rel);
      if(insideTip) return;
      hide();
    }

    wrap.addEventListener('mouseover', onEnter);
    wrap.addEventListener('mouseout', onLeave);
    wrap.addEventListener('focusin', onEnter);
    wrap.addEventListener('focusout', onLeave);
    window.addEventListener('scroll', hide, { passive: true });
    window.addEventListener('resize', hide);
    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') hide();
    });
  }

  init();
})();
