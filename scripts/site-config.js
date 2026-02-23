// site-config.js
// carrega config do google sheets (apps script) e aplica:
// - copy via [data-copy]
// - tokens via :root
// - assets via [data-asset]
// - redirects simples via hash

(function () {
  const CONFIG_URL = "https://script.google.com/macros/s/AKfycbwQk4-cTooI9NxcXfrf5Qjsa72mkArusNvNnEOBqjkVk2QoibzKoIhbvFq2Ty61AHdr/exec";
  const CACHE_KEY = "ela_site_config_cache_v1";
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

  async function fetchConfig() {
    const cached = getCache();
    if (cached) return cached;

    const res = await fetch(CONFIG_URL, { cache: "no-store" });
    if (!res.ok) throw new Error("config fetch failed: " + res.status);
    const data = await res.json();
    setCache(data);
    return data;
  }

  function applyCopy(copy) {
    if (!copy) return;

    const nodes = document.querySelectorAll("[data-copy]");
    nodes.forEach((el) => {
      const key = (el.getAttribute("data-copy") || "").trim();
      if (!key) return;

      const item = copy[key];
      if (!item) return;

      // value_html permite <strong> e spans. responsabilidade do editor.
      if (typeof item.value_html === "string") {
        el.innerHTML = item.value_html;
      }
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

    const nodes = document.querySelectorAll("[data-asset]");
    nodes.forEach((el) => {
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

      // para elementos não-img (ex: div), aplica background-image
      el.style.backgroundImage = `url("${item.src}")`;
    });
  }

  function applyRedirects(redirects) {
    if (!Array.isArray(redirects) || !redirects.length) return;

    // redirects de hash: se url atual bate em from, substitui por to
    const current = window.location.hash ? window.location.hash : "#";
    const hit = redirects.find((r) => r && r.enabled !== false && r.from === current);
    if (!hit || !hit.to) return;

    // tipo 301/302: no client side é sempre replace para não poluir histórico
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
        // falha silenciosa: site continua com conteúdo default
      });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
