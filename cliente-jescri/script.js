(function(){
  const cfg = (window.elaGetConfig ? window.elaGetConfig() : window.ELA_CONFIG_DEFAULT) || {};
  const client = (cfg.clients || []).find(c => c && c.id === 'jescri') || (cfg.clients || [])[0] || {};
  const PASSWORD = String(client.password || 'jescri');
  const STORAGE_KEY = "ela_auth_cliente_" + String(client.id || 'jescri');

  const auth = document.querySelector('.auth');
  const form = document.getElementById('authForm');
  const input = document.getElementById('authPass');
  const error = document.getElementById('authError');

  function setAuthed(value){
    try{ localStorage.setItem(STORAGE_KEY, value ? '1' : '0'); }catch(e){}
  }

  function getAuthed(){
    try{ return localStorage.getItem(STORAGE_KEY) === '1'; }catch(e){ return false; }
  }

  function hideAuth(){
    auth.classList.add('is-hidden');
    auth.setAttribute('aria-hidden', 'true');
  }

  function showAuth(){
    auth.classList.remove('is-hidden');
    auth.removeAttribute('aria-hidden');
    requestAnimationFrame(() => input && input.focus());
  }

  // auto-login
  if(getAuthed()){
    hideAuth();
  }else{
    showAuth();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const value = (input.value || '').trim();

    if(value === PASSWORD){
      setAuthed(true);
      if(error) error.classList.remove('is-on');
      hideAuth();
      input.value = '';
      return;
    }

    setAuthed(false);
    if(error) error.classList.add('is-on');
    input.select();
  });

  // enter fora do form não deve fazer scroll
  input.addEventListener('keydown', (e) => {
    if(e.key === 'Enter'){
      e.preventDefault();
      form.requestSubmit();
    }
  });

  // acordeão do menu (subitens só aparecem ao clicar no título)
  const cols = Array.from(document.querySelectorAll('.menuCol'));
  function closeAll(except){
    cols.forEach((col) => {
      if(col === except) return;
      col.classList.remove('is-open');
      const b = col.querySelector('.menuCol__title');
      if(b) b.setAttribute('aria-expanded', 'false');
    });
  }

  cols.forEach((col, i) => {
    const btn = col.querySelector('.menuCol__title');
    const panel = col.querySelector('.menuCol__links');
    if(!btn || !panel) return;

    // liga aria-controls
    if(!panel.id) panel.id = `menuPanel${i+1}`;
    btn.setAttribute('aria-controls', panel.id);

    btn.addEventListener('click', () => {
      const isOpen = col.classList.contains('is-open');
      if(isOpen){
        col.classList.remove('is-open');
        btn.setAttribute('aria-expanded', 'false');
        return;
      }
      closeAll(col);
      col.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    });
  });

  // ao clicar em qualquer link, o acordeão recolhe
  const allLinks = Array.from(document.querySelectorAll('.menuCol__links a'));
  allLinks.forEach((a) => {
    a.addEventListener('click', () => {
      closeAll();
    });
  });
})();
