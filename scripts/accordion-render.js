/* render do acordeão do site principal a partir de um arquivo de configuração */

(function(){
  const mount = document.querySelector('[data-ela-accordion]');
  if(!mount) return;

  const OV_KEY = 'ela_accordion_override';
  // url relativa para funcionar em subpasta (ex: github pages /repo/) e também em ambiente local
  const SRC = new URL('data/accordion-config.json', document.baseURI).toString();

  // fallback quando fetch falha (muito comum ao abrir o html direto no file://)
  const FALLBACK_CFG = {
    macros: [
      {
        id: 'fundacao',
        titleStrong: 'fundação',
        titleText: 'direção para marcas que querem crescer com consistência.',
        items: [
          {
            title: '',
            text: 'começamos organizando o que sustenta a sua comunicação: posicionamento, público, narrativa e prioridades de canal. desenhamos um plano anual de campanhas e um calendário que cabe na rotina. quando fizer sentido, criamos também a identidade visual para que cada ponto de contato tenha a mesma voz e o mesmo acabamento.'
          }
        ]
      },
      {
        id: 'desejo',
        titleStrong: 'desejo',
        titleText: 'estratégia que vira imagem, conteúdo e presença.',
        items: [
          {
            title: '',
            text: 'aqui a marca ganha corpo no feed e fora dele. criamos direção criativa, linguagem visual e editorial, produção de campanhas e peças para social, com conteúdo audiovisual e gestão de comunidade. o foco é manter o dna vivo com consistência e ritmo.'
          }
        ]
      },
      {
        id: 'relacionamento',
        titleStrong: 'relacionamento',
        titleText: 'parcerias que ampliam alcance e credibilidade.',
        items: [
          {
            title: '',
            text: 'mapeamos quem faz sentido para a marca e conduzimos convites, negociações e entregas. cuidamos de collabs e ativações com briefing, alinhamento e acompanhamento, para gerar conversa, lembrança e valor de longo prazo.'
          }
        ]
      },
      {
        id: 'sensorial',
        titleStrong: 'sensorial',
        titleText: 'a marca como experiência.',
        items: [
          {
            title: '',
            text: 'traduzimos o universo da marca em camadas que você sente. trilha sonora, identidade olfativa e unboxing pensado peça por peça, para que o público reconheça a marca antes mesmo de ler o nome.'
          }
        ]
      },
      {
        id: 'performance',
        titleStrong: 'performance',
        titleText: 'criatividade guiada por dados, com foco em resultado.',
        items: [
          {
            title: '',
            text: 'estruturamos mídia paga por funil, do reconhecimento à conversão, com testes e otimização contínua. conectamos criativo, dados e landing pages para reduzir ruído e manter consistência no crescimento.'
          }
        ]
      }
    ]
  };

  function safeJsonParse(str){
    try{ return JSON.parse(str); }catch(e){ return null; }
  }

  function esc(value){
    const s = String(value || '');
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function normId(id){
    const raw = String(id || '').toLowerCase().trim();
    return raw.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'macro';
  }

  function buildMacro(macro, idx){
    const macroId = normId(macro.id || idx+1);
    const bodyId = `module-${macroId}`;
    const triggerId = `module-${macroId}-trigger`;

    const titleStrong = esc((macro.titleStrong || '').toLowerCase());
    const titleText = esc((macro.titleText || '').toLowerCase());

    const items = Array.isArray(macro.items) ? macro.items : [];
    const itemsHtml = items.map((it) => {
      const t = esc((it.title || '').toLowerCase());
      const p = esc((it.text || '').toLowerCase());
      const hasTitle = t.trim().length > 0;
      return `
        <div class="module__item">
          ${hasTitle ? `<h3>${t}</h3>` : ''}
          <p>${p}</p>
        </div>
      `.trim();
    }).join('');

    return `
      <article class="module reveal" data-module>
        <button class="module__head" type="button" aria-expanded="false" aria-controls="${bodyId}" id="${triggerId}">
          <span class="module__title"><strong>${titleStrong}</strong> <span aria-hidden="true">•</span> ${titleText}</span>
          <span class="module__chev" aria-hidden="true"></span>
        </button>

        <div class="module__body" role="region" id="${bodyId}" aria-labelledby="${triggerId}" aria-hidden="true">
          <div class="module__inner">
            ${itemsHtml}
          </div>
        </div>
      </article>
    `.trim();
  }

  async function loadConfig(){
    let override = null;
    try{ override = safeJsonParse(localStorage.getItem(OV_KEY) || ''); }catch(e){ override = null; }

    if(override && override.macros){
      return override;
    }

    try{
      const res = await fetch(SRC, { cache: 'no-store' });
      if(!res.ok) return FALLBACK_CFG;
      const json = await res.json();
      if(!json || !json.macros) return FALLBACK_CFG;
      return json;
    }catch(e){
      return FALLBACK_CFG;
    }
  }

  loadConfig()
    .then((cfg) => {
      const macros = Array.isArray(cfg.macros) ? cfg.macros : [];
      mount.innerHTML = macros.map(buildMacro).join('');

      try{
        window.dispatchEvent(new CustomEvent('ela:accordion:rendered', { detail: { count: macros.length } }));
      }catch(e){}
    })
    .catch(() => {
      const macros = Array.isArray(FALLBACK_CFG.macros) ? FALLBACK_CFG.macros : [];
      mount.innerHTML = macros.map(buildMacro).join('');

      try{
        window.dispatchEvent(new CustomEvent('ela:accordion:rendered', { detail: { count: macros.length } }));
      }catch(e){}
    });
})();
