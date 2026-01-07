:root{
  --bg: #f4e9e6;
  --pink: #ffcccc;
  --ink: #3a3838;
  --accent: #791815;

  --container: 1180px;
  --nav-h: 78px;

  /* Fonte global */
  --body-font: "Inter Tight", Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;

  /* Títulos via Typekit */
  --display-font: ivyjournal, "IvyJournal", ivy-mode, "Ivy Mode", Georgia, serif;

  /* Theme tokens editáveis pelo painel (defaults) */
  --body-size: 18px;
  --body-weight: 300;

  --nav-size: 18px;
  --nav-weight: 300;

  --module-title-size: 25px;
  --module-title-weight: 300;
  --module-prefix-weight: 600;

  --btn-weight: 600;
}

/* RESET */
*{ box-sizing: border-box; }
html{ scroll-behavior: smooth; }
@media (prefers-reduced-motion: reduce){
  html{ scroll-behavior: auto; }
}
body{
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--body-font);
  font-size: var(--body-size);
  font-weight: var(--body-weight);
  overflow-x: hidden;
  padding-top: var(--nav-h);
}
a{ color: inherit; text-decoration: none; }
img{ max-width: 100%; height: auto; display: block; }

/* offset para âncoras com header fixo */
[id]{
  scroll-margin-top: calc(var(--nav-h) + 18px);
}

.container{
  width: min(var(--container), calc(100% - 48px));
  margin: 0 auto;
}

.skip{
  position: absolute;
  left: -999px;
  top: 8px;
  background: #fff;
  padding: 10px 12px;
  border-radius: 10px;
  z-index: 1000;
}
.skip:focus{ left: 8px; }

/* overlay (mantido) */
.pageTransition{
  position: fixed;
  inset: 0;
  background: var(--bg);
  opacity: 0;
  pointer-events: none;
  transition: opacity .28s ease;
  z-index: 999;
}
.pageTransition.is-active{ opacity: 1; }

/* TITLES */
.h1{
  margin: 0 0 22px;
  color: var(--accent);
  font-family: var(--display-font);
  font-size: 50px;
  line-height: 1.12;
  font-weight: 400;
}
.h1__em{ font-style: italic; font-weight: 600; }

.h2{
  margin: 0 0 28px;
  color: var(--accent);
  font-family: var(--display-font);
  font-size: 56px;
  line-height: 1.05;
  font-weight: 400;
}
.h2__em{ font-style: italic; font-weight: 600; }

/* COPY */
.copy{
  font-size: var(--body-size);
  line-height: 1.75;
  font-weight: var(--body-weight);
}
.copy p{ margin: 0 0 24px; }
.copy p:last-child{ margin-bottom: 0; }
.copy strong{ color: var(--accent); font-weight: 700; }

.u-underline{
  text-decoration: underline;
  text-underline-offset: 3px;
  text-decoration-thickness: 1px;
}
.u-accent{ color: var(--accent); font-weight: 700; }

/* SECTIONS */
.section{
  position: relative;
  padding: 96px 0;
}

/* NAV (fixo, 0 transparência, logo estável à esquerda) */
.nav{
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: var(--nav-h);
  z-index: 200;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24px;

  padding: 18px calc((100vw - min(var(--container), calc(100% - 48px))) / 2);

  background: var(--pink);
  border-bottom: 1px solid rgba(121,24,21,.12);
}

.brand{
  position: relative;
  width: 96px;
  height: 42px;
  display: inline-block;
}

.brand__logo,
.brand__norte{
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  height: auto;
  transition: opacity .18s ease;
}

/* topo: ~20% menor, sem mexer na posição */
.brand__logo{
  width: 77px;
  opacity: 1;
}

/* no scroll: ainda menor */
.brand__norte{
  width: 56px;
  opacity: 0;
}

.nav.is-scrolled .brand__logo{ opacity: 0; pointer-events: none; }
.nav.is-scrolled .brand__norte{ opacity: 1; }

.nav__links{
  display: flex;
  gap: 48px;
  font-size: var(--nav-size);
  font-weight: var(--nav-weight);
  color: var(--accent);
}

/* hover */
.nav__links a{
  position: relative;
  display: inline-block;
  padding-bottom: 6px;
  transition: font-weight .18s ease;
}
.nav__links a::after{
  content: "";
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 1px;
  background: currentColor;
  transform: scaleX(0);
  transform-origin: center;
  transition: transform .22s ease;
}
.nav__links a:hover,
.nav__links a:focus-visible{
  font-weight: 600;
}
.nav__links a:hover::after,
.nav__links a:focus-visible::after{
  transform: scaleX(1);
}

@media (max-width: 980px){
  :root{ --nav-h: 74px; }
  body{ padding-top: var(--nav-h); }
  .nav{ padding: 16px 24px; }
  .nav__links{ gap: 22px; font-size: 16px; }
  .brand{ width: 90px; height: 40px; }
  .brand__logo{ width: 72px; }
  .brand__norte{ width: 52px; }
}

/* HERO */
.hero{
  background: var(--pink);
  min-height: calc(100svh - var(--nav-h));
  display: flex;
}
.hero__container{
  min-height: calc(100svh - var(--nav-h));
  display: flex;
  flex-direction: column;
  position: relative;
  padding: 24px 0 22px;
}
.hero__grid{
  flex: 1;
  display: grid;
  grid-template-columns: 1.4fr .6fr;
  gap: 56px;
  align-items: center;
  padding: 56px 0 88px;
}
.hero__sub{
  margin: 0;
  line-height: 1.7;
  color: var(--ink);
}
.hero__decor{
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.hero__decor img{ width: 240px; height: auto; }

@media (max-width: 980px){
  .hero__grid{ grid-template-columns: 1fr; padding: 44px 0 88px; }
  .hero__decor{ justify-content: flex-start; }
}

/* SCROLL HINT */
.scrollHint{
  position: absolute;
  left: 50%;
  bottom: 26px;
  transform: translateX(-50%);
  color: var(--accent);
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  opacity: .9;
}
.scrollHint__icon{
  display: block;
  animation: hint 1.4s ease-in-out infinite;
}
@keyframes hint{
  0%, 100%{ transform: translateY(0); opacity: .9; }
  50%{ transform: translateY(6px); opacity: .55; }
}
@media (prefers-reduced-motion: reduce){
  .scrollHint__icon{ animation: none; }
}
.scrollHint--section{
  position: absolute;
  left: 50%;
  bottom: 22px;
  transform: translateX(-50%);
}

/* ABOUT (Figma) */
.section--about{ background: var(--bg); padding-bottom: 120px; }
.about{
  display: grid;
  grid-template-columns: 1fr 563px;
  gap: 64px;
  align-items: start;
}
.about__media{
  margin: 0;
  width: 563px;
  height: 485px;
  overflow: hidden;
}
.about__media img{
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top; /* ✅ mais fiel ao figma */
}
@media (max-width: 980px){
  .about{ grid-template-columns: 1fr; }
  .about__media{ width: 100%; height: auto; }
  .about__media img{ height: auto; }
}

/* MODULES */
.section--modules{ background: var(--pink); padding-bottom: 120px; }
.section--modules > .container{
  display: flex;
  flex-direction: column;
  align-items: center;
}
.section--modules .h2{
  width: min(920px, 100%);
  margin-left: auto;
  margin-right: auto;
}
.modules{ width: min(920px, 100%); margin: 0 auto; }

.module{ border: 0; }

.module__head{
  width: 100%;
  background: transparent;
  border: 0;
  padding: 18px 0;
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 18px;
  cursor: pointer;
  color: var(--accent);
  text-align: left;

  border-bottom: 1px solid rgba(121,24,21,.22);
}
.module:first-child .module__head{
  border-top: 1px solid rgba(121,24,21,.22);
}

.module__title{
  font-family: var(--body-font);
  font-size: var(--module-title-size);
  line-height: 1.15;
  font-weight: var(--module-title-weight);
  letter-spacing: -0.02em;
  text-decoration: none;
}
.module__title strong{ font-weight: var(--module-prefix-weight); }
.module__head, .module__head *{ text-decoration: none !important; }

.module__chev{
  width: 14px;
  height: 14px;
  border-right: 1px solid var(--accent);
  border-bottom: 1px solid var(--accent);
  transform: rotate(45deg) translateY(-1px);
  transition: transform .2s ease;
  flex: 0 0 auto;
  opacity: .75;
}

.module__body{
  height: 0px;
  overflow: hidden;
  transition: height .28s ease;
  will-change: height;
}
.module__inner{ padding: 16px 0 22px; }
.module.is-open .module__chev{ transform: rotate(-135deg) translateY(0px); }

.module__item h3{
  margin: 0 0 8px;
  font-size: 16px;
  font-weight: 700;
  color: var(--ink);
}
.module__item p{ margin: 0 0 20px; color: var(--ink); }
.module__item:last-child p{ margin-bottom: 0; }

/* METODOLOGIA (respiro -50% pro CTA) */
.section--method{
  background: var(--bg);
  padding-top: 96px;
  padding-bottom: 60px; /* ✅ -50% */
}
.method{
  width: min(1040px, 100%);
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 46px;
}
.method .h2{ margin: 0; }
.copy--method p{ margin: 0 0 26px; }
.copy--method p:last-child{ margin-bottom: 0; }

/* CTA (respiro -50% vindo da metodologia) */
.section--cta{
  background: var(--bg);
  padding-top: 48px;  /* ✅ -50% */
  padding-bottom: 96px;
}
.cta{
  width: min(1040px, calc(100% - 48px));
  margin: 0 auto;

  display: grid;
  grid-template-columns: 1.2fr .8fr;
  gap: 64px;
  align-items: center;
}
.cta__text{
  margin: 0 0 26px;
  line-height: 1.75;
}
.btn{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 44px;
  padding: 0 26px;
  background: var(--pink);
  color: var(--accent);
  border-radius: 12px;
  font-weight: var(--btn-weight);
}
.cta__stamp{
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 14px;
  color: var(--accent);
  text-align: right;
}
.cta__stamp img{ width: 120px; }

@media (max-width: 980px){
  .cta{ grid-template-columns: 1fr; }
  .cta__stamp{ align-items: flex-start; text-align: left; }
}

/* FOOTER */
.footerBar{
  background: var(--pink);
  height: 156px;
  display: flex;
  align-items: center;
}
.footerBar__inner{
  width: min(1280px, 100%);
  margin: 0 auto;
  padding: 0 120px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
}
.footerBar__logo img{ width: 92px; height: auto; }
.footerBar__copy{
  margin: 0;
  text-align: center;
  font-size: 16px;
  font-weight: 300;
  color: var(--accent);
}
.footerBar__social{
  display: flex;
  justify-content: flex-end;
  gap: 16px;
}
.footerBar__social a{
  width: 32px;
  height: 32px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.footerBar__social img{ width: 32px; height: 32px; }

@media (max-width: 980px){
  .footerBar__inner{
    padding: 0 24px;
    grid-template-columns: 1fr;
    gap: 14px;
    justify-items: center;
  }
  .footerBar__social{ justify-content: center; }
}

/* reveal */
.reveal{
  opacity: 0;
  transform: translateY(12px);
  transition: opacity .5s ease, transform .5s ease;
}
.reveal.is-visible{
  opacity: 1;
  transform: translateY(0);
}
@media (prefers-reduced-motion: reduce){
  .reveal{ transition: none; }
}

/* =============================
   MOBILE + TABLET REFINO
   Breakpoints: 430px e 768px
   ============================= */

/* foco visível consistente */
:where(a, button, [role="button"], input, textarea, select):focus-visible{
  outline: 2px solid var(--accent);
  outline-offset: 3px;
  border-radius: 10px;
}

body.menu-open{ overflow: hidden; }

/* estrutura do painel de navegação (desktop mantém como está) */
.nav__panel{ display: block; }
.nav__toggle{ display: none; }

/* evita scroll horizontal por sombras/transforms */
.hero, .section, .footerBar{ overflow-x: clip; }

@media (max-width: 768px){
  :root{
    --nav-h: 70px;
    --body-size: 16px;
    --module-title-size: 22px;
  }

  body{ padding-top: var(--nav-h); }

  .container{
    width: min(var(--container), calc(100% - 32px));
  }

  .section{ padding: 72px 0; }

  .h1{
    font-size: clamp(34px, 6.2vw, 44px);
    line-height: 1.1;
    margin-bottom: 18px;
  }

  .h2{
    font-size: clamp(38px, 7.2vw, 48px);
    line-height: 1.02;
    margin-bottom: 22px;
  }

  /* NAV */
  .nav{
    padding: 14px 16px;
    gap: 14px;
  }

  .brand{ width: 92px; height: 40px; }
  .brand__logo{ width: 74px; }
  .brand__norte{ width: 52px; }

  .nav__toggle{
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border: 1px solid rgba(121,24,21,.18);
    background: transparent;
    border-radius: 12px;
    color: var(--accent);
    flex: 0 0 auto;
    cursor: pointer;
  }

  .nav__toggleLines{
    width: 18px;
    height: 2px;
    background: currentColor;
    position: relative;
    border-radius: 10px;
    display: block;
  }
  .nav__toggleLines::before,
  .nav__toggleLines::after{
    content: "";
    position: absolute;
    left: 0;
    width: 18px;
    height: 2px;
    background: currentColor;
    border-radius: 10px;
    transition: transform .18s ease, top .18s ease, opacity .18s ease;
  }
  .nav__toggleLines::before{ top: -6px; }
  .nav__toggleLines::after{ top: 6px; }

  /* painel do menu */
  .nav__panel{
    position: fixed;
    left: 0;
    right: 0;
    top: var(--nav-h);
    background: var(--pink);
    border-bottom: 1px solid rgba(121,24,21,.12);
    transform: translateY(-8px);
    opacity: 0;
    pointer-events: none;
    transition: opacity .18s ease, transform .18s ease;
    z-index: 199;
  }

  .nav.is-open .nav__panel{
    transform: translateY(0);
    opacity: 1;
    pointer-events: auto;
  }

  .nav__links{
    flex-direction: column;
    gap: 12px;
    padding: 14px 16px 18px;
    font-size: 18px;
  }

  .nav__links a{
    padding: 10px 0;
  }

  /* X do toggle quando aberto */
  .nav.is-open .nav__toggleLines{ background: transparent; }
  .nav.is-open .nav__toggleLines::before{ top: 0; transform: rotate(45deg); }
  .nav.is-open .nav__toggleLines::after{ top: 0; transform: rotate(-45deg); }

  /* HERO */
  .hero__container{ padding: 18px 0 18px; }
  .hero__grid{
    padding: 34px 0 72px;
    gap: 26px;
  }
  .hero__decor img{ width: 190px; }

  .scrollHint{ bottom: 18px; }

  /* ABOUT */
  .section--about{ padding-bottom: 92px; }

  /* MODULES */
  .section--modules{ padding-bottom: 92px; }
  .module__head{ padding: 16px 0; }
  .module__inner{ padding: 14px 0 18px; }
}

@media (max-width: 430px){
  :root{
    --nav-h: 66px;
    --body-size: 16px;
    --module-title-size: 21px;
  }

  .section{ padding: 64px 0; }

  /* remove “norte” no mobile (hero) */
  .brand__norte{ display: none !important; }
  .nav.is-scrolled .brand__logo{ opacity: 1 !important; pointer-events: auto !important; }
  .nav.is-scrolled .brand__norte{ opacity: 0 !important; }

  .brand{ width: 86px; height: 38px; }
  .brand__logo{ width: 70px; }

  .hero__decor img{ width: 170px; }

  /* CTA e metodologia com respiro mais enxuto */
  .section--method{ padding-top: 72px; padding-bottom: 44px; }
  .section--cta{ padding-top: 40px; padding-bottom: 72px; }

  /* FOOTER: compacta sem perder leitura */
  .footerBar{ height: auto; padding: 24px 0; }
  .footerBar__logo img{ width: 86px; }
  .footerBar__copy{ font-size: 15px; }
}
