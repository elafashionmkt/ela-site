(() => {
  // fallback para assets (logo topo/footer e email)
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      const fb = img.getAttribute("data-fallback");
      if (fb && !img.src.includes(fb)) img.src = fb;
    });
  });

  // menu mobile
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

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

  mobileLinks.forEach((a) => a.addEventListener("click", closeMenu));

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeMenu();
  });

  // acordeão (multi-open)
  const DATA = [
    {
      etapa: "fundação",
      descricao: "o que organiza a marca por dentro e define direção",
      openByDefault: true,
      servicos: [
        {
          titulo: "planejamento estratégico de comunicação",
          texto:
            "estruturamos o plano do período a partir de uma leitura profunda da marca, do produto, do discurso e dos números. definimos pilares, mensagens e prioridades que dão direção e consistência ao que a marca comunica."
        },
        {
          titulo: "calendário de campanhas e lançamentos",
          texto:
            "montamos um calendário macro que organiza lançamentos, campanhas e sazonalidades, alinhando comunicação e vendas para evitar ações isoladas e garantir coerência ao longo do tempo."
        }
      ]
    },
    {
      etapa: "desejo",
      descricao: "o que constrói imagem, linguagem e vontade de pertencer",
      servicos: [
        {
          titulo: "direção criativa e produção executiva",
          texto:
            "traduzimos o norte em conceito e direção: linguagem visual, referências, casting, styling e produção. garantimos execução fiel e uma logística que sustenta a estética sem ruído."
        },
        {
          titulo: "social media e editorial de conteúdo",
          texto:
            "definimos a linha editorial e a presença da marca nas redes: pauta, formatos e ritmo. do feed aos detalhes, construímos consistência estética e narrativa no tempo."
        },
        {
          titulo: "produção de conteúdo em foto e vídeo",
          texto:
            "criamos e dirigimos foto e vídeo com intenção: conteúdos para campanhas e rotina que humanizam a marca e sustentam seu universo visual de forma contínua."
        },
        {
          titulo: "marketing sensorial",
          texto:
            "desenhamos a experiência sensorial da marca nos pontos de contato físicos: embalagem, texto, materiais, loja e envio. tudo coerente com o dna e a percepção de valor."
        }
      ]
    },
    {
      etapa: "relacionamento",
      descricao: "o que coloca a marca em circulação com contexto e parceria",
      servicos: [
        {
          titulo: "marketing de influência",
          texto:
            "mapeamos, prospectamos e gerimos influenciadoras com critério, cuidando de acordos, entregas e acompanhamento, sempre orientados por posicionamento e resultado."
        },
        {
          titulo: "gestão de collabs entre marcas",
          texto:
            "estruturamos collabs com marcas complementares, da proposta à execução, criando valor simbólico, contexto e alcance com sentido."
        },
        {
          titulo: "ativações de marca e eventos de experiência",
          texto:
            "planejamos e produzimos ativações, lançamentos e encontros que materializam a marca no mundo real e geram conteúdo, relacionamento e repercussão."
        }
      ]
    }
  ];

  const root = document.getElementById("accordion");
  if (!root) return;

  const esc = (s) =>
    String(s)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");

  const build = () => {
    const frag = document.createDocumentFragment();

    DATA.forEach((m) => {
      const item = document.createElement("div");
      item.className = "acc-item";
      item.dataset.open = m.openByDefault ? "true" : "false";

      const btn = document.createElement("button");
      btn.className = "acc-btn";
      btn.type = "button";

      const headerText = `${m.etapa}: ${m.descricao}`;
      btn.setAttribute("data-text", headerText);

      btn.innerHTML = `
        <span class="acc-label">
          <span class="acc-prefix">${esc(m.etapa)}:</span>
          <span class="acc-desc"> ${esc(m.descricao)}</span>
        </span>
        <span class="acc-icon" aria-hidden="true"></span>
      `;

      const panel = document.createElement("div");
      panel.className = "acc-panel";

      const inner = document.createElement("div");
      inner.className = "acc-inner";

      m.servicos.forEach((s) => {
        const p = document.createElement("p");
        p.innerHTML = `<strong>${esc(s.titulo)}</strong>: ${esc(s.texto)}`;
        inner.appendChild(p);
      });

      panel.appendChild(inner);

      btn.addEventListener("click", () => {
        const openNow = item.dataset.open === "true";

        if (openNow) {
          item.dataset.open = "false";
          panel.style.maxHeight = "0px";
        } else {
          item.dataset.open = "true";
          panel.style.maxHeight = panel.scrollHeight + "px";
        }
      });

      item.appendChild(btn);
      item.appendChild(panel);
      frag.appendChild(item);
    });

    root.appendChild(frag);
    requestAnimationFrame(syncOpenHeights);
  };

  const syncOpenHeights = () => {
    root.querySelectorAll(".acc-item").forEach((item) => {
      const panel = item.querySelector(".acc-panel");
      if (!panel) return;

      if (item.dataset.open === "true") {
        panel.style.maxHeight = panel.scrollHeight + "px";
      } else {
        panel.style.maxHeight = "0px";
      }
    });
  };

  build();
  window.addEventListener("resize", syncOpenHeights);
  window.addEventListener("load", syncOpenHeights);
})();
