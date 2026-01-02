import React from "react";
import "./Desktop.css";

import logoTopo from "./assets/logo_ela_topo.svg";
import logoFooter from "./assets/logo_ela_footer.svg";

export default function Desktop() {
  return (
    <div className="page">
      {/* HEADER */}
      <header className="siteHeader">
        <div className="wrap headerRow">
          <nav className="menu" aria-label="Menu">
            <a href="#sobre-nos">sobre nós</a>
            <a href="#servicos">arquitetura de serviços</a>
            <a href="#cafe">vai um café?</a>
          </nav>

          <div className="logoWrap" aria-label="Logo elã">
            <img className="logoTopo" src={logoTopo} alt="elã" />
          </div>

          {/* spacer p/ manter o logo centralizado */}
          <div className="headerSpacer" aria-hidden="true" />
        </div>
      </header>

      <main>
        {/* HERO */}
        <section className="hero" aria-label="Hero">
          <div className="wrap">
            <div className="heroTop">
              <div className="heroText">
                <h1 className="heroTitle">
                  marcas <strong>não precisam</strong> de mais posts.{" "}
                  <strong>precisam de direção.</strong>
                </h1>
                <p className="heroSub">
                  estratégia de marca, conteúdo e influência com intenção.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SOBRE */}
        <section id="sobre-nos" className="section" aria-label="Sobre nós">
          <div className="wrap">
            <div className="sectionTitleRow">
              <h2 className="h2">sobre nós</h2>
            </div>

            <p className="p">
              somos um<strong> estúdio que trabalha marca como ecossistema</strong>, não
              como ação isolada.{"\n"}
              a gente começa pelo que vem antes do conteúdo:{" "}
              <strong>posicionamento e direção</strong>.{"\n\n"}
              entendemos <strong>o momento da marca</strong>, o que ela sustenta hoje, o
              que precisa ser ajustado e quais escolhas vão{" "}
              <strong>deixar tudo mais coerente</strong>.{"\n\n"}
              <strong>atuamos a partir do posicionamento, da narrativa e da imagem</strong>,
              conectando números pra guiar e feeling pra criar.{"\n\n"}
              isso vira direção criativa, editorial, social e influência com o mesmo norte:{" "}
              <strong>consistência no tempo</strong>.
            </p>
          </div>
        </section>

        {/* SERVIÇOS */}
        <section id="servicos" className="section" aria-label="Arquitetura de serviços">
          <div className="wrap">
            <div className="sectionTitleRow">
              <h2 className="h2">arquitetura de serviços</h2>
            </div>

            <p className="p">
              nossa metodologia é a <strong>forma como damos direção</strong>, começamos
              lendo o que a marca sustenta hoje para definir um norte e transformá-lo em{" "}
              <strong>escolhas claras</strong>: o que dizer, como dizer e onde aparecer.
              A partir disso, organizamos prioridades e calendário{" "}
              <strong>para construir consistência no tempo</strong>.{"\n\n"}
              os <strong>módulos</strong> entram como peças de uma arquitetura. diagnóstico e
              posicionamento, direção criativa e editorial, social e conteúdo, influência e
              relações e lançamentos.{" "}
              <strong>não é um pacote engessado, é um sistema que se adapta ao seu momento</strong>,
              conectando posicionamento, direção e execução para evitar ações soltas.{"\n\n"}
              o acompanhamento funciona como bússola:{" "}
              <strong>números pra guiar, feeling pra criar</strong>.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section id="cafe" className="section" aria-label="Café">
          <div className="wrap cta">
            <div className="ctaText">
              <h2 className="h2">que tal um café?</h2>
              <p className="p">
                um convite simples pra conversar sobre a sua marca, entender o momento e
                pensar juntos os próximos passos.{"\n\n"}
                <strong>sem roteiro engessado, sem pressão.</strong>
              </p>

              <a className="ctaBtn" href="#footer">
                agendar :)
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer id="footer" className="footer" aria-label="Rodapé">
        <div className="wrap">
          <div className="footerTop">
            <img className="logoFooter" src={logoFooter} alt="elã" />
          </div>

          <div className="footerGrid">
            <div className="footerLinks">
              <a href="#sobre-nos">sobre nós</a>
              <a href="#servicos">arquitetura de serviços</a>
              <a href="#cafe">agende um café</a>
            </div>

            <div className="footerRight">
              <div className="footerContact">
                <div>elafashionmkt</div>
                <div>+55 22 93618-2313</div>
                <div>contato@elafashionmkt.com.br</div>
              </div>

              <div className="footerSocial" aria-label="Redes">
                <a href="https://instagram.com/elafashionmkt" target="_blank" rel="noreferrer">
                  Instagram
                </a>
                <a href="mailto:contato@elafashionmkt.com.br">E-mail</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
