/* login da área do cliente */
(function () {
  const form = document.getElementById('ela-login-form');
  const clientSel = document.getElementById('ela-client');
  const userEl = document.getElementById('ela-user');
  const passEl = document.getElementById('ela-pass');
  const msgEl = document.getElementById('ela-login-msg');

  function setMsg(t) {
    if (msgEl) msgEl.textContent = String(t || '');
  }

  function normalizeUser(v) {
    const s = String(v || '').trim().toLowerCase();
    return s.startsWith('@') ? s.slice(1) : s;
  }

  function getConfig() {
    const base = (window.ELA_CONFIG_DEFAULT && typeof window.ELA_CONFIG_DEFAULT === 'object') ? window.ELA_CONFIG_DEFAULT : {};
    const custom = (window.ELA_CONFIG_CUSTOM && typeof window.ELA_CONFIG_CUSTOM === 'object') ? window.ELA_CONFIG_CUSTOM : {};

    const merged = {
      site: Object.assign({}, base.site || {}, custom.site || {})
    };

    const baseClients = base.clients;
    const customClients = custom.clients;

    if (Array.isArray(customClients)) merged.clients = customClients;
    else if (Array.isArray(baseClients)) merged.clients = baseClients;
    else if (baseClients && typeof baseClients === 'object') merged.clients = Object.values(baseClients);
    else if (customClients && typeof customClients === 'object') merged.clients = Object.values(customClients);
    else merged.clients = [];

    return merged;
  }

  const cfg = getConfig();
  const clients = Array.isArray(cfg.clients) ? cfg.clients : [];

  function populateClients() {
    if (!clientSel) return;
    clientSel.innerHTML = '';
    clients.forEach((c) => {
      const opt = document.createElement('option');
      opt.value = String(c.id || c.label || '').toLowerCase();
      opt.textContent = String(c.label || c.id || '').toLowerCase();
      clientSel.appendChild(opt);
    });
  }

  function findClient(id) {
    const key = String(id || '').toLowerCase();
    return clients.find((c) => String(c.id || c.label || '').toLowerCase() === key);
  }

  function validate(c, user, pass) {
    if (!c) return null;

    const u = normalizeUser(user);
    const p = String(pass || '');

    // formato atual do projeto: instagram + password no nível do cliente
    if (c.instagram && c.password) {
      const expectedUser = normalizeUser(c.instagram);
      if (u === expectedUser && p === String(c.password)) return String(c.redirect || '/');
    }

    // formato alternativo: users[]
    if (Array.isArray(c.users)) {
      const hit = c.users.find((x) => normalizeUser(x.user) === u && String(x.pass || '') === p);
      if (hit) return String(c.redirect || '/');
    }

    return null;
  }

  populateClients();

  if (!form) return;
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    setMsg('');

    const clientId = clientSel ? clientSel.value : '';
    const user = userEl ? userEl.value : '';
    const pass = passEl ? passEl.value : '';

    const c = findClient(clientId);
    const target = validate(c, user, pass);

    if (!target) {
      setMsg('acesso inválido');
      return;
    }

    try {
      sessionStorage.setItem('ela_client', String(c.id || clientId));
      sessionStorage.setItem('ela_user', normalizeUser(user));
    } catch (err) {}

    window.location.href = target;
  });
})();
