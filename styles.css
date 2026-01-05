:root{
  --bg: #F4E9E6;
  --pink: #FFCCCC;
  --wine: #791815;
  --wine-2: rgba(121, 24, 21, 0.22);
  --ink: #3A3838;

  --max: 1280px;
  --pad: 120px;

  /* TOPBAR (Figma desktop) */
  --topbar-pad-top-expanded: 32px; /* Y do menu */
  --topbar-pad-top-compact: 0px;

  --topbar-inner-expanded: 57px;   /* altura do grupo do menu */
  --topbar-inner-compact: 38px;

  --logo-h-expanded: 57px;         /* Figma: 92x57 (mantemos altura) */
  --logo-h-compact: 38px;

  /* valores ativos (default = expanded) */
  --topbar-pad-top-current: var(--topbar-pad-top-expanded);
  --topbar-inner-current: var(--topbar-inner-expanded);
  --logo-h-current: var(--logo-h-expanded);
  --topbar-total-current: calc(var(--topbar-pad-top-current) + var(--topbar-inner-current));
}

html.is-compact{
  --topbar-pad-top-current: var(--topbar-pad-top-compact);
  --topbar-inner-current: var(--topbar-inner-compact);
  --logo-h-current: var(--logo-h-compact);
}

/* base */
*{ box-sizing: border-box; }
html,body{ height: 100%; }
body{
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: "Inter Tight", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
}

.section{ width: 100%; }
.container{
  width: min(var(--max), 100%);
  margin: 0 auto;
  padding-left: var(--pad);
  padding-right: var(--pad);
}

@media (max-width: 1280px){
  :root{ --pad: 72px; }
}
@media (max-width: 900px){
  :root{ --pad: 28px; }
}

/* TOP BAR */
.topbar{
  position: fixed;
  top: 0; left: 0; right: 0;
  height: var(--topbar-total-current);
  padding-top: var(--topbar-pad-top-current);
  background: var(--pink);
  z-index: 1000;
  transition: height 220ms ease, padding-top 220ms ease;
}

/* IMPORTANTE:
   - A LINHA fica no .bar (não no header inteiro)
   - Largura = largura do menu (igual Figma)
*/
.bar{
  height: var(--topbar-inner-current);
  width: min(calc(var(--max) - (var(--pad) * 2)), calc(100% - (var(--pad) * 2)));
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  border-bottom: 1px solid var(--wine);
}

/* Logo */
.logo{
  display: inline-flex;
  align-items: center;
  height: 100%;
  text-decoration: none;
}
.logo__img{
  height: var(--logo-h-current);
  width: auto;
  display: block;
}

/* Nav */
.nav{
  display: flex;
  align-items: center;
  gap: 28px;
}
.navlink{
  font-size: 17px;
  line-height: 21px;
  color: var(--wine);
  text-decoration: none;
  transition: opacity 140ms ease, color 140ms ease;
}
.navlink:hover{
  color: var(--wine);
  opacity: 0.85;
}

/* Hamburger (mobile) */
.hamburger{
  display: none;
  width: 44px;
  height: 44px;
  border: 0;
  background: transparent;
  cursor: pointer;
  align-items: center;
  justify-content: center;
  gap: 6px;
}
.hamburger__bar{
  width: 22px;
  height: 2px;
  background: var(--wine);
  display: block;
}

@media (max-width: 900px){
  .nav{ display: none; }
  .hamburger{ display: inline-flex; }
}

/* Mobile overlay */
.mobile{
  position: fixed;
  inset: var(--topbar-total-current) 0 0 0;
  background: rgba(0,0,0,0.08);
}
.mobile__panel{
  background: var(--pink);
  border-top: 1px solid var(--wine-2);
  padding: 18px var(--pad) 28px;
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.mobile__link{
  color: var(--wine);
  text-decoration: none;
  font-size: 18px;
  line-height: 22px;
}

/* HERO */
.hero{
  background: var(--pink);
  min-height: 640px;
  padding-top: calc(var(--topbar-total-current) + 146px);
  padding-bottom: 86px;
}
.hero__grid{
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  align-items: start;
  gap: 32px;
}
.h1{
  margin: 0;
  font-family: "ivyjournal", serif;
  font-weight: 400;
  color: var(--wine);
  font-size: 64px;
  line-height: 1.05;
  letter-spacing: -0.02em;
}
.h1 em{
  font-style: italic;
  font-weight: 400;
}
.hero__sub{
  margin: 18px 0 0;
  color: var(--wine);
  font-size: 20px;
  line-height: 1.35;
  letter-spacing: 0.01em;
}

.hero__mark{
  justify-self: end;
  margin-top: 18px;
}
.mark{
  width: 140px;
  height: auto;
  display: block;
}

@media (max-width: 1024px){
  .hero{ padding-top: calc(var(--topbar-total-current) + 110px); }
  .hero__grid{ grid-template-columns: 1fr; }
  .hero__mark{ justify-self: start; margin-top: 18px; }
}

/* TITULOS */
.h2{
  margin: 0 0 18px;
  font-family: "ivyjournal", serif;
  font-weight: 400;
  color: var(--wine);
  font-size: 44px;
  letter-spacing: -0.01em;
}
.h2 em{ font-style: italic; }

/* SOBRE */
.about{
  background: var(--bg);
  padding: 110px 0;
}
.about__grid{
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 56px;
  align-items: start;
}
.p{
  margin: 0;
  color: var(--wine);
  font-size: 16px;
  line-height: 1.65;
}
.about__imgWrap{ width: 100%; }
.about__img{
  position: sticky;
  top: calc(var(--topbar-total-current) + 24px);
  width: 100%;
  aspect-ratio: 4/3;
  background: #ddd;
  background-image: url("./assets/sobre.jpg");
  background-size: cover;
  background-position: center;
}

@media (max-width: 1024px){
  .about__grid{ grid-template-columns: 1fr; }
  .about__img{ position: relative; top: 0; }
}

/* BOTÃO */
.btn{
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  border: 1px solid var(--wine);
  color: var(--wine);
  text-decoration: none;
  border-radius: 999px;
  font-size: 16px;
  line-height: 20px;
  transition: background 140ms ease, color 140ms ease;
}
.btn:hover{
  background: var(--wine);
  color: var(--pink);
}
