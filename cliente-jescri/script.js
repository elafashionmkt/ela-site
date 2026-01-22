(function(){
  const PASSWORD = "OzX223";
  const STORAGE_KEY = "ela_auth_cliente_jescri";

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
})();
