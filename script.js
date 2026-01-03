(() => {
  const stage = document.getElementById("stage");
  const getScale = () => {
    const s = getComputedStyle(stage).getPropertyValue("--scale").trim();
    const n = parseFloat(s);
    return Number.isFinite(n) ? n : 1;
  };

  const scrollToId = (id, offset = 24) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = parseFloat(getComputedStyle(el).top) || el.offsetTop || 0;
    const y = Math.max(0, (top - offset) * getScale());
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  // Top nav (Pixso IDs)
  const navSobre = document.getElementById("2_14");
  const navArquitetura = document.getElementById("2_13");
  const navCafe = document.getElementById("2_15");
  const logo = document.getElementById("2_11");

  navSobre?.addEventListener("click", () => scrollToId("19_10"));
  navArquitetura?.addEventListener("click", () => scrollToId("19_15"));
  navCafe?.addEventListener("click", () => scrollToId("18_24"));
  logo?.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

  
  // Footer quick links
  const fSobre = document.getElementById("2_73");
  const fArquitetura = document.getElementById("2_78");
  const fCafe = document.getElementById("2_79");
  fSobre?.addEventListener("click", () => scrollToId("19_10"));
  fArquitetura?.addEventListener("click", () => scrollToId("19_15"));
  fCafe?.addEventListener("click", () => scrollToId("18_24"));

  // Footer contacts
  const fInsta = document.getElementById("2_75");
  const fPhone = document.getElementById("2_76");
  const fEmail = document.getElementById("2_77");

  fInsta?.addEventListener("click", () => window.open("https://instagram.com/elafashionmkt", "_blank", "noopener,noreferrer"));
  fPhone?.addEventListener("click", () => window.location.href = "tel:+5522936182313");
  fEmail?.addEventListener("click", () => window.location.href = "mailto:contato@elafashionmkt.com.br");


  // CTA button
  const ctaBg = document.getElementById("18_20");
  const ctaText = document.getElementById("18_21");
  const openCta = () => {
    // you can swap for Calendly/WhatsApp later
    const subject = encodeURIComponent("Agendar um café — elã");
    const body = encodeURIComponent("oi! queria agendar um café :) \n\nmeu nome:\nminha marca:\nmeu site/instagram:\n");
    window.location.href = `mailto:contato@elafashionmkt.com.br?subject=${subject}&body=${body}`;
  };
  ctaBg?.addEventListener("click", openCta);
  ctaText?.addEventListener("click", openCta);

  // Reveal on scroll (no layout shift)
  const prefersReduced = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  if (!prefersReduced && "IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) e.target.classList.add("is-visible");
        }
      },
      { threshold: 0.12 }
    );

    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
  } else {
    document.querySelectorAll(".reveal").forEach((el) => el.classList.add("is-visible"));
  }
})();
