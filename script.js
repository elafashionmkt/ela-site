// script.js
(() => {
  document.querySelectorAll("img[data-fallback]").forEach(img=>{
    img.addEventListener("error",()=>{
      const fb=img.getAttribute("data-fallback");
      if(fb&&!img.src.includes(fb))img.src=fb;
    });
  });

  document.querySelectorAll("a:not(.btn)").forEach(a=>{
    if(a.hasAttribute("data-text"))return;
    const text=(a.textContent||"").trim();
    if(text)a.setAttribute("data-text",text);
  });

  const hamburger=document.getElementById("hamburger");
  const mobileMenu=document.getElementById("mobile-menu");
  const links=document.querySelectorAll(".mobile-link");
  const headerBar=document.getElementById("header-bar");

  const setMenuPos=()=>{
    if(!headerBar||!mobileMenu)return;
    const rect=headerBar.getBoundingClientRect();
    mobileMenu.style.top=`${rect.bottom}px`;
  };

  const openMenu=()=>{
    setMenuPos();
    hamburger.classList.add("open");
    mobileMenu.classList.add("active");
  };
  const closeMenu=()=>{
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("active");
  };

  hamburger?.addEventListener("click",()=>{
    hamburger.classList.contains("open")?closeMenu():openMenu();
  });
  links.forEach(a=>a.addEventListener("click",closeMenu));
  window.addEventListener("resize",()=>{if(hamburger?.classList.contains("open"))setMenuPos();});

  const DATA=[
    {etapa:"fundação",descricao:"o que organiza a marca por dentro e define direção",servicos:[
      {titulo:"planejamento estratégico de comunicação",texto:"estruturamos o plano do período a partir de uma leitura profunda da marca, do produto, do discurso e dos números. definimos pilares, mensagens e prioridades que dão direção e consistência ao que a marca comunica."},
      {titulo:"calendário de campanhas e lançamentos",texto:"montamos um calendário macro que organiza lançamentos, campanhas e sazonalidades, alinhando comunicação e vendas para evitar ações isoladas e garantir coerência ao longo do tempo."}
    ]},
    {etapa:"desejo",descricao:"o que constrói imagem, linguagem e vontade de pertencer",servicos:[
      {titulo:"direção criativa e produção executiva",texto:"traduzimos o norte em conceito e direção: linguagem visual, referências, casting, styling e produção. garantimos execução fiel e uma logística que sustenta a estética sem ruído."},
      {titulo:"social media e editorial de conteúdo",texto:"definimos a linha editorial e a presença da marca nas redes: pauta, formatos e ritmo. do feed aos detalhes, construímos consistência estética e narrativa no tempo."},
      {titulo:"produção de conteúdo em foto e vídeo",
