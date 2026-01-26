/* área do cliente (js puro) */

(function(){
  'use strict';

  const SESSION_KEY = 'ela_auth_session_v1';

  function readSession(){
    try{ return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null'); }catch(e){ return null; }
  }

  function isValidSession(session, clientId){
    if(!session || typeof session !== 'object') return false;
    if(session.clientId !== clientId) return false;
    if(!session.expiresAt || typeof session.expiresAt !== 'number') return false;
    return Date.now() < session.expiresAt;
  }

  // guard
  const sess = readSession();
  if(!isValidSession(sess, 'jescri')){
    const next = encodeURIComponent(window.location.pathname || '/cliente-jescri/');
    window.location.replace(`/area-do-cliente/?next=${next}`);
    return;
  }

  // -----------------------------
  // topo + menu do cliente (injetado para manter consistência em /cliente-jescri/*)
  // -----------------------------
  function injectClientTop(){
    const mounts = Array.from(document.querySelectorAll('[data-client-top]'));
    if(!mounts.length) return;

    const html = `
      <header class="clientTop" aria-label="topo da área do cliente">
        <div class="clientTop__bar">
          <div class="container clientTop__barInner">
            <div class="clientTop__title">área do cliente</div>
            <div class="clientTop__logo" data-client-logo role="img" aria-label="jescri"></div>
          </div>
        </div>

        <div class="clientTop__nav">
          <div class="container">
            <nav class="clientNav" aria-label="menu interno">
              <button class="clientNav__item" type="button" data-panel="retrospectiva" aria-expanded="false">retrospectiva anual</button>
              <button class="clientNav__item" type="button" data-panel="relatorios" aria-expanded="false">relatórios</button>
              <button class="clientNav__item" type="button" data-panel="calendario" aria-expanded="false">calendário</button>
              <button class="clientNav__item" type="button" data-panel="social" aria-expanded="false">social media</button>
              <button class="clientNav__item" type="button" data-panel="influencia" aria-expanded="false">influência</button>
              <button class="clientNav__item" type="button" data-panel="fotos" aria-expanded="false">fotos</button>
              <button class="clientNav__item" type="button" data-panel="alinhamento" aria-expanded="false">alinhamento</button>
            </nav>

            <div class="clientPanels" aria-label="subitens">
              <div class="clientPanel" data-panel="retrospectiva" aria-hidden="true">
                <a href="https://www.elafashionmkt.com.br/retrospectiva-jescri" target="_blank" rel="noopener">2025</a>
                <a href="/cliente-jescri/retrospectiva/historico.html">histórico</a>
              </div>

              <div class="clientPanel" data-panel="relatorios" aria-hidden="true">
                <a href="/cliente-jescri/relatorios/trimestral.html">trimestral</a>
                <a href="https://docs.google.com/spreadsheets/d/1_NM8zC8NRFiLzMH3b4x9KfIXoSkVHUUbriHU1sqCYxQ/edit?gid=316240602#gid=316240602" target="_blank" rel="noopener">análise de criativos</a>
              </div>

              <div class="clientPanel" data-panel="calendario" aria-hidden="true">
                <a href="/cliente-jescri/calendario/">semestral</a>
                <a href="/cliente-jescri/calendario/fevereiro.html">fevereiro</a>
                <a href="/cliente-jescri/calendario/marco.html">março</a>
                <a href="/cliente-jescri/calendario/abril.html">abril</a>
              </div>

              <div class="clientPanel" data-panel="social" aria-hidden="true">
                <a href="https://docs.google.com/document/d/1SGiBtv-jDjVF2-XcjbJ6krWrl4xKTKODz51_9hUiU3k/edit?usp=sharing" target="_blank" rel="noopener">fevereiro</a>
                <a href="https://drive.google.com/drive/folders/1IOSAaw2U-QOgShSrU8Ijere4ZjvGWe9Q?usp=sharing" target="_blank" rel="noopener">março</a>
                <a href="https://drive.google.com/drive/folders/1V0Qy6ijnmwiBUGy06QuQ-48Iy6QLNajy?usp=drive_link" target="_blank" rel="noopener">abril</a>
                <a href="https://drive.google.com/drive/folders/1OVXCeFJ9dAV9iaEhD8JVMwmDsX-0xVt-?usp=sharing" target="_blank" rel="noopener">histórico</a>
              </div>

              <div class="clientPanel" data-panel="influencia" aria-hidden="true">
                <a href="/cliente-jescri/influencia/ativacoes-do-mes/">ativações do mês</a>
              </div>

              <div class="clientPanel" data-panel="fotos" aria-hidden="true">
                <a href="https://drive.google.com/drive/folders/1bfLATnqRxa1rRFFYgQ4STIwqsTmlo3kd?usp=drive_link" target="_blank" rel="noopener">vértice</a>
                <a href="https://drive.google.com/drive/folders/1_-4286F_eDhoEzVPaDQkuFwZIaDz9Du_" target="_blank" rel="noopener">florescer</a>
                <a href="https://drive.google.com/drive/folders/1vkYYwt-ANdTDQD__gI8FvSO1tUIEPq_Q" target="_blank" rel="noopener">bless</a>
                <a href="https://drive.google.com/drive/folders/1lK73Z8s7YW0YwRWpm3PuMvFwisUWE6Ot" target="_blank" rel="noopener">dolce vitta</a>
              </div>

              <div class="clientPanel" data-panel="alinhamento" aria-hidden="true">
                <a href="/cliente-jescri/alinhamento/">formulário semestral</a>
                <a href="/cliente-jescri/alinhamento/historico.html">histórico</a>
              </div>
            </div>
          </div>
        </div>
      </header>
    `;

    mounts.forEach((m) => { m.innerHTML = html; });
  }

  // logo svg do cliente (sem alterar o arquivo)
  async function injectClientLogo(){
    const targets = Array.from(document.querySelectorAll('[data-client-logo]'));
    if(!targets.length) return;

    const url = '/assets/jescri_logo.svg';

    let svgText = '';
    try{
      const res = await fetch(url, { cache: 'force-cache' });
      if(!res.ok) throw new Error('logo fetch failed');
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
        svg.classList.add('clientLogoSvg');
      }
    });
  }

  // menu interno horizontal com painéis (subitens só ao clicar)
  function initClientMenu(){
    const nav = document.querySelector('.clientNav');
    const panelsWrap = document.querySelector('.clientPanels');
    if(!nav || !panelsWrap) return;

    const items = Array.from(nav.querySelectorAll('[data-panel]'));
    const panels = Array.from(panelsWrap.querySelectorAll('.clientPanel[data-panel]'));

    function closeAll(){
      items.forEach((btn) => btn.setAttribute('aria-expanded', 'false'));
      panels.forEach((p) => {
        p.classList.remove('is-open');
        p.setAttribute('aria-hidden', 'true');
      });
    }

    function openPanel(key){
      closeAll();
      const btn = items.find((b) => b.getAttribute('data-panel') === key);
      const panel = panels.find((p) => p.getAttribute('data-panel') === key);
      if(!btn || !panel) return;
      btn.setAttribute('aria-expanded', 'true');
      panel.classList.add('is-open');
      panel.setAttribute('aria-hidden', 'false');
    }

    items.forEach((btn) => {
      btn.addEventListener('click', () => {
        const key = btn.getAttribute('data-panel');
        const isOpen = btn.getAttribute('aria-expanded') === 'true';
        if(isOpen) closeAll();
        else openPanel(key);
      });
    });

    panels.forEach((p) => {
      p.querySelectorAll('a').forEach((a) => {
        a.addEventListener('click', () => closeAll());
      });
    });

    document.addEventListener('click', (e) => {
      if(nav.contains(e.target)) return;
      if(panelsWrap.contains(e.target)) return;
      closeAll();
    });

    document.addEventListener('keydown', (e) => {
      if(e.key === 'Escape') closeAll();
    });

    closeAll();
  }

  injectClientTop();
  injectClientLogo();
  initClientMenu();
})();
