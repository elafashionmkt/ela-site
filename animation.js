// acordeon: um aberto por vez
document.querySelectorAll('.accordion-header').forEach(header => {
  header.addEventListener('click', () => {
    const item = header.closest('.accordion-item');
    const isOpen = item.classList.contains('is-active');

    document.querySelectorAll('.accordion-item').forEach(i => {
      i.classList.remove('is-active');
      const btn = i.querySelector('.accordion-header');
      if (btn) btn.setAttribute('aria-expanded', 'false');
    });

    if (!isOpen) {
      item.classList.add('is-active');
      header.setAttribute('aria-expanded', 'true');
    }
  });
});
