/* scripts da área do cliente (sem frameworks) */

(function(){
  function getConfig(){
    try{
      if(window.elaGetConfig) return window.elaGetConfig();
    }catch(e){}
    return window.ELA_CONFIG_DEFAULT || {};
  }

  function setSession(clientId){
    try{
      localStorage.setItem('ela_client_session', JSON.stringify({ id: String(clientId || ''), t: Date.now() }));
    }catch(e){}
  }

  function getSession(){
    try{ return JSON.parse(localStorage.getItem('ela_client_session') || 'null'); }
    catch(e){ return null; }
  }

  function clearSession(){
    try{ localStorage.removeItem('ela_client_session'); }catch(e){}
  }

  function normIg(v){
    return String(v || '').trim().toLowerCase().replace(/^@+/, '');
  }

  // ---------------------------------
  // 1) login
  // ---------------------------------
  function initLogin(){
    var form = document.querySelector('[data-ela-login]');
    if(!form) return;

    var msg = document.querySelector('[data-ela-login-msg]');
    var cfg = getConfig();
    var clients = (cfg && cfg.clients) ? cfg.clients : [];

    function setMsg(text){
      if(!msg) return;
      msg.textContent = (text || '').toLowerCase();
      msg.hidden = !msg.textContent;
    }

    form.addEventListener('submit', function(e){
      e.preventDefault();

      var igEl = form.querySelector('input[name="instagram"]');
      var pwEl = form.querySelector('input[name="password"]') || form.querySelector('input[name="senha"]');

      var ig = normIg((igEl || {}).value || '');
      var pw = String((pwEl || {}).value || '').trim().toLowerCase();

      var ok = null;
      for(var i=0; i<clients.length; i++){
        var c = clients[i] || {};
        var cIg = normIg(c.instagram || '');
        var cPw = String(c.password || '').trim().toLowerCase();
        if(ig === cIg && pw === cPw){ ok = c; break; }
      }

      if(!ok){
        setMsg('login inválido');
        return;
      }

      setMsg('');
      setSession(ok.id || '');
      window.location.href = String(ok.redirect || '/');
    });

    var logout = document.querySelector('[data-ela-logout]');
    if(logout){
      logout.addEventListener('click', function(e){
        e.preventDefault();
        clearSession();
        window.location.href = '/area-do-cliente/';
      });
    }
  }

  // ---------------------------------
  // 2) proteção de páginas
  // ---------------------------------
  function initAuthGate(){
    var requires = document.body ? document.body.getAttribute('data-ela-requires-auth') : null;
    if(requires !== '1') return;

    var sess = getSession();
    if(!sess || !sess.id){
      window.location.replace('/area-do-cliente/');
      return;
    }

    var expected = document.body.getAttribute('data-ela-client-id') || document.body.getAttribute('data-ela-client') || '';
    if(expected && String(expected) !== String(sess.id)){
      window.location.replace('/area-do-cliente/');
    }
  }

  // ---------------------------------
  // 3) tela cheia
  // ---------------------------------
  function initFullscreen(){
    var btn = document.querySelector('[data-ela-fullscreen]');
    if(!btn) return;

    var sel = btn.getAttribute('data-ela-fullscreen') || '';
    var target = sel ? document.querySelector(sel) : null;

    btn.addEventListener('click', function(e){
      e.preventDefault();

      if(target && target.requestFullscreen){
        try{ target.requestFullscreen(); return; }catch(err){}
      }

      var url = new URL(window.location.href);
      url.searchParams.set('tela', 'cheia');
      window.open(url.toString(), '_blank', 'noopener');
    });

    // modo full via query param
    try{
      var qs = new URLSearchParams(window.location.search);
      if(qs.get('tela') === 'cheia'){
        document.documentElement.classList.add('clientFull');
      }
    }catch(e){}
  }

  // ---------------------------------
  // 4) calendário simples (mês fixo ou via data-ela-month)
  // ---------------------------------
  function pad2(n){ return String(n).padStart(2,'0'); }

  function buildCalendar(root, ym, events){
    var parts = String(ym || '').split('-');
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if(!y || !m) return;

    var first = new Date(y, m-1, 1);
    var startDay = first.getDay();
    // semana começando domingo (0)
    var daysInMonth = new Date(y, m, 0).getDate();

    var monthNames = ['janeiro','fevereiro','março','abril','maio','junho','julho','agosto','setembro','outubro','novembro','dezembro'];
    var label = monthNames[m-1] || '';

    var evMap = {};
    (events || []).forEach(function(ev){
      var d = String(ev.date || '').trim();
      if(!d) return;
      if(!evMap[d]) evMap[d] = [];
      evMap[d].push(ev);
    });

    var html = '';
    html += '<div class="calHeader">';
    html += '<div class="calHeader__title">' + label + '</div>';
    html += '</div>';

    html += '<div class="calGrid" role="grid" aria-label="calendário mensal">';
    var dayLabels = ['dom','seg','ter','qua','qui','sex','sáb'];
    for(var i=0; i<7; i++){
      html += '<div class="calDow" role="columnheader">' + dayLabels[i] + '</div>';
    }

    var cells = 42; // 6 linhas
    for(var c=0; c<cells; c++){
      var dayNum = c - startDay + 1;
      var inMonth = dayNum >= 1 && dayNum <= daysInMonth;
      var dateStr = inMonth ? (y + '-' + pad2(m) + '-' + pad2(dayNum)) : '';

      html += '<div class="calCell' + (inMonth ? '' : ' is-out') + '" role="gridcell">';
      html += '<div class="calDay">' + (inMonth ? dayNum : '') + '</div>';

      if(inMonth && evMap[dateStr]){
        evMap[dateStr].slice(0,3).forEach(function(ev){
          var title = String(ev.title || '').toLowerCase();
          var tip = String(ev.tooltip || '').toLowerCase();
          var col = String(ev.color || '#cd0005');
          html += '<div class="calEvent" style="background:' + col + '" title="' + tip.replace(/\"/g,'&quot;') + '">' + title + '</div>';
        });
      }

      html += '</div>';
    }

    html += '</div>';
    root.innerHTML = html;
  }

  function initCalendar(){
    var root = document.querySelector('[data-ela-calendar]');
    if(!root) return;

    var ym = root.getAttribute('data-ela-month') || '';
    if(!ym){
      var d = new Date();
      ym = d.getFullYear() + '-' + pad2(d.getMonth()+1);
    }

    var clientId = document.body.getAttribute('data-ela-client-id') || document.body.getAttribute('data-ela-client') || 'jescri';
    var url = '/data/calendario-' + String(clientId) + '.json';

    fetch(url, { cache: 'no-store' })
      .then(function(r){ return r.ok ? r.json() : { events: [] }; })
      .then(function(data){ buildCalendar(root, ym, (data || {}).events || []); })
      .catch(function(){ buildCalendar(root, ym, []); });
  }

  // init
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', function(){
      initLogin();
      initAuthGate();
      initFullscreen();
      initCalendar();
    });
  }else{
    initLogin();
    initAuthGate();
    initFullscreen();
    initCalendar();
  }
})();
