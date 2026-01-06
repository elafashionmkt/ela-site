(() => {
  const $ = (sel) => document.querySelector(sel);

  // ---------- Helpers ----------
  const px = (n) => `${Math.round(n)}px`;
  const num = (v) => {
    const n = parseFloat(String(v || '').replace('px', ''));
    return Number.isFinite(n) ? n : 0;
  };

  // ---------- Elements (Pixso IDs/classes existentes) ----------
  const frame = $('#2_7');           // página inteira
  const accordionFrame = $('#7_17'); // seção "nossos módulos"
  const accordionWrap = $('#19_15'); // wrapper do bloco

  if (!frame || !accordionFrame || !accordionWrap) return;

  const item1 = $('#19_14');
  const item2 = $('#19_12');
  const item3 = $('#19_13');

  const item1Header = $('#19_11'); // header do item1 dentro do item1
  const item2Header = item2;
  const item3Header = item3;

  const content1 = $('#16_32'); // já existe no Pixso (vamos substituir o texto)
  if (!item1 || !item2 || !item3 || !item1Header || !content1) return;

  // ---------- Conteúdo (do acordeon.txt) ----------
  // Observação: mantemos quebras de linha (white-space: pre-line no CSS).
  const RAW = {
    a: `fundação: o que organiza a marca por dentro e define direção


planejamento estratégico de comunicação: estruturamos o plano do período a partir de uma leitura da marca, do produto, do discurso e dos números. definimos pilares, mensagens e prioridades que sustentam o que a marca comunica.


calendário de campanhas e lançamentos: montamos um calendário macro que organiza lançamentos, campanhas e sazonalidades, alinhamos comunicação e vendas para manter coerência ao longo do tempo.`,
    b: `desejo: o que constrói imagem, linguagem e vontade de pertencer


direção criativa e produção executiva: traduzimos o norte em conceito e direção de produção. linguagem visual, referências, casting, styling e organização de set para executar sem ruído.


social media e editorial de conteúdo: definimos linha editorial e presença nas redes. pauta, formatos e ritmo, com consistência estética e narrativa ao longo do tempo.


marketing sensorial: desenhamos a experiência da marca nos pontos de contato físicos e online. embalagem, texto, materiais e envio, tudo coerente com o DNA e com a percepção de valor.`,
    c: `relacionamento: o que coloca a marca em circulação com contexto


marketing de influência: mapeamos, prospectamos e gerimos influenciadoras com critério. cuidamos de acordos, entregas e acompanhamento, orientados por posicionamento e resultado.


gestão de collabs entre marcas: estruturamos collabs com marcas complementares, da proposta à execução. criamos valor simbólico, contexto e alcance com sentido.


ativações de marca e eventos de experiência: planejamos e produzimos ativações, lançamentos e encontros que materializam a marca no mundo real. isso vira conteúdo, relacionamento e repercussão.`,
  };

  const splitSection = (s) => {
    const lines = String(s || '').replace(/\r/g, '').split('\n');
    // primeira linha não vazia = título
    let i = 0;
    while (i < lines.length && !lines[i].trim()) i++;
    const title = (lines[i] || '').trim();
    i++;
    // remove vazios iniciais do corpo
    while (i < lines.length && !lines[i].trim()) i++;
    const body = lines.slice(i).join('\n').trim();
    return { title, body };
  };

  const A = splitSection(RAW.a);
  const B = splitSection(RAW.b);
  const C = splitSection(RAW.c);

  // substitui o corpo do item1 (sem mexer na identidade tipográfica do bloco)
  content1.innerHTML = '';
  content1.textContent = A.body;

  // cria conteúdos 2 e 3 mantendo as mesmas métricas do bloco 1
  const makeContent = (text) => {
    const el = document.createElement('div');
    el.className = 'ela-acc-content';
    el.textContent = text;
    return el;
  };

  const content2 = makeContent(B.body);
  const content3 = makeContent(C.body);
  item2.appendChild(content2);
  item3.appendChild(content3);

  // ---------- Medidas originais (base Pixso) ----------
  const orig = {
    frameH: num(getComputedStyle(frame).height),
    accFrameTop: num(getComputedStyle(accordionFrame).top),
    accFrameH: num(getComputedStyle(accordionFrame).height),
    wrapH: num(getComputedStyle(accordionWrap).height),

    item1Top: num(getComputedStyle(item1).top),
    item1H: num(getComputedStyle(item1).height),

    item2Top: num(getComputedStyle(item2).top),
    item2H: num(getComputedStyle(item2).height),

    item3Top: num(getComputedStyle(item3).top),
    item3H: num(getComputedStyle(item3).height),
  };

  const gaps = {
    between1and2: orig.item2Top - (orig.item1Top + orig.item1H),
    between2and3: orig.item3Top - (orig.item2Top + orig.item2H),
    bottomPad: orig.wrapH - (orig.item3Top + orig.item3H),
  };

  // guarda tops originais dos frames abaixo para "empurrar" com delta
  const frameChildren = Array.from(frame.children);
  frameChildren.forEach((el) => {
    const t = num(getComputedStyle(el).top);
    el.dataset.origTop = String(t);
  });

  // ---------- Accordion state ----------
  let openIndex = 0; // 0=item1, 1=item2, 2=item3

  const headerH = 37;     // altura do header (igual no Pixso)
  const contentTop = 66;  // top do conteúdo dentro do item (igual no Pixso)
  const bottomExtra = 20; // respiro final

  const setOpen = (idx) => {
    openIndex = idx;

    // toggle visibilidade
    const is1 = idx === 0;
    const is2 = idx === 1;
    const is3 = idx === 2;

    content1.hidden = !is1;
    content2.hidden = !is2;
    content3.hidden = !is3;

    // heights
    const h1 = is1 ? (contentTop + content1.scrollHeight + bottomExtra) : headerH;
    const h2 = is2 ? (contentTop + content2.scrollHeight + bottomExtra) : headerH;
    const h3 = is3 ? (contentTop + content3.scrollHeight + bottomExtra) : headerH;

    item1.style.height = px(h1);
    item2.style.height = px(h2);
    item3.style.height = px(h3);

    // reposiciona itens mantendo gaps do layout original
    const top1 = orig.item1Top;
    const top2 = top1 + h1 + gaps.between1and2;
    const top3 = top2 + h2 + gaps.between2and3;

    item2.style.top = px(top2);
    item3.style.top = px(top3);

    // ajusta altura do wrapper e da frame da seção
    const newWrapH = top3 + h3 + gaps.bottomPad;
    accordionWrap.style.height = px(newWrapH);
    accordionFrame.style.height = px(newWrapH);

    // empurra seções abaixo (e aumenta altura total da página)
    const delta = newWrapH - orig.accFrameH;

    frameChildren.forEach((el) => {
      const origTop = num(el.dataset.origTop);
      // só mexe no que está abaixo do acordeon
      if (origTop > orig.accFrameTop) {
        el.style.top = px(origTop + delta);
      }
    });

    frame.style.height = px(orig.frameH + delta);
  };

  const bindClick = (el, idx) => {
    el.addEventListener('click', (e) => {
      e.preventDefault();
      if (openIndex === idx) return; // já aberto
      setOpen(idx);
    });
    el.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        if (openIndex === idx) return;
        setOpen(idx);
      }
    });
    el.setAttribute('tabindex', '0');
    el.setAttribute('role', 'button');
    el.setAttribute('aria-expanded', String(openIndex === idx));
  };

  bindClick(item1Header, 0);
  bindClick(item2Header, 1);
  bindClick(item3Header, 2);

  // estado inicial: item1 aberto (como no Pixso)
  setOpen(0);

  // ---------- Animações (usa GSAP/ScrollTrigger já carregados pelo Pixso) ----------
  // Nada de inventar: só entrada suave e previsível.
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP) {
    try {
      const gsap = window.gsap;
      const st = window.ScrollTrigger;

      if (st) gsap.registerPlugin(st);

      const sections = ['#7_20', '#7_19', '#7_18', '#7_17', '#7_13', '#7_16', '#7_14', '#7_15']
        .map((id) => document.querySelector(id))
        .filter(Boolean);

      sections.forEach((sec) => {
        gsap.fromTo(
          sec,
          { opacity: 0, y: 18 },
          {
            opacity: 1,
            y: 0,
            duration: 0.6,
            ease: 'power2.out',
            scrollTrigger: st ? {
              trigger: sec,
              start: 'top 85%',
              toggleActions: 'play none none reverse',
            } : undefined,
          }
        );
      });
    } catch (_) {}
  }
})();
