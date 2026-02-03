/* scripts exclusivos da area do cliente */

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

  function setSession(clientId) {
    var c = cfg();
    var key = (c.session && c.session.storage_key) || "ela_client_session";
    var ttl = (c.session && c.session.ttl_ms) || 1000 * 60 * 60 * 24 * 7;
    var payload = { id: String(clientId || ""), exp: Date.now() + ttl };

    try {
      localStorage.setItem(key, JSON.stringify(payload));
    } catch (e) {}
  }

  function getSession() {
    var c = cfg();
    var key = (c.session && c.session.storage_key) || "ela_client_session";

    try {
      var raw = localStorage.getItem(key);
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

  function clearSession() {
    var c = cfg();
    var key = (c.session && c.session.storage_key) || "ela_client_session";
    try {
      localStorage.removeItem(key);
    } catch (e) {}
  }

  function redirectTo(url) {
    try {
      window.location.replace(String(url || "/"));
    } catch (e) {
      window.location.href = String(url || "/");
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

    var logout = document.querySelector("[data-ela-logout]");
    if (logout) {
      logout.addEventListener("click", function (e) {
        e.preventDefault();
        clearSession();
        redirectTo((cfg().rotas && cfg().rotas.login) || "/area-do-cliente/");
      });
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

  function initPdf() {
    var frame = document.querySelector("[data-ela-pdf-frame]");
    if (!frame) return;

    var url = (cfg().pdf && cfg().pdf.retrospectiva_jescri_2025) || "";
    if (!url) return;

    frame.setAttribute("src", url + "#view=fitH");

    var btn = document.querySelector("[data-ela-pdf-fullscreen]");
    var wrap = document.querySelector("[data-ela-pdf-wrap]") || frame;

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

        if (!ok) {
          window.open(url, "_blank", "noopener");
        }
      });
    }
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function monthLabel(ym) {
    var parts = String(ym || "").split("-");
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    var names = [
      "janeiro",
      "fevereiro",
      "março",
      "abril",
      "maio",
      "junho",
      "julho",
      "agosto",
      "setembro",
      "outubro",
      "novembro",
      "dezembro"
    ];
    return (names[m - 1] || "") + " " + y;
  }

  function buildCalendar(root, ym, data) {
    var parts = String(ym || "").split("-");
    var y = parseInt(parts[0], 10);
    var m = parseInt(parts[1], 10);
    if (!y || !m) return;

    var tags = (data && data.tags) || {};
    var events = (data && data.events) || [];

    var first = new Date(y, m - 1, 1);
    var start = first.getDay();
    var dim = new Date(y, m, 0).getDate();

    var evMap = {};
    events.forEach(function (ev) {
      var d = String(ev.date || "").trim();
      if (!d) return;
      if (!evMap[d]) evMap[d] = [];
      evMap[d].push(ev);
    });

    var dows = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

    var html = "";
    html += '<div class="clientCalHead">';
    html += '<div class="clientCalTitle">' + monthLabel(ym) + "</div>";
    html += '<div class="clientCalMeta">dados locais</div>';
    html += "</div>";

    html += '<div class="clientCalGrid" role="grid" aria-label="calendário">';
    for (var i = 0; i < 7; i++) {
      html += '<div class="clientCalDow" role="columnheader">' + dows[i] + "</div>";
    }

    var cells = 42;
    for (var c = 0; c < cells; c++) {
      var dayNum = c - start + 1;
      var inMonth = dayNum >= 1 && dayNum <= dim;
      var dateStr = inMonth ? y + "-" + pad2(m) + "-" + pad2(dayNum) : "";

      html += '<div class="clientCalCell' + (inMonth ? "" : " is-out") + '" role="gridcell">';
      html += '<div class="clientCalDay">' + (inMonth ? dayNum : "") + "</div>";

      if (inMonth && evMap[dateStr]) {
        evMap[dateStr].slice(0, 3).forEach(function (ev) {
          var tag = String(ev.tag || "").trim().toLowerCase();
          var t = tags[tag] || {};
          var color = String(t.color || "#cd0005");
          var title = String(ev.title || "").toLowerCase();
          html += '<div class="clientCalPill" style="background:' + color + '">';
          html += title;
          html += "</div>";
        });
      }

      html += "</div>";
    }

    html += "</div>";

    var list = "";
    list += '<div class="clientList">';
    list += '<div class="clientListTitle">itens do mês</div>';

    var ordered = events.slice().sort(function (a, b) {
      return String(a.date || "").localeCompare(String(b.date || ""));
    });

    if (!ordered.length) {
      list += '<div class="clientEmpty">nenhum item configurado</div>';
    } else {
      ordered.forEach(function (ev) {
        var tag = String(ev.tag || "").trim().toLowerCase();
        var t = tags[tag] || {};
        var color = String(t.color || "#cd0005");
        var date = String(ev.date || "").trim();
        var time = String(ev.time || "").trim();
        var title = String(ev.title || "").toLowerCase();
        var note = String(ev.note || "").toLowerCase();

        list += '<div class="clientListItem">';
        list += '<span class="clientDot" style="background:' + color + '"></span>';
        list += '<div class="clientListBody">';
        list += '<div class="clientListRow">';
        list += '<span class="clientListDate">' + date + (time ? " " + time : "") + "</span>";
        list += '<span class="clientListTag">' + (t.label ? String(t.label).toLowerCase() : tag) + "</span>";
        list += "</div>";
        list += '<div class="clientListName">' + title + "</div>";
        if (note) list += '<div class="clientListNote">' + note + "</div>";
        list += "</div>";
        list += "</div>";
      });
    }

    list += "</div>";

    root.innerHTML = html;

    var side = document.querySelector("[data-ela-calendar-side]");
    if (side) side.innerHTML = list;
  }

  function initCalendar() {
    var root = document.querySelector("[data-ela-calendar]");
    if (!root) return;

    var url = "/clientes/data/calendario-jescri.json";

    fetch(url, { cache: "no-store" })
      .then(function (r) {
        return r.ok ? r.json() : null;
      })
      .then(function (data) {
        var ym = (data && data.month) || "";
        if (!ym) {
          var d = new Date();
          ym = d.getFullYear() + "-" + pad2(d.getMonth() + 1);
        }
        buildCalendar(root, ym, data || {});
      })
      .catch(function () {
        var d = new Date();
        var ym = d.getFullYear() + "-" + pad2(d.getMonth() + 1);
        buildCalendar(root, ym, { events: [], tags: {} });
      });
  }

  function initRedirectPages() {
    var key = document.body && document.body.getAttribute("data-ela-redirect-key");
    if (!key) return;

    var map = (cfg().redirects || {});
    var url = String(map[key] || "").trim();

    var box = document.querySelector("[data-ela-redirect-status]");
    function show(text) {
      if (!box) return;
      box.textContent = String(text || "").toLowerCase();
    }

    if (!url) {
      show("link não configurado");
      return;
    }

    show("redirecionando");
    setTimeout(function () {
      window.location.href = url;
    }, 200);
  }

  function initAlinhamento() {
    var frame = document.querySelector("[data-ela-alinhamento-frame]");
    if (!frame) return;

    var url = String(cfg().alinhamento_form_url || "").trim();
    var status = document.querySelector("[data-ela-alinhamento-status]");

    if (!url) {
      if (status) {
        status.textContent = "link não configurado";
        status.hidden = false;
      }
      return;
    }

    if (status) status.hidden = true;
    frame.setAttribute("src", url);
  }

  function initNavActive() {
    var current = (document.body && document.body.getAttribute("data-ela-nav")) || "";
    if (!current) return;
    var els = document.querySelectorAll("[data-ela-nav-item]");
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var k = el.getAttribute("data-ela-nav-item");
      if (k === current) el.classList.add("is-active");
    }
  }

  function boot() {
    initLogin();
    initAuthGate();
    initLogout();
    initPdf();
    initCalendar();
    initRedirectPages();
    initAlinhamento();
    initNavActive();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
