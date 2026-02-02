/* ativações do mês (js puro)
   - fonte: csv publicado (aba datas) + fallback local
   - mapeamento: col a (influenciadora) | col e (data + hora) | col f (tipo)
   - exibição: nome + "hh:mm tipo" (sem travessão)
   - mês: prioriza mês atual; se vazio, usa o mês mais recente com eventos
*/

(function(){
  'use strict';

  const root = document.querySelector('[data-ativacoes-root]');
  if(!root) return;

  const titleEl = document.getElementById('ativacoesTitle');
  const loadingEl = root.querySelector('[data-loading]');
  const emptyEl = root.querySelector('[data-empty]');
  const gridHost = root.querySelector('[data-grid]');

  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBp1ORyL7U0f1PJNho0_vrsJjoXjSCU1O1-p_BzlAjL6ggO7LktE0se1DtjeITVc1h2RmXWaodhhWU/pub?gid=1397300240&single=true&output=csv';
  const FALLBACK_JSON = '/clientes/jescri/influencia/ativacoes-do-mes/ativacoes-fallback.json';

  const MONTHS = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
  const DOW = ['seg','ter','qua','qui','sex','sáb','dom'];

  function pad2(n){ return String(n).padStart(2,'0'); }

  function stripAccents(s){
    try{ return (s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,''); }catch(e){ return (s||''); }
  }

  function normalizeText(v){
    return String(v||'').replace(/[--]/g,'-').trim().toLowerCase();
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
      if(ch === ',' && !inQ){ out.push(cur); cur=''; continue; }
      cur += ch;
    }
    out.push(cur);
    return out.map(v => (v||'').trim());
  }

  function csvToMatrix(text){
    const clean = String(text||'').replace(/^\uFEFF/, '');
    const lines = clean.split(/\r?\n/).filter(l => l.trim().length);
    return lines.map(csvParseLine);
  }

  function parsePtDateTime(raw){
    const s = String(raw||'').trim();
    if(!s) return null;
    const m = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if(m){
      const dd = parseInt(m[1],10);
      const mm = parseInt(m[2],10);
      const yyyy = parseInt(m[3],10);
      const hh = (m[4] != null) ? parseInt(m[4],10) : null;
      const mi = (m[5] != null) ? parseInt(m[5],10) : null;
      const d = new Date(yyyy, mm-1, dd, hh || 0, mi || 0, 0);
      d.__hasTime = (hh != null && mi != null);
      return d;
    }
    const d = new Date(s);
    if(isNaN(d.getTime())) return null;
    d.__hasTime = true;
    return d;
  }

  function mondayFirstIndex(d){ return (d.getDay()+6)%7; }

  function setLoading(v){ if(loadingEl) loadingEl.style.display = v ? 'block' : 'none'; }
  function setEmpty(v){ if(emptyEl) emptyEl.style.display = v ? 'block' : 'none'; }

  async function fetchText(url){
    const r = await fetch(url, { cache: 'no-store' });
    if(!r.ok) throw new Error('fetch failed');
    return r.text();
  }

  async function fetchJson(url){
    const r = await fetch(url, { cache: 'no-store' });
    if(!r.ok) throw new Error('fetch failed');
    return r.json();
  }

  async function loadRows(){
    try{
      const text = await fetchText(CSV_URL);
      const matrix = csvToMatrix(text);
      if(matrix.length < 2) return [];

      // mapeamento obrigatório por posição, mas também tenta headers
      const headers = matrix[0].map(h => stripAccents(String(h||'').toLowerCase()));
      return matrix.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h,i) => { obj[h] = row[i] != null ? row[i] : ''; });
        obj.a = row[0] != null ? row[0] : '';
        obj.e = row[4] != null ? row[4] : '';
        obj.f = row[5] != null ? row[5] : '';
        return obj;
      });
    }catch(e){
      try{
        const fb = await fetchJson(FALLBACK_JSON);
        return Array.isArray(fb) ? fb : [];
      }catch(_e){
        return [];
      }
    }
  }

  function extractItem(r){
    const nome = r.a || r['influenciadora'] || r['nome'] || '';
    const dtRaw = r.e || r['data + hora'] || r['data e hora'] || r['data'] || '';
    const tipo = r.f || r['tipo'] || '';

    const dt = parsePtDateTime(dtRaw);
    if(!dt) return null;

    const key = `${dt.getFullYear()}-${pad2(dt.getMonth()+1)}-${pad2(dt.getDate())}`;
    return {
      nome: normalizeText(nome),
      tipo: normalizeText(tipo),
      dt,
      _dayKey: key
    };
  }

  function pickTargetMonth(items){
    if(!items.length) return null;

    const now = new Date();
    const curKey = `${now.getFullYear()}-${pad2(now.getMonth()+1)}`;

    const monthKeys = new Set(items.map(it => `${it.dt.getFullYear()}-${pad2(it.dt.getMonth()+1)}`));

    if(monthKeys.has(curKey)){
      return { year: now.getFullYear(), month: now.getMonth() };
    }

    let best = null;
    monthKeys.forEach((k) => { if(!best || k > best) best = k; });
    if(!best) return null;

    const [y,m] = best.split('-');
    return { year: parseInt(y,10), month: parseInt(m,10)-1 };
  }

  // tooltip global (mesmo estilo do calendário mensal)
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

  function positionTip(anchor, tipEl){
    const r = anchor.getBoundingClientRect();
    const margin = 10;

    tipEl.style.left = '0px';
    tipEl.style.top = '0px';
    const tr = tipEl.getBoundingClientRect();

    let left = r.left;
    let top = r.bottom + margin;

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

  function showTip(evtEl, tipEl){
    const raw = evtEl.querySelector('.tip');
    if(!raw) return;

    const title = (raw.querySelector('.tip__title')?.textContent || '').trim();
    const meta = (raw.querySelector('.tip__meta')?.textContent || '').trim();
    const body = raw.querySelector('.tip__body')?.innerHTML || '';

    tipEl.querySelector('.calTip__title').textContent = title;
    tipEl.querySelector('.calTip__meta').textContent = meta;
    tipEl.querySelector('.calTip__body').innerHTML = body;

    tipEl.classList.add('is-visible');
    tipEl.setAttribute('aria-hidden', 'false');
    positionTip(evtEl, tipEl);
  }

  function hideTip(tipEl){
    tipEl.classList.remove('is-visible');
    tipEl.setAttribute('aria-hidden', 'true');
  }

  function escapeHtml(str){
    return String(str||'')
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#039;');
  }

  function buildMonthGrid(year, month, items){
    const first = new Date(year, month, 1);
    const last = new Date(year, month+1, 0);
    const daysInMonth = last.getDate();

    const byDay = new Map();
    items.forEach((it) => {
      if(it.dt.getFullYear() !== year) return;
      if(it.dt.getMonth() !== month) return;
      const k = it._dayKey;
      if(!byDay.has(k)) byDay.set(k, []);
      byDay.get(k).push(it);
    });

    // ordena por horário
    for(const [k, list] of byDay.entries()){
      list.sort((a,b) => a.dt.getTime() - b.dt.getTime());
      byDay.set(k, list);
    }

    const monthEl = document.createElement('section');
    monthEl.className = 'month';

    const head = document.createElement('div');
    head.className = 'month__head';

    const h2 = document.createElement('h2');
    h2.className = 'month__title';
    h2.textContent = MONTHS[month];

    const range = document.createElement('div');
    range.className = 'month__range';
    range.textContent = `mês ${MONTHS[month]} ${year}`;

    head.appendChild(h2);
    head.appendChild(range);
    monthEl.appendChild(head);

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
    for(let i=0;i<blanks;i++){
      const empty = document.createElement('div');
      empty.className = 'day is-empty';
      grid.appendChild(empty);
    }

    for(let day=1; day<=daysInMonth; day++){
      const cellDate = new Date(year, month, day);
      const key = `${year}-${pad2(month+1)}-${pad2(day)}`;

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

        const dot = document.createElement('span');
        dot.className = 'evt__dot';

        const textWrap = document.createElement('div');

        const t = document.createElement('div');
        t.className = 'evt__title';
        t.textContent = it.nome;

        const meta = document.createElement('div');
        meta.className = 'evt__meta';

        const hora = it.dt.__hasTime ? `${pad2(it.dt.getHours())}:${pad2(it.dt.getMinutes())}` : '';
        const bits = [hora, it.tipo].filter(Boolean);
        meta.textContent = bits.join(' ');

        const tip = document.createElement('div');
        tip.className = 'tip';
        tip.innerHTML = `<div class="tip__title">${escapeHtml(it.nome)}</div><div class="tip__meta">${escapeHtml(MONTHS[cellDate.getMonth()])} ${escapeHtml(String(cellDate.getFullYear()))}</div><div class="tip__body">${escapeHtml(bits.join(' '))}</div>`;

        textWrap.appendChild(t);
        textWrap.appendChild(meta);

        evt.appendChild(dot);
        evt.appendChild(textWrap);
        evt.appendChild(tip);

        list.appendChild(evt);
      });

      cell.appendChild(list);
      grid.appendChild(cell);
    }

    monthEl.appendChild(grid);
    return monthEl;
  }

  async function init(){
    setLoading(true);
    setEmpty(false);

    const rows = await loadRows();
    const items = rows.map(extractItem).filter(Boolean);

    if(!items.length){
      setEmpty(true);
      setLoading(false);
      return;
    }

    const target = pickTargetMonth(items);
    if(!target){
      setEmpty(true);
      setLoading(false);
      return;
    }

    if(titleEl){
      titleEl.textContent = `ativações de ${MONTHS[target.month]} ${target.year}`;
    }

    if(gridHost){
      gridHost.innerHTML = '';
      gridHost.appendChild(buildMonthGrid(target.year, target.month, items));
    }

    // tooltip
    const tipEl = ensureTip();
    let active = null;

    const evts = Array.from(root.querySelectorAll('.evt'));
    evts.forEach((el) => {
      el.addEventListener('mouseenter', () => { active = el; showTip(el, tipEl); });
      el.addEventListener('mouseleave', () => { active = null; hideTip(tipEl); });
      el.addEventListener('focus', () => { active = el; showTip(el, tipEl); });
      el.addEventListener('blur', () => { active = null; hideTip(tipEl); });
    });

    window.addEventListener('scroll', () => { if(active) positionTip(active, tipEl); }, { passive: true });
    window.addEventListener('resize', () => { if(active) positionTip(active, tipEl); });

    setLoading(false);
  }

  init();
})();
