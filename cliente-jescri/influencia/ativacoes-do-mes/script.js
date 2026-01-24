/* ativações do mês (dados via csv publicado) */

(function(){
  const cfg = (window.elaGetConfig ? window.elaGetConfig() : window.ELA_CONFIG_DEFAULT) || {};

  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBp1ORyL7U0f1PJNho0_vrsJjoXjSCU1O1-p_BzlAjL6ggO7LktE0se1DtjeITVc1h2RmXWaodhhWU/pub?output=csv';

  const loading = document.getElementById('loading');
  const monthsEl = document.getElementById('months');
  const calRoot = document.getElementById('cal');
  if(!monthsEl || !calRoot) return;

  const MONTHS = ['', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  const DOW = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

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
      if(ch === ',' && !inQ){ out.push(cur); cur = ''; continue; }
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

  function parseDateTime(v){
    const s = String(v||'').trim();
    if(!s) return null;

    // dd/mm/yyyy hh:mm (ou só data)
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if(m){
      const dd = parseInt(m[1],10);
      const mm = parseInt(m[2],10);
      const yyyy = parseInt(m[3],10);
      const hh = parseInt(m[4] || '0',10);
      const mi = parseInt(m[5] || '0',10);
      return new Date(yyyy, mm-1, dd, hh, mi, 0, 0);
    }

    // yyyy-mm-dd hh:mm
    m = s.match(/^(\d{4})-(\d{2})-(\d{2})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if(m){
      const yyyy = parseInt(m[1],10);
      const mm = parseInt(m[2],10);
      const dd = parseInt(m[3],10);
      const hh = parseInt(m[4] || '0',10);
      const mi = parseInt(m[5] || '0',10);
      return new Date(yyyy, mm-1, dd, hh, mi, 0, 0);
    }

    return null;
  }

  function pad2(n){ return String(n).padStart(2, '0'); }

  function monthKey(y, m){ return `${y}-${pad2(m)}`; }

  function buildMonth(y, m, eventsByDay){
    const first = new Date(y, m-1, 1);
    const last = new Date(y, m, 0);
    const daysInMonth = last.getDate();
    const firstIdx = (first.getDay() + 6) % 7; // monday first

    const monthEl = document.createElement('section');
    monthEl.className = 'month';
    monthEl.setAttribute('data-month', monthKey(y,m));

    const head = document.createElement('div');
    head.className = 'month__head';

    const title = document.createElement('h1');
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

    const totalCells = Math.ceil((firstIdx + daysInMonth) / 7) * 7;

    for(let cell=0; cell<totalCells; cell++){
      const dayEl = document.createElement('div');
      dayEl.className = 'day';

      const dayNum = cell - firstIdx + 1;
      if(dayNum < 1 || dayNum > daysInMonth){
        dayEl.classList.add('is-empty');
        const n = document.createElement('div');
        n.className = 'day__num';
        n.textContent = '';
        dayEl.appendChild(n);
        grid.appendChild(dayEl);
        continue;
      }

      const n = document.createElement('div');
      n.className = 'day__num';
      n.textContent = String(dayNum);
      dayEl.appendChild(n);

      const list = document.createElement('div');
      list.className = 'evts';

      const key = `${y}-${pad2(m)}-${pad2(dayNum)}`;
      const evts = eventsByDay.get(key) || [];
      evts.sort((a,b) => (a.time || '').localeCompare(b.time || ''));

      evts.forEach((evt) => {
        const b = document.createElement('div');
        b.className = 'evt';

        const dot = document.createElement('div');
        dot.className = 'evt__dot';
        dot.style.background = evt.dot || 'rgba(255,255,255,0.7)';

        const wrap = document.createElement('div');

        const t = document.createElement('div');
        t.className = 'evt__title';
        t.textContent = evt.name;

        const meta = document.createElement('span');
        meta.className = 'evt__meta';
        meta.textContent = `${evt.time} • ${evt.type}`;

        wrap.appendChild(t);
        wrap.appendChild(meta);

        b.appendChild(dot);
        b.appendChild(wrap);
        list.appendChild(b);
      });

      dayEl.appendChild(list);
      grid.appendChild(dayEl);
    }

    monthEl.appendChild(head);
    monthEl.appendChild(dow);
    monthEl.appendChild(grid);

    return monthEl;
  }

  function typeDot(type){
    const t = stripAccents(String(type||'').toLowerCase());
    if(t.includes('reel')) return '#b8f2ff';
    if(t.includes('stories')) return '#ffe8a3';
    if(t.includes('carrossel')) return '#f2c1c8';
    return '#c8f7c5';
  }

  async function init(){
    if(loading) loading.style.display = 'block';

    let text = '';
    try{
      const res = await fetch(CSV_URL, { cache: 'no-store' });
      text = await res.text();
    }catch(e){
      if(loading) loading.textContent = 'não foi possível carregar os dados.';
      return;
    }

    const { rows } = csvToRows(text);

    const events = [];
    rows.forEach((r) => {
      const name = String(r['coluna a'] || r['nome'] || r['a'] || r['name'] || '').trim();
      const dtRaw = String(r['coluna e'] || r['data + hora'] || r['data e hora'] || r['e'] || r['datetime'] || '').trim();
      const type = String(r['coluna f'] || r['tipo'] || r['f'] || '').trim();
      if(!name || !dtRaw) return;
      const dt = parseDateTime(dtRaw);
      if(!dt) return;

      events.push({
        name: name.toLowerCase(),
        type: (type || '').toLowerCase(),
        dt
      });
    });

    if(!events.length){
      if(loading) loading.textContent = 'sem ativações no csv.';
      return;
    }

    // escolhe o mês mais recente presente nos dados
    events.sort((a,b) => a.dt - b.dt);
    const last = events[events.length-1].dt;
    const y = last.getFullYear();
    const m = last.getMonth() + 1;

    const eventsByDay = new Map();
    events.filter(e => e.dt.getFullYear() === y && (e.dt.getMonth()+1) === m).forEach((e) => {
      const key = `${y}-${pad2(m)}-${pad2(e.dt.getDate())}`;
      if(!eventsByDay.has(key)) eventsByDay.set(key, []);
      eventsByDay.get(key).push({
        name: e.name,
        time: `${pad2(e.dt.getHours())}:${pad2(e.dt.getMinutes())}`,
        type: e.type,
        dot: typeDot(e.type)
      });
    });

    monthsEl.innerHTML = '';
    monthsEl.appendChild(buildMonth(y, m, eventsByDay));

    if(loading) loading.style.display = 'none';
  }

  init();
})();
