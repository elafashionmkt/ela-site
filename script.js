/* elã | menu
   Desktop: fixo e estático (sem estado compact no scroll)
   Mobile: abre e fecha o menu
*/

(() => {
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  const closeMobile = () => {
    if (!mobileMenu) return;
    mobileMenu.hidden = true;
    if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
  };

  const openMobile = () => {
    if (!mobileMenu) return;
    mobileMenu.hidden = false;
    if (hamburger) hamburger.setAttribute('aria-expanded', 'true');
  };

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMobile();
      else openMobile();
    });

    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobile();
    });

    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMobile);
    });

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobile();
    });
  }
})();
