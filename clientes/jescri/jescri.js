/* jescri pages
   - calendário mensal (json)
   - ativações do mês (csv)
*/
(function () {
  const api = window.elaClients;
  if (!api) return;

  const cfg = api.cfg || (window.elaGetConfig ? window.elaGetConfig() : null);
  const jescri = cfg && cfg.clients ? cfg.clients.jescri : null;

  const $ = (sel) => document.querySelector(sel);

  const safeJsonParse = (s) => {
    try { return JSON.parse(s); } catch (e) { return null; }
  };

  const hashColor = (str) => {
    const s = String(str || '');
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
    const palette = ['#cd0005', '#8c0003', '#ff3b30', '#c40085', '#6b2d5c', '#a50000'];
    return palette[h % palette.length];
  };

  // -----------------------------
  // calendário mensal (json)
  // -----------------------------
  const monthMount = $('#ela-calendar-month');
  if (monthMount) {
    const year = Number(monthMount.getAttribute('data-year') || '2026');
    const month = Number(monthMount.getAttribute('data-month') || '0'); // 0-11

    const url = (jescri && jescri.calendarJson) ? String(jescri.calendarJson) : '/data/calendario-jescri.json';
    const override = safeJsonParse(localStorage.getItem('ela_calendar_override_jescri') || '');

    fetch(url, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('calendar json not found'))))
      .then((raw) => {
        const merged = raw && raw.events ? raw : { events: [] };
        if (override && override.events && Array.isArray(override.events)) {
          merged.events = override.events;
        }

        const byDate = {};
        (merged.events || []).forEach((ev) => {
          const d = api.parseBrDateTime(ev.date || ev.data || '');
          const key = d ? api.toDateKey(d) : String(ev.date || '').trim();
          if (!key) return;

          if (!byDate[key]) byDate[key] = [];
          byDate[key].push({
            title: String(ev.title || ev.titulo || '').toLowerCase(),
            tooltip: String(ev.tooltip || ev.descricao || '').toLowerCase(),
            color: ev.color || ev.cor || '#cd0005'
          });
        });

        const label = (['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][month] || 'mês') + ' ' + year;
        api.renderMonth(monthMount, year, month, byDate, label);
      })
      .catch(() => {
        api.renderMonth(monthMount, year, month, {}, 'fevereiro 2026');
      });
  }

  // -----------------------------
  // ativações do mês (csv)
  // -----------------------------
  const actMount = $('#ela-activations-month');
  const actStatus = $('#ela-activations-status');
  const prevBtn = $('#ela-prev-month');
  const nextBtn = $('#ela-next-month');

  if (actMount) {
    let view = new Date();
    view = new Date(view.getFullYear(), view.getMonth(), 1);

    const setLabel = () => {
      const labelEl = document.querySelector('[data-month-label]');
      if (!labelEl) return;
      const m = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'][view.getMonth()];
      labelEl.textContent = (m + ' ' + view.getFullYear()).toLowerCase();
    };

    const guessColumn = (headers, patterns) => {
      const h = headers.map((x) => String(x || '').toLowerCase());
      for (let i = 0; i < h.length; i++) {
        const name = h[i];
        for (const p of patterns) {
          if (p.test(name)) return headers[i];
        }
      }
      return null;
    };

    const render = (items) => {
      const byDate = {};
      items.forEach((it) => {
        const key = api.toDateKey(it.date);
        if (!byDate[key]) byDate[key] = [];
        const title = `${it.name} ${it.time}`.trim().toLowerCase();
        byDate[key].push({
          title,
          tooltip: it.type.toLowerCase(),
          color: it.color
        });
      });

      api.renderMonth(actMount, view.getFullYear(), view.getMonth(), byDate, null);
    };

    const loadCsv = () => {
      setLabel();
      if (actStatus) actStatus.textContent = 'carregando ativações...';

      const url = (jescri && jescri.activationsCsv) ? String(jescri.activationsCsv) : '';
      if (!url) {
        if (actStatus) actStatus.textContent = 'fonte de dados não configurada';
        render([]);
        return;
      }

      fetch(url, { cache: 'no-store' })
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error('csv not found'))))
        .then((txt) => {
          const rows = api.parseCSV(txt);
          if (rows.length < 2) throw new Error('csv vazio');

          const headers = rows[0];
          const data = api.rowsToObjects(rows);

          const colName = guessColumn(headers, [/influenciadora/, /influencer/, /creator/, /nome/]);
          const colType = guessColumn(headers, [/tipo/, /formato/, /conte[uú]do/]);

          // data e hora podem vir juntos ou separados
          const colDateTime = guessColumn(headers, [/data.*ativ/, /data\s*e\s*hora/, /^data$/]);
          const colDate = guessColumn(headers, [/^data$/, /data\s*da\s*ativa/]);
          const colTime = guessColumn(headers, [/hora/, /horário/]);

          const monthY = view.getFullYear();
          const monthM = view.getMonth();

          const items = [];
          data.forEach((r) => {
            const name = String(r[colName] || '').trim();
            const type = String(r[colType] || '').trim() || 'ativação';
            const rawDT = colDateTime ? r[colDateTime] : '';
            const rawD = colDate ? r[colDate] : '';
            const rawT = colTime ? r[colTime] : '';

            let d = api.parseBrDateTime(rawDT);
            if (!d && rawD) {
              d = api.parseBrDateTime(rawD + (rawT ? ' ' + rawT : ''));
            }
            if (!d || isNaN(d.getTime())) return;

            if (d.getFullYear() !== monthY || d.getMonth() !== monthM) return;

            items.push({
              name: name || 'influenciadora',
              time: api.formatTime(d),
              type: type || 'ativação',
              date: d,
              color: hashColor(name || type)
            });
          });

          // ordena por data/hora
          items.sort((a, b) => a.date.getTime() - b.date.getTime());

          render(items);

          if (actStatus) actStatus.textContent = items.length ? `${items.length} ativações encontradas` : 'nenhuma ativação para este mês';
        })
        .catch(() => {
          render([]);
          if (actStatus) actStatus.textContent = 'não foi possível carregar a planilha de ativações';
        });
    };

    if (prevBtn) prevBtn.addEventListener('click', () => {
      view = new Date(view.getFullYear(), view.getMonth() - 1, 1);
      loadCsv();
    });

    if (nextBtn) nextBtn.addEventListener('click', () => {
      view = new Date(view.getFullYear(), view.getMonth() + 1, 1);
      loadCsv();
    });

    loadCsv();
  }
})();
