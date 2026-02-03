/* scripts exclusivos da área do cliente */

(function () {
  function cfg() {
    return window.ELA_CLIENTE_CONFIG || {};
  }

  function normIg(v) {
    return String(v || "")
      .trim()
      .toLowerCase()
      .replace(/^@+/, "");
  }

  function getSessionKey() {
    return (cfg().session && cfg().session.storage_key) || "ela_client_session";
  }

  function setSession(clientId) {
    var c = cfg();
    var key = getSessionKey();
    var ttl = (c.session && c.session.ttl_ms) || 1000 * 60 * 60 * 24 * 7;
    var payload = { id: String(clientId || ""), exp: Date.now() + ttl };
    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {}
  }

  function clearSession() {
    try {
      localStorage.removeItem(getSessionKey());
    } catch (e) {}
  }

  function getSession() {
    try {
      var raw = localStorage.getItem(getSessionKey());
      if (!raw) return null;
      var s = JSON.parse(raw);
      if (!s || !s.id || !s.exp) return null;
      if (Date.now() > Number(s.exp)) {
        clearSession();
        return null;
      }
      return s;
    } catch (e) {
      return null;
    }
  }

  function redirectTo(url) {
    var u = String(url || "/");
    try {
      window.location.replace(u);
    } catch (e) {
      window.location.href = u;
    }
  }

  function initAuthGate() {
    var requires = document.body && document.body.getAttribute("data-ela-requires-auth");
    if (requires !== "1") return;

    var s = getSession();
    if (!s || !s.id) {
      redirectTo((cfg().rotas && cfg().rotas.login) || "/area-do-cliente/");
      return;
    }

    var expected = document.body.getAttribute("data-ela-client-id") || "jescri";
    if (String(expected) !== String(s.id)) {
      redirectTo((cfg().rotas && cfg().rotas.login) || "/area-do-cliente/");
    }
  }

  function initLogout() {
    var logout = document.querySelector("[data-ela-logout]");
    if (!logout) return;
    logout.addEventListener("click", function (e) {
      e.preventDefault();
      clearSession();
      redirectTo((cfg().rotas && cfg().rotas.login) || "/area-do-cliente/");
    });
  }

  function initLogin() {
    var form = document.querySelector("[data-ela-login]");
    if (!form) return;

    var message = document.querySelector("[data-ela-login-msg]");
    function setMsg(t) {
      if (!message) return;
      message.textContent = String(t || "").toLowerCase();
      message.hidden = !message.textContent;
    }

    var s = getSession();
    if (s && s.id) {
      redirectTo((cfg().rotas && cfg().rotas.home_cliente) || "/clientes/jescri/");
      return;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      var igEl = form.querySelector('input[name="instagram"]');
      var pwEl = form.querySelector('input[name="password"]');

      var ig = normIg((igEl && igEl.value) || "");
      var pw = String((pwEl && pwEl.value) || "").trim().toLowerCase();

      var c = cfg();
      var igOk = normIg(c.auth && c.auth.instagram_permitido);
      var pwOk = String((c.auth && c.auth.senha) || "").trim().toLowerCase();

      if (!ig || !pw || ig !== igOk || pw !== pwOk) {
        setMsg("login inválido");
        return;
      }

      setMsg("");
      setSession("jescri");
      redirectTo((c.rotas && c.rotas.home_cliente) || "/clientes/jescri/");
    });
  }

  function initPdf() {
    var frame = document.querySelector("[data-ela-pdf-frame]");
    if (!frame) return;

    var url = (cfg().pdf && cfg().pdf.retrospectiva_jescri_2025) || "";
    if (!url) return;

    frame.setAttribute("src", url + "#view=fitH");

    var btn = document.querySelector("[data-ela-pdf-fullscreen]");
    var wrap = document.querySelector("[data-ela-pdf-wrap]") || frame;

    function openFallback() {
      try {
        window.open(url, "_blank", "noopener");
      } catch (e) {
        window.location.href = url;
      }
    }

    if (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();

        var ok = false;
        try {
          if (wrap && wrap.requestFullscreen) {
            wrap.requestFullscreen();
            ok = true;
          }
        } catch (err) {}

        if (!ok) openFallback();
      });
    }
  }

  function initRedirects() {
    var key = document.body && document.body.getAttribute("data-ela-redirect-key");
    if (!key) return;

    var msg = document.querySelector("[data-ela-redirect-msg]");
    function setMsg(t) {
      if (!msg) return;
      msg.textContent = String(t || "").toLowerCase();
    }

    var url = (cfg().redirects && cfg().redirects[key]) || "";
    if (!url) {
      setMsg("link não configurado");
      return;
    }

    var here = String(window.location.href || "");
    if (here.indexOf(url) !== -1) {
      setMsg("link não configurado");
      return;
    }

    setMsg("redirecionando…");
    redirectTo(url);
  }

  function initAlinhamento() {
    var iframe = document.querySelector("[data-ela-form-iframe]");
    if (!iframe) return;

    var empty = document.querySelector("[data-ela-form-empty]");
    var url = String(cfg().alinhamento_form_url || "").trim();

    if (!url) {
      if (empty) empty.hidden = false;
      iframe.style.display = "none";
      return;
    }

    iframe.setAttribute("src", url);
  }

  function fmtDate(iso) {
    var d = String(iso || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) return "";
    var parts = d.split("-");
    return parts[2] + "/" + parts[1] + "/" + parts[0];
  }

  function initCalendario() {
    var list = document.querySelector("[data-ela-calendar-list]");
    if (!list) return;

    var empty = document.querySelector("[data-ela-calendar-empty]");
    var url = (cfg().calendario && cfg().calendario.json_url) || "";
    if (!url) {
      if (empty) empty.hidden = false;
      return;
    }

    fetch(url)
      .then(function (r) {
        if (!r.ok) throw new Error("bad status");
        return r.json();
      })
      .then(function (data) {
        var items = (data && data.items) || [];
        if (!items.length) {
          if (empty) empty.hidden = false;
          return;
        }

        var html = "";
        items.forEach(function (it) {
          var tipo = String(it.tipo || "").trim().toLowerCase();
          var titulo = String(it.titulo || "").trim().toLowerCase();
          var desc = String(it.descricao || "").trim().toLowerCase();
          var dataFmt = fmtDate(it.data);
          var hora = String(it.hora || "").trim().toLowerCase();
          var extra = String(it.extra || "").trim().toLowerCase();

          html += '<article class="elaCalCard" data-tipo="' + tipo + '">';
          html += '<div class="elaCalCard__head">';
          html += '<p class="elaCalCard__tipo">' + (tipo || "evento") + "</p>";
          html += '<p class="elaCalCard__data">' + (dataFmt || "") + "</p>";
          html += "</div>";
          html += '<p class="elaCalCard__titulo">' + (titulo || "") + "</p>";
          if (desc) html += '<p class="elaCalCard__desc">' + desc + "</p>";
          if (hora || extra) {
            html += '<div class="elaCalCard__meta">';
            if (hora) html += '<span class="elaCalCard__metaItem">' + hora + "</span>";
            if (extra) html += '<span class="elaCalCard__metaItem">' + extra + "</span>";
            html += "</div>";
          }
          html += "</article>";
        });

        list.innerHTML = html;
      })
      .catch(function () {
        if (empty) empty.hidden = false;
      });
  }

  initAuthGate();
  initLogout();
  initLogin();
  initPdf();
  initRedirects();
  initAlinhamento();
  initCalendario();
})();
