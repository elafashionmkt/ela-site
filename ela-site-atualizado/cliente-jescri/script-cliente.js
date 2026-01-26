// Cliente hub niceties:
// - Permite abrir um bloco específico via hash (ex: #relatorios)
// - Mantém o comportamento do accordion do script principal (single open)

(function () {
  const map = {
    retro: "m-retro-trigger",
    retrospectiva: "m-retro-trigger",
    relatorios: "m-relatorios-trigger",
    calendario: "m-calendario-trigger",
    social: "m-social-trigger",
    socialmedia: "m-social-trigger",
    influencia: "m-influencia-trigger",
    fotos: "m-fotos-trigger",
    alinhamento: "m-alinhamento-trigger",
  };

  const openByHash = () => {
    const raw = (location.hash || "").replace("#", "").trim();
    if (!raw) return;

    // aceita #relatorios e também #relatorios-2026 etc.
    const key = raw.split("-")[0].toLowerCase();
    const id = map[key];
    if (!id) return;

    const trigger = document.getElementById(id);
    if (trigger) {
      // abre o módulo (o script principal faz o toggle)
      trigger.click();
      // garante scroll suave para o hub
      const hub = document.getElementById("hub");
      if (hub) hub.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // abre após load
  window.addEventListener("load", openByHash);
  window.addEventListener("hashchange", openByHash);
})();
