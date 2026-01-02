// script.js
(() => {
  // fallback para assets (logo topo/footer e email)
  document.querySelectorAll("img[data-fallback]").forEach((img) => {
    img.addEventListener("error", () => {
      const fb = img.getAttribute("data-fallback");
      if (fb && !img.src.includes(fb)) img.src = fb;
    });
  });

  // garante data-text em links de texto (para hover sem “pulo”)
  document.querySelectorAll("a:not(.btn)").forEach((a) => {
    if (a.classList.contains("logo-topo")) return;
    if (a.hasAttribute("data-text")) return;

    const text = (a.textContent || "").replace(/\s+/g, " ").trim();
    if (text) a.setAttribute("data-text", text);
  });

  // menu mobile (fica sempre logo abaixo da barra vinho sticky)
  const headerBar = document.getElementById("header-bar");
  const hamburger = document.getElementById("hamburger");
  const mobileMenu = document.getElementById("mobile-menu");
  const mobileLinks = document.querySelectorAll(".mobile-link");

  const positionMobileMenu = () => {
    if (!headerBar || !mobileMenu) return;
    const rect = headerBar.getBoundingClientRect();
    mobileMenu.style.top = `${Math.round(rect.bottom)}px`;
  };

  const openMenu = () => {
    positionMobileMenu();
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

  window.addEventListener(
    "scroll",
    () => {
      if (hamburger?.classList.contains("open")) positionMobileMenu();
    },
    { passive: true }
  );

  window.addEventListener("resize", () => {
    if (hamburger?.classList.contains("open")) positionMobileMenu();
  });

  // acordeão (multi-open) - inicia com TODOS fechados
  const DATA = [
    {
      etapa: "fundação",
      descricao: "o que organiza a marca por dentro e define direção",
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
      descricao: "o que coloca a marca em circulação com contexto",
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
      item.dataset.open = "false";

      const btn = document.createElement("button");
      btn.className = "acc-btn";
      btn.type = "button";

      const headerText = `${m.etapa} — ${m.descricao}`;
      btn.setAttribute("data-text", headerText);
      btn.setAttribute("aria-expanded", "false");

      btn.innerHTML = `
        <span class="acc-label">
          <span class="acc-prefix">${esc(m.etapa)}</span><span class="acc-desc"> — ${esc(m.descricao)}</span>
        </span>
        <span class="acc-icon" aria-hidden="true">
          <span class="acc-plus">+</span>
          <span class="acc-minus">−</span>
        </span>
      `;

      const panel = document.createElement("div");
      panel.className = "acc-panel";
      panel.setAttribute("aria-hidden", "true");

      const inner = document.createElement("div");
      inner.className = "acc-inner";

      m.servicos.forEach((s) => {
        const p = document.createElement("p");
        p.className = "acc-service";
        p.innerHTML = `<strong>${esc(s.titulo)}</strong>: ${esc(s.texto)}`;
        inner.appendChild(p);
      });

      panel.appendChild(inner);

      btn.addEventListener("click", () => {
        const openNow = item.dataset.open === "true";

        if (openNow) {
          item.dataset.open = "false";
          panel.style.maxHeight = "0px";
          btn.setAttribute("aria-expanded", "false");
          panel.setAttribute("aria-hidden", "true");
        } else {
          item.dataset.open = "true";
          btn.setAttribute("aria-expanded", "true");
          panel.setAttribute("aria-hidden", "false");
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
      const btn = item.querySelector(".acc-btn");
      if (!panel) return;

      if (item.dataset.open === "true") {
        panel.style.maxHeight = panel.scrollHeight + "px";
        btn?.setAttribute("aria-expanded", "true");
        panel.setAttribute("aria-hidden", "false");
      } else {
        panel.style.maxHeight = "0px";
        btn?.setAttribute("aria-expanded", "false");
        panel.setAttribute("aria-hidden", "true");
      }
    });
  };

  build();
  window.addEventListener("resize", syncOpenHeights);
  window.addEventListener("load", syncOpenHeights);
})();

// ===== Content loader (from content.json) =====
async function loadContent() {
  try {
    const res = await fetch('./content.json', { cache: 'no-store' });
    if (!res.ok) throw new Error('content.json not found');
    const content = await res.json();

    const heroTitleEl = document.getElementById('heroTitle');
    if (heroTitleEl && typeof content.heroTitle === 'string') {
      heroTitleEl.textContent = content.heroTitle;
    }

    const heroRichEl = document.getElementById('heroRichText');
    if (heroRichEl && typeof content.heroRichTextHtml === 'string') {
      heroRichEl.innerHTML = content.heroRichTextHtml;
    }
  } catch (err) {
    console.warn('[content] not loaded:', err.message);
  }
}

document.addEventListener('DOMContentLoaded', loadContent);
