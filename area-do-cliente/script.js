(function(){
  const form = document.getElementById('loginForm');
  const instaEl = document.getElementById('loginInstagram');
  const passEl = document.getElementById('loginPassword');
  const errorEl = document.getElementById('loginError');

  const SESSION_KEY = 'ela_auth_session_v1';

  // base path (suporta publicação em subpasta, ex: /ela-site/)
  const BASE_PATH = (function(){
    const p = window.location.pathname || '/';
    if(p.startsWith('/ela-site/')) return '/ela-site';
    return '';
  })();

  function withBase(path){
    const raw = String(path || '');
    if(!raw.startsWith('/')) return `${BASE_PATH}/${raw}`;
    return `${BASE_PATH}${raw}`;
  }

  function stripBase(path){
    const raw = String(path || '');
    if(BASE_PATH && raw.startsWith(BASE_PATH + '/')) return raw.slice(BASE_PATH.length);
    return raw;
  }

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
    const ttlMs = 1000 * 60 * 60 * 12; // 12h
    const payload = { clientId, ts: Date.now(), expiresAt: Date.now() + ttlMs };
    try{ localStorage.setItem(SESSION_KEY, JSON.stringify(payload)); }catch(e){}
    try{ localStorage.setItem(`ela_auth_cliente_${clientId}`, '1'); }catch(e){}
  }

  function findClient(instagram, password){
    const cfg = (window.elaGetConfig ? window.elaGetConfig() : window.ELA_CONFIG_DEFAULT) || {};
    const list = Array.isArray(cfg.clients) ? cfg.clients : (Array.isArray(window.ELA_CLIENTS) ? window.ELA_CLIENTS : []);
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

    const params = new URLSearchParams(window.location.search || '');
    const next = (params.get('next') || '').trim();

    // aceita next com ou sem base path e normaliza
    const nextNoBase = stripBase(next);
    const safeNext = (nextNoBase.startsWith('/cliente-') || nextNoBase.startsWith('/cliente-jescri')) ? nextNoBase : '';

    const dest = safeNext || client.redirect || '/cliente-jescri/';
    window.location.href = withBase(stripBase(dest));
  });
})();
