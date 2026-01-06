// Unified vanilla interactions: sticky nav, reveal-on-scroll, accordion (single open)

(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Reveal on scroll
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if (!prefersReduced && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-visible');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }

  // Accordion (single open)
  const modules = Array.from(document.querySelectorAll('[data-module]'));
  const setOpen = (moduleEl, open) => {
    const btn = moduleEl.querySelector('.module__head');
    const body = moduleEl.querySelector('.module__body');
    if (!btn || !body) return;

    moduleEl.classList.toggle('module--open', open);
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');

    // Height animation
    if (open) {
      const inner = body.firstElementChild;
      const target = inner ? inner.getBoundingClientRect().height : 0;
      body.style.height = `${Math.ceil(target)}px`;
    } else {
      body.style.height = '0px';
    }
  };

  const closeAllExcept = (keepEl) => {
    modules.forEach((m) => {
      if (m !== keepEl) setOpen(m, false);
    });
  };

  modules.forEach((m) => {
    const btn = m.querySelector('.module__head');
    const body = m.querySelector('.module__body');

    // Initialize: open the one marked as open
    const shouldBeOpen = m.classList.contains('module--open');
    setOpen(m, shouldBeOpen);

    btn?.addEventListener('click', () => {
      const isOpen = m.classList.contains('module--open');
      closeAllExcept(m);
      setOpen(m, !isOpen);
    });

    // Keep correct height on resize
    window.addEventListener('resize', () => {
      if (m.classList.contains('module--open')) {
        const inner = body?.firstElementChild;
        const target = inner ? inner.getBoundingClientRect().height : 0;
        if (body) body.style.height = `${Math.ceil(target)}px`;
      }
    });
  });
})();
