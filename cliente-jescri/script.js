(() => {
  'use strict';

  // auth simples por sessionStorage
  const SESSION_KEY = 'ela_client_session_v1';

  function readSession(){
    try{
      const raw = sessionStorage.getItem(SESSION_KEY);
      if(!raw) return null;
      return JSON.parse(raw);
    }catch(e){
      return null;
    }
  }

  function isValidSession(sess){
    if(!sess) return false;
    if(!sess.clientId) return false;
    if(!sess.createdAt) return false;
    return true;
  }

  async function injectClientLogo(){
    const targets = Array.from(document.querySelectorAll('[data-client-logo]'));
    if(!targets.length) return;

    const url = '/cliente-jescri/assets/logo-jescri.svg';
    let svgText = '';
    try{
      const res = await fetch(url, { cache: 'force-cache' });
      svgText = await res.text();
    }catch(e){
      return;
    }

    targets.forEach((el) => {
      el.innerHTML = svgText;
      const svg = el.querySelector('svg');
      if(svg){
        svg.setAttribute('aria-hidden', 'true');
        svg.setAttribute('focusable', 'false');
        svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

        // remove possíveis retângulos de fundo (evita bloco sólido)
        svg.querySelectorAll('rect').forEach((r) => {
          const fill = String(r.getAttribute('fill') || '').trim().toLowerCase();
          const w = parseFloat(r.getAttribute('width') || '0');
          const h = parseFloat(r.getAttribute('height') || '0');
          if(!fill || fill === 'none') return;
          // se for um retângulo grande, tratamos como fundo
          if(w >= 80 && h >= 30){
            r.setAttribute('fill', 'none');
            r.style.fill = 'none';
          }
        });
      }
    });
  }

  // menu accordion (subitens só abrem ao clicar no item principal)
  function initMenu(){
    const menu = document.querySelector('.menuGrid');
    if(!menu) return;

    const cols = Array.from(menu.querySelectorAll('.menuCol'));

    function closeAll(){
      cols.forEach((col) => {
        col.classList.remove('is-open');
        const btn = col.querySelector('.menuCol__title');
        if(btn) btn.setAttribute('aria-expanded', 'false');
      });
    }

    cols.forEach((col) => {
      const btn = col.querySelector('.menuCol__title');
      if(!btn) return;

      btn.addEventListener('click', () => {
        const isOpen = col.classList.contains('is-open');
        closeAll();
        if(!isOpen){
          col.classList.add('is-open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    // ao clicar em qualquer link, recolhe
    menu.addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if(!a) return;
      closeAll();
    });

    // inicia fechado
    closeAll();
  }

  function guardClient(){
    // páginas públicas não devem redirecionar
    const isClientArea = document.body && document.body.getAttribute('data-client-area') === 'true';
    if(!isClientArea) return;

    const sess = readSession();
    if(!isValidSession(sess)){
      window.location.href = '/area-do-cliente/';
      return;
    }

    // por enquanto: apenas jescri
    if(sess.clientId !== 'jescri'){
      window.location.href = '/area-do-cliente/';
      return;
    }
  }

  guardClient();
  initMenu();
  injectClientLogo();
})();
