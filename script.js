/* elã | comportamento do menu
   - estado "estático" (topo): respeita o Y=32 do Figma
   - estado "compact" (scroll): reduz alturas e mantém alinhamento
*/

(() => {
  const root = document.documentElement;
  const hamburger = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  // compactar ao rolar
  const COMPACT_AFTER = 40;

  const setCompact = () => {
    const shouldCompact = window.scrollY > COMPACT_AFTER;
    root.classList.toggle('is-compact', shouldCompact);
  };

  // mobile menu
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

  window.addEventListener('scroll', setCompact, { passive: true });
  window.addEventListener('load', setCompact);

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      const expanded = hamburger.getAttribute('aria-expanded') === 'true';
      if (expanded) closeMobile();
      else openMobile();
    });

    // clicar fora fecha
    mobileMenu.addEventListener('click', (e) => {
      if (e.target === mobileMenu) closeMobile();
    });

    // ao clicar em link fecha
    mobileMenu.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', closeMobile);
    });

    // ESC fecha
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMobile();
    });
  }
})();
