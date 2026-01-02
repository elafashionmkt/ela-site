// whatsapp (botão do cta + link do footer usam o mesmo)
const WHATS_NUMBER = "5522936182313"; // +55 22 93618-2313
const WHATS_TEXT = encodeURIComponent("oi! quero agendar um café e conversar sobre a elã :)");
const WHATS_URL = `https://wa.me/${WHATS_NUMBER}?text=${WHATS_TEXT}`;

const whatsLink = document.getElementById("whatsLink");
const ctaAgendar = document.getElementById("ctaAgendar");
if (whatsLink) whatsLink.href = WHATS_URL;
if (ctaAgendar) ctaAgendar.href = WHATS_URL;

// instagram
const instagramLink = document.getElementById("instagramLink");
if (instagramLink) instagramLink.href = "https://instagram.com/elafashionmkt";

// hamburger: abre/fecha com animação leve
const toggle = document.querySelector(".nav-toggle");
const nav = document.querySelector(".nav");

function closeMenu(){
  nav?.classList.remove("is-open");
  toggle?.classList.remove("is-open");
  toggle?.setAttribute("aria-expanded", "false");
}

if (toggle && nav) {
  toggle.addEventListener("click", () => {
    const open = nav.classList.toggle("is-open");
    toggle.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
  });

  // fecha ao clicar em link
  nav.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", closeMenu);
  });

  // fecha ao clicar fora
  document.addEventListener("click", (e) => {
    const t = e.target;
    if (!t) return;
    const clickedInside = nav.contains(t) || toggle.contains(t);
    if (!clickedInside) closeMenu();
  });
}

// accordion: abre vários (sem lógica de fechar outros)
// (não precisa JS, <details> já faz)
