// script.js
(function () {
  const topbar = document.querySelector(".topbar");
  const burger = document.querySelector(".burger");
  const mobile = document.querySelector(".mobile");
  const navLinks = Array.from(document.querySelectorAll(".nav__link"));
  const mobileLinks = Array.from(document.querySelectorAll(".mobile__link"));
  const toTop = document.querySelector(".to-top");

  // menu mobile
  function closeMobile() {
    burger?.setAttribute("aria-expanded", "false");
    if (mobile) mobile.hidden = true;
  }
  burger?.addEventListener("click", () => {
    const expanded = burger.getAttribute("aria-expanded") === "true";
    burger.setAttribute("aria-expanded", String(!expanded));
    if (mobile) mobile.hidden = expanded;
  });
  mobileLinks.forEach((a) => a.addEventListener("click", closeMobile));

  // underline ativo por seção (IntersectionObserver)
  const sections = [
    document.querySelector("#sobre"),
    document.querySelector("#servicos"),
    document.querySelector("#cafe"),
  ].filter(Boolean);

  const byId = (id) => navLinks.find((a) => a.getAttribute("href") === `#${id}`);

  const activeObs = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((e) => e.isIntersecting)
        .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];

      if (!visible?.target?.id) return;

      navLinks.forEach((a) => a.classList.remove("is-active"));
      const link = byId(visible.target.id);
      if (link) link.classList.add("is-active");
    },
    { root: null, threshold: [0.2, 0.35, 0.5] }
  );

  sections.forEach((s) => activeObs.observe(s));

  // reveal (sem opacidade)
  const reveals = Array.from(document.querySelectorAll(".reveal"));
  reveals.forEach((el, i) => {
    el.style.setProperty("--reveal-d", `${Math.min(i * 70, 280)}ms`);
  });

  const revealObs = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) e.target.classList.add("is-in");
      });
    },
    { threshold: 0.18 }
  );
  reveals.forEach((el) => revealObs.observe(el));

  // voltar ao topo (estrela)
  function updateToTop() {
    if (!toTop) return;
    const show = window.scrollY > 700;
    toTop.classList.toggle("is-visible", show);
  }
  window.addEventListener("scroll", updateToTop, { passive: true });
  updateToTop();

  toTop?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  // garante que logo sempre leva pra home
  const brand = document.querySelector(".brand");
  brand?.addEventListener("click", closeMobile);
})();
