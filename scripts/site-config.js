// site-config.js (jsonp)
// carrega config do apps script sem cors e aplica:
// - copy via [data-copy] (innerHTML)
// - tokens via :root
// - assets via [data-asset]
// - redirects simples via hash

(function () {
  const CONFIG_URL = "https://script.google.com/macros/s/AKfycbwQk4-cTooI9NxcXfrf5Qjsa72mkArusNvNnEOBqjkVk2QoibzKoIhbvFq2Ty61AHdr/exec";
  const CACHE_KEY = "ela_site_config_cache_v2";
  const CACHE_TTL_MS = 5 * 60 * 1000;

  function now() { return Date.now(); }

  function getCache() {
    try {
      const raw = localStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed.ts || !parsed.data) return null;
      if (now() - parsed.ts > CACHE_TTL_MS) return null;
      return parsed.data;
    } catch (_) {
      return null;
    }
  }

  function setCache(data) {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify({ ts: now(), data }));
    } catch (_) {}
  }

  function jsonp(url) {
    return new Promise((resolve, reject) => {
      const cbName = "__elaCfgCb_" + Math.random().toString(36).slice(2);
      const sep = url.indexOf("?") >= 0 ? "&" : "?";
      const full = url + sep + "callback=" + encodeURIComponent(cbName);

      let done = false;
      const timer = setTimeout(() => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error("jsonp timeout"));
      }, 8000);

      function cleanup() {
        try { delete window[cbName]; } catch (_) { window[cbName] = undefined; }
        if (script && script.parentNode) script.parentNode.removeChild(script);
        clearTimeout(timer);
      }

      window[cbName] = (data) => {
        if (done) return;
        done = true;
        cleanup();
        resolve(data);
      };

      const script = document.createElement("script");
      script.src = full;
      script.async = true;
      script.onerror = () => {
        if (done) return;
        done = true;
        cleanup();
        reject(new Error("jsonp load error"));
      };
      document.head.appendChild(script);
    });
  }

  async function fetchConfig() {
    const cached = getCache();
    if (cached) return cached;

    const data = await jsonp(CONFIG_URL);
    setCache(data);
    return data;
  }

  function applyCopy(copy) {
    if (!copy) return;
    document.querySelectorAll("[data-copy]").forEach((el) => {
      const key = (el.getAttribute("data-copy") || "").trim();
      if (!key) return;
      const item = copy[key];
      if (!item || typeof item.value_html !== "string") return;
      el.innerHTML = item.value_html;
    });
  }

  function applyTokens(tokens) {
    if (!tokens) return;
    const root = document.documentElement;
    Object.keys(tokens).forEach((token) => {
      const value = tokens[token];
      if (!token || !value) return;
      root.style.setProperty(token, value);
    });
  }

  function applyAssets(assets) {
    if (!assets) return;
    document.querySelectorAll("[data-asset]").forEach((el) => {
      const key = (el.getAttribute("data-asset") || "").trim();
      if (!key) return;
      const item = assets[key];
      if (!item || !item.src) return;

      if (el.tagName === "IMG") {
        el.src = item.src;
        if (item.alt) el.alt = item.alt;
        if (item.width) el.width = item.width;
        if (item.height) el.height = item.height;
        return;
      }

      el.style.backgroundImage = `url("${item.src}")`;
    });
  }

  function applyRedirects(redirects) {
    if (!Array.isArray(redirects) || !redirects.length) return;
    const current = window.location.hash ? window.location.hash : "#";
    const hit = redirects.find((r) => r && r.enabled !== false && r.from === current);
    if (!hit || !hit.to) return;
    window.location.replace(hit.to);
  }

  function boot() {
    fetchConfig()
      .then((cfg) => {
        applyTokens(cfg.tokens);
        applyCopy(cfg.copy);
        applyAssets(cfg.assets);
        applyRedirects(cfg.redirects);
      })
      .catch(() => {
        // silencioso
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
