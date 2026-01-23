(function(){
  const CSV_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRBp1ORyL7U0f1PJNho0_vrsJjoXjSCU1O1-p_BzlAjL6ggO7LktE0se1DtjeITVc1h2RmXWaodhhWU/pub?output=csv';

  const wrap = document.getElementById('calWrap');
  const loading = document.getElementById('calLoading');

  const VIEW_YEAR = 2026;
  const VIEW_MONTH = 2; // fevereiro

  function escapeCell(v){
    return String(v || '').trim();
  }

  function parseCSV(text){
    const rows = [];
    let cur = [];
    let cell = '';
    let q = false;

    for(let i=0;i<text.length;i++){
      const ch = text[i];
      const nx = text[i+1];

      if(q){
        if(ch === '"' && nx === '"'){
          cell += '"';
          i++;
          continue;
        }
        if(ch === '"'){
          q = false;
          continue;
        }
        cell += ch;
        continue;
      }

      if(ch === '"'){
        q = true;
        continue;
      }

      if(ch === ','){
        cur.push(cell);
        cell = '';
        continue;
      }

      if(ch === '\n'){
        cur.push(cell);
        rows.push(cur);
        cur = [];
        cell = '';
        continue;
      }

      if(ch === '\r') continue;
      cell += ch;
    }

    if(cell.length || cur.length){
      cur.push(cell);
      rows.push(cur);
    }

    return rows;
  }

  function parseDateTime(raw){
    const v = escapeCell(raw);
    if(!v) return null;

    // tenta formatos comuns: dd/mm/yyyy hh:mm | yyyy-mm-dd hh:mm
    const m1 = v.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})(?:\s+(\d{1,2}):(\d{2}))?$/);
    if(m1){
      const d = int(m1[1]);
      const mo = int(m1[2]);
      const y = int(m1[3]);
      const h = int(m1[4] or '0');
    }
  }
})();
