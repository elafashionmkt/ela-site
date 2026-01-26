(() => {
  'use strict';

  const root = document.getElementById('ativacoesRoot');
  if(!root) return;

  const monthLabel = root.querySelector('[data-month-label]');
  const gridHost = root.querySelector('[data-grid]');
  const loadingEl = root.querySelector('[data-loading]');
  const emptyEl = root.querySelector('[data-empty]');

  // aba: datas (gid fixo)
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBp1ORyL7U0f1PJNho0_vrsJjoXjSCU1O1-p_BzlAjL6ggO7LktE0se1DtjeITVc1h2RmXWaodhhWU/pub?gid=1397300240&single=true&output=csv';

  const MONTHS = [
    'janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'
  ];

  const DOW = ['seg','ter','qua','qui','sex','sáb','dom'];

  function pad2(n){ return String(n).padStart(2,'0'); }

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

  function normalizeVisibleText(v){
    return String(v || '')
      .replace(/—/g, '-')
      .trim()
      .toLowerCase();
  }

  function parseDateTime(raw){
    const s = String(raw || '').trim();
    if(!s) return null;

    // dd/mm/yyyy hh:mm(:ss) (ou só data)
    let m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/);
    if(m){
      const dd = parseInt(m[1],10);
      const mm = parseInt(m[2],10);
      const yyyy = parseInt(m[3],10);
      const hh = m[4] != null ? parseInt(m[4],10) : 0;
      const min = m[5] != null ? parseInt(m[5],10) : 0;
      const ss = m[6] != null ? parseInt(m[6],10) : 0;
      return new Date(yyyy, mm-1, dd, hh, min, ss);
    }

    // iso fallback
    const d = new Date(s);
    if(isNaN(d.getTime())) return null;
    return d;
  }

  function mondayFirstIndex(d){
    // js: 0 dom..6 sáb
    return (d.getDay() + 6) % 7;
  }

  function buildGrid(year, month, itemsByDay){
    const first = new Date(year, month, 1);
    const last = new Date(year, month+1, 0);
    const daysInMonth = last.getDate();

    const grid = document.createElement('div');
    grid.className = 'calGrid';

    const dow = document.createElement('div');
    dow.className = 'calDow';
    DOW.forEach(t => {
      const el = document.createElement('div');
      el.className = 'calDow__item';
      el.textContent = t;
      dow.appendChild(el);
    });

    const cells = document.createElement('div');
    cells.className = 'calCells';

    // blanks
    const firstIdx = mondayFirstIndex(first);
    for(let i=0;i<firstIdx;i++){
      const cell = document.createElement('div');
      cell.className = 'calDay is-empty';
      cells.appendChild(cell);
    }

    for(let day=1; day<=daysInMonth; day++){
      const cell = document.createElement('div');
      cell.className = 'calDay';

      const num = document.createElement('div');
      num.className = 'calDay__num';
      num.textContent = String(day);
      cell.appendChild(num);

      const list = document.createElement('div');
      list.className = 'calDay__events';

      const key = `${year}-${pad2(month+1)}-${pad2(day)}`;
      const items = itemsByDay.get(key) || [];

      items.forEach((it) => {
        const evt = document.createElement('div');
        evt.className = 'calEvt';

        const t1 = document.createElement('div');
        t1.className = 'calEvt__title';
        t1.textContent = normalizeVisibleText(it.nome);

        const meta = document.createElement('div');
        meta.className = 'calEvt__meta';

        const time = it.hora ? it.hora : '';
        const tipo = normalizeVisibleText(it.tipo);
        const metaBits = [];
        if(time) metaBits.push(time);
        if(tipo) metaBits.push(tipo);

        meta.textContent = metaBits.join(' · ');

        evt.appendChild(t1);
        evt.appendChild(meta);
        list.appendChild(evt);
      });

      cell.appendChild(list);
      cells.appendChild(cell);
    }

    grid.appendChild(dow);
    grid.appendChild(cells);
    return grid;
  }

  function setLoading(v){
    if(loadingEl) loadingEl.style.display = v ? 'block' : 'none';
  }

  function setEmpty(v){
    if(emptyEl) emptyEl.style.display = v ? 'block' : 'none';
  }

  async function fetchCsv(){
    const res = await fetch(CSV_URL, { cache: 'no-store' });
    if(!res.ok) throw new Error('csv fetch failed');
    return res.text();
  }

  function groupItems(rows, targetYear, targetMonth){
    const map = new Map();

    rows.forEach((r) => {
      // mapeamento fixo: coluna a (nome), e (data+hora), f (tipo)
      // como estamos lendo csv, usamos índice real via headers quando existir, mas mantemos fallback
      const keys = Object.keys(r);

      // tenta por header “a” etc caso exista (alguns csvs trazem headers reais)
      const nome = r['a'] || r['nome'] || r['influenciadora'] || r[keys[0]] || '';
      const dtRaw = r['e'] || r['data'] || r['data e hora'] || r['data+hora'] || r[keys[4]] || '';
      const tipo = r['f'] || r['tipo'] || r[keys[5]] || '';

      const dt = parseDateTime(dtRaw);
      if(!dt) return;

      if(dt.getFullYear() !== targetYear) return;
      if(dt.getMonth() !== targetMonth) return;

      const key = `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
      if(!map.has(key)) map.set(key, []);
      map.get(key).push({
        nome: normalizeVisibleText(nome),
        tipo: normalizeVisibleText(tipo),
        hora: `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`
      });
    });

    // ordena eventos do dia por hora, depois nome
    for(const [k, list] of map.entries()){
      list.sort((a,b) => {
        if(a.hora < b.hora) return -1;
        if(a.hora > b.hora) return 1;
        return a.nome.localeCompare(b.nome, 'pt-BR');
      });
    }

    return map;
  }

  async function init(){
    try{
      setLoading(true);
      setEmpty(false);

      const now = new Date();
      const y = now.getFullYear();
      const m = now.getMonth();

      if(monthLabel){
        monthLabel.textContent = `${MONTHS[m]} ${y}`;
      }

      const csvText = await fetchCsv();
      const { rows } = csvToRows(csvText);

      const itemsByDay = groupItems(rows, y, m);

      if(gridHost) gridHost.innerHTML = '';
      if(itemsByDay.size === 0){
        setEmpty(true);
        return;
      }

      const grid = buildGrid(y, m, itemsByDay);
      if(gridHost) gridHost.appendChild(grid);
    }catch(err){
      setEmpty(true);
    }finally{
      setLoading(false);
    }
  }

  init();
})();
