// Scroll suave com correção para topo sticky (em alguns navegadores)
(function () {
  const header = document.querySelector('.topo');
  if (!header) return;

  const offset = () => header.getBoundingClientRect().height + 8;

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
})();
