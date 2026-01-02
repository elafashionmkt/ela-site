// Seletores úteis
const hamburger = document.getElementById('hamburger');
const mobileNav = document.createElement('div');
mobileNav.classList.add('mobile-nav');
// Clonamos os links do menu existente para o menu mobile
const menuLinks = document.querySelectorAll('.menu a');
menuLinks.forEach(link => {
  const mobileLink = link.cloneNode(true);
  mobileNav.appendChild(mobileLink);
});
document.body.appendChild(mobileNav);

// Toggle do menu mobile
function toggleMobileMenu() {
  const isOpen = hamburger.classList.contains('open');
  if (isOpen) {
    hamburger.classList.remove('open');
    mobileNav.classList.remove('active');
  } else {
    hamburger.classList.add('open');
    mobileNav.classList.add('active');
  }
}
// Evento de clique no hamburger
hamburger.addEventListener('click', toggleMobileMenu);

// Fechar menu ao clicar em link ou apertar Esc
mobileNav.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    toggleMobileMenu();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && hamburger.classList.contains('open')) {
    toggleMobileMenu();
  }
});

// Acordeão dos módulos
const accordionHeaders = document.querySelectorAll('.accordion-header');
accordionHeaders.forEach(header => {
  header.addEventListener('click', () => {
    const panel = header.nextElementSibling; // o div.accordion-panel após o botão
    const isOpen = panel.classList.contains('open');
    if (isOpen) {
      // Fechar: setar max-height para 0 para animar fechamento
      panel.style.maxHeight = null;
      panel.classList.remove('open');
      // Voltar ícone para "+" (via conteúdo do pseudo-elemento, alteramos classe ou dataset)
      header.classList.remove('open');
      header.setAttribute('data-text', header.getAttribute('data-text').replace(': -', ': +'));
    } else {
      // Abrir: calcular altura do conteúdo e animar até essa altura
      panel.classList.add('open');
      // Força display:block temporário para calcular altura se estivesse display:none
      panel.style.maxHeight = panel.scrollHeight + 'px';
      // Mudar ícone para "-" (poderíamos alterar o pseudo via classe .open)
      header.classList.add('open');
      header.setAttribute('data-text', header.getAttribute('data-text').replace(': +', ': -'));
    }
  });
});
