/* styles.css */
:root{
  --wine:#791815;
  --hover:#FFCCCC;
  --bg:#ffffff;
  --text:#000000;

  --container:1280px;
  --gutter:120px;

  --gap-top:110px;     /* respiro branco (só na visão inicial) */
  --bar-h:110px;       /* altura barra vinho */
  --header-h:220px;    /* gap + barra (altura em flow) */

  --col-left:247px;    /* 120 + 247 = 367 (bate com o print) */
  --line:#FFCCCC;

  --hero-title-y:163.16px; /* pedido: Y = 163,16 */
}

*{ box-sizing:border-box; }
html{ scroll-behavior:smooth; }
body{
  margin:0;
  font-family:"Inter", system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
  background:var(--bg);
  color:var(--text);
  padding-top: 0; /* header agora está em flow; só a barra vinho é sticky */
}

img{ display:block; max-width:100%; }
a{ color:inherit; text-decoration:none; }

/* container do frame */
.container{
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 var(--gutter);
}

/* links sem “pulo” (bold no hover + reserva de largura) */
.link{
  position:relative;
  display:inline-block;
  font-weight:400;
  color:#fff;
}
.link::before{
  content: attr(data-text);
  font-weight:700;
  visibility:hidden;
  height:0;
  overflow:hidden;
  display:block;
}
.link:hover{
  color: var(--hover);
  font-weight:700;
}

/* HEADER */
.header{
  position:relative;
  width:100%;
  background: var(--bg);
  z-index:1000;
}
.header-gap{
  height: var(--gap-top);
}

/* só a barra vinho acompanha o scroll */
.header-bar{
  height: var(--bar-h);
  background: var(--wine);
  position: sticky;
  top: 0;
  z-index: 1000;

  /* clip do logo sangrado */
  overflow:hidden;
}

.header-content{
  height:100%;
  display:flex;
  align-items:center;
  position:relative;
}

.menu{
  display:flex;
  gap:29px;
  align-items:center;
}

/* menu em branco puro */
.menu .link{
  color:#fff;
  font-size:16px;
  letter-spacing:.05em;
}

/* logo topo (mantém tamanho e fica centralizado na altura da barra; parte fica “sangrada” e clipada) */
.logo-topo{
  position:absolute;
  left: calc(50% - 640px + 918px); /* referência do frame 1280 */
  top: 50%;
  transform: translateY(-50%);
  height:150px;
  display:flex;
  align-items:center;
}
.logo-img{
  height:150px;
  width:auto;
}

/* hamburger */
.hamburger{
  display:none;
  width:44px;
  height:44px;
  border:0;
  background:transparent;
  margin-left:auto;
  cursor:pointer;
  border-radius:10px;
}
.hamburger span{
  display:block;
  width:26px;
  height:2px;
  background:#fff;
  border-radius:2px;
  margin:6px auto;
  transition: transform .25s ease, opacity .25s ease;
}
.hamburger.open span:nth-child(1){ transform: translateY(8px) rotate(45deg); }
.hamburger.open span:nth-child(2){ opacity:0; }
.hamburger.open span:nth-child(3){ transform: translateY(-8px) rotate(-45deg); }

/* mobile menu (top é ajustado via JS para ficar sempre abaixo da barra) */
.mobile-menu{
  position:fixed;
  top: var(--bar-h);
  left:0;
  width:100%;
  background: var(--wine);
  border-top: 1px solid rgba(255,255,255,.18);
  transform: translateY(-10px);
  opacity:0;
  pointer-events:none;
  transition: transform .25s ease, opacity .25s ease;
  z-index:999;
}
.mobile-menu.active{
  transform: translateY(0);
  opacity:1;
  pointer-events:auto;
}
.mobile-nav{
  max-width: var(--container);
  margin: 0 auto;
  padding: 22px var(--gutter) 28px;
  display:flex;
  flex-direction:column;
  gap:14px;
}
.mobile-link{
  color:#fff;
  font-size:18px;
  letter-spacing:.05em;
}

/* GRID BASE (/01 /03 /04 alinhados) */
.grid-2col{
  display:grid;
  grid-template-columns: var(--col-left) 1fr;
  gap: 56px;
  align-items:start;
}
.col-left{ padding-top: 6px; }
.col-right{ min-width:0; }

.sec-num{ width:92px; height:auto; }
.num-right{ width:98px; }

/* HERO */
.hero{
  padding: var(--hero-title-y) 0 18px; /* pedido: Y = 163,16 */
}
.hero-right{
  position:relative;
  max-width: 760px;
  margin-left:auto;   /* encosta no lado direito da coluna */
  text-align:right;   /* alinhamento à direita */
}
.hero-title{
  margin:0;
  color: var(--wine);
  font-size: 47px;      /* print: 47.08 */
  line-height: 70px;    /* print: 70 */
  font-weight:400;
  letter-spacing:-0.01em;
  text-align:right;
}
.hero-title strong{ font-weight:700; }

.hero-sub{
  margin: 10px 0 0;
  font-size: 24px;      /* print: 23.54 */
  line-height: 40px;    /* print: 40 */
  letter-spacing:.05em;
  text-align:right;
  max-width: 420px;
  margin-left:auto;
}

/* SOBRE */
.sobre{
  padding: 86px 0;
}
.sobre-grid{
  display:grid;
  grid-template-columns: 1.08fr .92fr;
  gap: 56px;
  align-items:center; /* pedido: alinhar verticalmente com o moodboard */
}
.sobre-img img{
  width:100%;
  height:auto;
  border-radius: 22px;
}
.sobre-head{
  display:flex;
  justify-content:space-between;
  align-items:flex-start;
  gap: 18px;
}
.title{
  margin:0;
  color: var(--wine);
  font-size: 60px;     /* print: 60 */
  line-height: 40px;   /* print: 40 */
  font-weight:700;
  letter-spacing:-0.01em;
  padding-bottom: 10px; /* evita “corte” visual */
}

/* CORPO */
.copy{
  margin-top: 14px;
  font-size:16px;        /* print: 16 */
  line-height:25px;      /* print: 25 */
  letter-spacing:.05em;  /* print: 5% */
}
.copy p{ margin: 0 0 14px; }
.copy strong{ font-weight:700; }

/* ARQUITETURA */
.arquitetura{
  padding: 72px 0 92px;
}
.arq-copy{
  max-width: 760px;
}

/* ACCORDION (abre/fecha claro: + fechado, − aberto) */
.accordion{
  margin-top: 22px;
  max-width: 820px;
  border-top: 1px solid var(--line);
}
.acc-item{
  border-bottom: 1px solid var(--line);
}
.acc-btn{
  width:100%;
  border:0;
  background:transparent;
  padding: 18px 0;
  text-align:left;
  cursor:pointer;
  display:flex;
  align-items:flex-start;
  justify-content:space-between;
  gap: 16px;

  color: var(--wine);
  font-size:16px;
  line-height:25px;
  letter-spacing:.05em;
  font-weight:400;
}
.acc-btn::before{
  content: attr(data-text);
  font-weight:700;
  visibility:hidden;
  height:0;
  overflow:hidden;
  display:block;
}
.acc-btn:hover{ font-weight:700; }

.acc-label{ min-width:0; }
.acc-prefix{ font-weight:700; }
.acc-desc{ font-weight:400; }

/* ícone + / − com animação suave */
.acc-icon{
  width:18px;
  height:18px;
  flex:0 0 18px;
  position:relative;
  margin-top: 4px;
}
.acc-icon span{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  font-weight:700;
  font-size:22px;
  line-height:18px;
  color: var(--hover);
  transition: opacity .22s ease, transform .22s ease;
}
.acc-plus{ opacity:1; transform: scale(1); }
.acc-minus{ opacity:0; transform: scale(.85); }

.acc-item[data-open="true"] .acc-plus{ opacity:0; transform: scale(.85); }
.acc-item[data-open="true"] .acc-minus{ opacity:1; transform: scale(1); }

.acc-panel{
  max-height:0;
  overflow:hidden;
  transition: max-height .32s ease;
}
.acc-inner{
  padding: 0 0 18px 0;
  font-size:16px;
  line-height:25px;
  letter-spacing:.05em;
}
.acc-inner p{ margin:0 0 12px; }
.acc-inner p:last-child{ margin-bottom:0; }
.acc-inner strong{ font-weight:700; }

/* CAFÉ */
.cafe{
  padding: 68px 0 120px;
}
.cafe-title{
  margin:0;
  color: var(--wine);
  font-size: 60px;
  line-height: 40px;
  font-weight:700;
  letter-spacing:-0.01em;
  padding-bottom: 10px;
}
.btn{
  display:inline-block;
  margin-top: 10px;
  padding: 12px 26px;
  border-radius: 6px;
  background: var(--hover);
  color: var(--wine);
  font-weight:700;
  font-size:16px;
  letter-spacing:.05em;
}
/* botão “agendar” não entra no hover rosa/bold */
.btn:hover{
  color: var(--wine);
  font-weight:700;
}

/* FOOTER */
.footer{
  background: var(--wine);
  color:#fff;
  padding: 46px 0 54px;
}
.footer-grid{
  display:grid;
  grid-template-columns: 1fr auto 1fr;
  gap: 24px;
  align-items:center;
}
.footer-menu{
  display:flex;
  flex-direction:column;
  gap: 10px;
}
.footer-menu .link{
  color:#fff;
  font-size:16px;
  letter-spacing:.05em;
}

.footer-center{
  display:flex;
  justify-content:center;
  align-items:center;
}
.footer-logo{
  width:114px;   /* print: 114 */
  height:auto;
}

.footer-right{
  display:flex;
  flex-direction:column;
  gap: 12px;
  align-items:flex-end;
  text-align:right;
}

/* contatos (sem ícones) + hover rosa/bold sem pulo */
.contact{
  display:block;
  color:#fff;
  font-size:16px;
  letter-spacing:.05em;
}
.contact-text{
  position:relative;
  display:inline-block;
  font-weight:400;
}
.contact-text::before{
  content: attr(data-text);
  font-weight:700;
  visibility:hidden;
  height:0;
  overflow:hidden;
  display:block;
}
.contact:hover .contact-text{
  color: var(--hover);
  font-weight:700;
}

/* offset para âncoras por causa da barra sticky */
section[id]{ scroll-margin-top: calc(var(--bar-h) + 20px); }

/* RESPONSIVO */
@media (max-width: 980px){
  :root{
    --gutter:24px;
    --gap-top:56px;
    --bar-h:84px;
    --header-h:140px;
    --col-left:0px;

    --hero-title-y:72px; /* ajusta o “Y” para mobile (sem quebrar layout) */
  }

  .menu{ display:none; }
  .hamburger{ display:block; }

  /* logo topo vira “centrado” no mobile */
  .logo-topo{
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .logo-img{ height:120px; }

  .grid-2col{
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .col-left{ display:none; }

  .hero-right{
    text-align:left;
    margin-left:0;
  }
  .hero-title{
    font-size: 34px;
    line-height: 48px;
    text-align:left;
  }
  .hero-sub{
    text-align:left;
    margin-left:0;
    max-width:none;
    font-size: 18px;
    line-height: 30px;
  }

  .sobre-grid{
    grid-template-columns: 1fr;
    gap: 22px;
    align-items:start;
  }

  .footer-grid{
    grid-template-columns: 1fr;
    gap: 26px;
    align-items:start;
  }
  .footer-center{ justify-content:flex-start; }
  .footer-right{ align-items:flex-start; text-align:left; }
}
