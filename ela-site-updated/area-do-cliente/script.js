(function(){
  const form = document.getElementById('loginForm');
  const instaEl = document.getElementById('loginInstagram');
  const passEl = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginError');

  const SESSION_KEY = 'ela_auth_session_v1';

  function normalizeInsta(value){
    const raw = String(value || '').trim();
    if(!raw) return '';
    const v = raw.startsWith('@') ? raw : `@${raw}`;
    return v.toLowerCase();
  }

  function setError(msg){
    if(!errorEl) return;
    errorEl.textContent = msg || '';
  }

  function saveSession(clientId){
    const payload = { clientId, ts: Date.now() };
    try{ localStorage.setItem(SESSION_KEY, JSON.stringify(payload)); }catch(e){}
    try{ localStorage.setItem(`ela_auth_cliente_${clientId}`, '1'); }catch(e){}
  }

  function findClient(instagram, password){
    const list = Array.isArray(window.ELA_CLIENTS) ? window.ELA_CLIENTS : [];
    const insta = normalizeInsta(instagram);
    const pass = String(password || '').trim();

    return list.find((c) => {
      const ci = normalizeInsta(c.instagram);
      const cp = String(c.password || '').trim();
      return ci === insta && cp === pass;
    });
  }

  if(!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setError('');

    const insta = normalizeInsta(instaEl && instaEl.value);
    const pass = String(passEl && passEl.value || '').trim();

    if(!insta || !pass){
      setError('preencha instagram e senha.');
      return;
    }

    const client = findClient(insta, pass);
    if(!client){
      setError('login inválido. confira os dados e tente de novo.');
      return;
    }

    saveSession(client.id);
    window.location.href = client.redirect || '/cliente-jescri/';
  });
})();
