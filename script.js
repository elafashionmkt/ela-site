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
(() => {
  // menu mobile
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");

  const openMenu = () => {
    hamburger.classList.add("open");
    mobileMenu.classList.add("active");
    hamburger.setAttribute("aria-expanded", "true");
    mobileMenu.setAttribute("aria-hidden", "false");
  };

  const closeMenu = () => {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("active");
    hamburger.setAttribute("aria-expanded", "false");
    mobileMenu.setAttribute("aria-hidden", "true");
  };

  hamburger?.addEventListener("click", () => {
    const isOpen = hamburger.classList.contains("open");
    isOpen ? closeMenu() : openMenu();
  });

  mobileMenu?.addEventListener("click", (e) => {
    if (e.target && e.target.tagName === "A") closeMenu();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // acordeão (multi-open)
  const headers = document.querySelectorAll(".accordion-header");

  const setPanelHeight = (panel, open) => {
    if (!panel) return;
    if (open) {
      panel.style.maxHeight = panel.scrollHeight + "px";
} else {
      // Abrir: calcular altura do conteúdo e animar até essa altura
      panel.classList.add('open');
      // Força display:block temporário para calcular altura se estivesse display:none
      panel.style.maxHeight = panel.scrollHeight + 'px';
      // Mudar ícone para "-" (poderíamos alterar o pseudo via classe .open)
      header.classList.add('open');
      header.setAttribute('data-text', header.getAttribute('data-text').replace(': +', ': -'));
      panel.style.maxHeight = "0px";
}
  };

  headers.forEach((header) => {
    const panel = header.nextElementSibling;

    // inicia fechado
    if (panel) panel.style.maxHeight = "0px";

    header.addEventListener("click", () => {
      const isOpen = header.classList.contains("open");
      header.classList.toggle("open", !isOpen);
      setPanelHeight(panel, !isOpen);
    });
  });

  // recalcula alturas abertas no resize
  window.addEventListener("resize", () => {
    document.querySelectorAll(".accordion-header.open").forEach((header) => {
      const panel = header.nextElementSibling;
      setPanelHeight(panel, true);
    });
});
});
})();
