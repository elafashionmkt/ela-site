// Ajuste de scroll para topo fixed
(function () {
  const header = document.querySelector('.topbar');
  if (!header) return;

  const offset = () => header.getBoundingClientRect().height + 10;

  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id === '#') return;

      const el = document.querySelector(id);
      if (!el) return;

      e.preventDefault();
      const y = el.getBoundingClientRect().top + window.pageYOffset - offset();
      window.scrollTo({ top: y, behavior: 'smooth' });
      history.replaceState(null, '', id);
    });
  });

  // Fallback se iframe falhar (ex: bloqueio)
  const iframe = document.querySelector('iframe');
  const fallback = document.querySelector('.frame__fallback');
  if (!iframe || !fallback) return;

  let loaded = false;
  iframe.addEventListener('load', () => { loaded = true; });

  setTimeout(() => {
    if (!loaded) fallback.style.display = 'block';
  }, 2500);
})();
