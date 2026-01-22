(function(){
  const wrap = document.getElementById('calWrap');
  const loading = document.getElementById('calLoading');
  const root = document.querySelector('.cal');

  if(!wrap || !root) return;

  const VIEW = root.getAttribute('data-view') || 'semestral';
  const MONTH_ONLY = parseInt(root.getAttribute('data-month') || '', 10);

  const TYPE_CLASS = {
    'lançamento': 'lancamento',
    'lancamento': 'lancamento',
    'comercial': 'comercial',
    'pagamento': 'pagamento',
    'awareness': 'awareness'
  };

  const TYPE_DOT = {
    'lancamento': '#f2c1c8',
    'comercial': '#b8f2ff',
    'pagamento': '#c8f7c5',
    'awareness': '#ffe8a3'
  };

  const MONTHS = [
    '', 'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
  ];

  const DOW = ['seg', 'ter', 'qua', 'qui', 'sex', 'sáb', 'dom'];

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
        ttl.textContent = String(evt.evento || '').trim();

        const meta = document.createElement('span');
        meta.className = 'evt__meta';

        const rangeTxt = evt.end ? formatRange(evt.periodo) : '';
        const labelBits = [];
        labelBits.push(String(evt.tipo || '').toLowerCase());
        if(rangeTxt) labelBits.push(rangeTxt);
        meta.textContent = labelBits.filter(Boolean).join(' · ');

        const tip = document.createElement('div');
        tip.className = 'tip';
        const strong = document.createElement('strong');
        strong.textContent = 'por que impacta';
        const p = document.createElement('div');
        p.textContent = String(evt.impacto || '').trim() || 'sem observações no momento.';
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

  function filterByView(events){
    // range fixo: fev a jul de 2026
    const start = new Date(2026,1,1);
    const end = new Date(2026,6,31);

    const out = [];
    events.forEach(e => {
      const d = parseISODate(e.start);
      if(!d) return;
      if(d < start || d > end) return;
      if(VIEW === 'mensal' && MONTH_ONLY){
        if(d.getMonth() !== MONTH_ONLY-1) return;
      }
      out.push(e);
    });
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
      const res = await fetch('./eventos-semestral-2026.json', { cache: 'no-cache' });
      const data = await res.json();
      const events = filterByView(data.events || []);
      const eventsByDay = groupByDay(events);

      const monthsToRender = VIEW === 'mensal' && MONTH_ONLY
        ? [MONTH_ONLY]
        : [2,3,4,5,6,7];

      wrap.innerHTML = '';
      monthsToRender.forEach(m => {
        const monthEl = buildMonth(2026, m, eventsByDay);
        wrap.appendChild(monthEl);
      });

    }catch(err){
      wrap.innerHTML = '<div class="cal__loading">não foi possível carregar o calendário.</div>';
    }finally{
      if(loading) loading.remove();
    }
  }

  init();
})();
