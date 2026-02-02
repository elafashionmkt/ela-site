import React from 'react';
import { SERVICES_DATA, IMAGES } from '../constants';
import { Accordion } from '../components/Accordion';
import { ArrowRight, Instagram, Linkedin, MessageCircle } from '../components/Icons';

interface PublicHomeProps {
  onNavigateLogin: () => void;
}

export const PublicHome: React.FC<PublicHomeProps> = ({ onNavigateLogin }) => {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="bg-primary text-white pt-24 pb-32 px-6 md:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center relative z-10">
          <div>
            <h1 className="text-5xl md:text-7xl font-serif leading-tight mb-8">
              marcas não precisam de mais <br className="hidden md:block" />
              posts. <span className="italic">precisam de direção.</span>
            </h1>
          </div>
          {/* Decorative Star Element SVG */}
          <div className="hidden md:flex justify-end">
             <svg className="w-48 h-48 text-white opacity-90 animate-spin-slow" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 0L106 88L188 82L112 112L188 142L106 136L100 224L94 136L12 142L88 112L12 82L94 88L100 0Z" stroke="currentColor" strokeWidth="1.5"/>
             </svg>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="bg-primary text-white py-16 px-6 md:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-serif italic mb-8">sobre nós</h2>
            <div className="space-y-6 text-lg font-light leading-relaxed opacity-90">
              <p>
                somos um estúdio que trata <strong className="font-bold">marca como ecossistema</strong>, não como ação isolada. a gente começa pelo que vem antes do conteúdo: posicionamento e direção.
              </p>
              <p>
                entendemos o <strong className="font-bold">momento da marca</strong>, o que ela sustenta hoje, o que precisa ser ajustado e quais escolhas deixam tudo mais coerente. atuamos a partir de posicionamento, narrativa e estética.
              </p>
              <p className="font-medium opacity-100">
                isso vira direção criativa, editorial, social e influência com o mesmo norte.
              </p>
            </div>
          </div>
          <div className="relative mt-8 md:mt-0">
             <div className="aspect-[4/3] bg-gray-200 rounded-sm overflow-hidden shadow-2xl transform md:rotate-2 hover:rotate-0 transition-transform duration-500">
                <img 
                  src={IMAGES.heroBook} 
                  alt="Caderno e café" 
                  className="w-full h-full object-cover"
                />
             </div>
          </div>
        </div>
      </section>

      {/* Services Architecture */}
      <section className="bg-white py-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-primary italic mb-16">arquitetura de serviços</h2>
          <Accordion items={SERVICES_DATA} />
        </div>
      </section>

      {/* Methodology */}
      <section className="bg-white pb-24 px-6 md:px-12">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-serif text-primary italic mb-8">nossa metodologia</h2>
          <div className="grid md:grid-cols-2 gap-12">
             <div className="space-y-6 text-gray-800 leading-relaxed">
                <p>
                   <strong className="text-primary">é a forma como damos direção.</strong> começamos lendo o que a marca sustenta hoje e transformamos isso em escolhas práticas: o que dizer, como dizer e onde aparecer.
                </p>
                <p>
                   os módulos entram como <strong className="text-primary">partes de uma arquitetura.</strong> você pode começar pela fundação e evoluir, ou entrar pelo ponto que resolve o seu momento.
                </p>
                <p>
                   o acompanhamento funciona como bússola. você <strong className="text-primary">não fica com um PDF bonito e sozinho.</strong>
                </p>
             </div>
          </div>
        </div>
      </section>

      {/* Footer / CTA */}
      <footer className="bg-primary text-white pt-24 pb-12 px-6 md:px-12">
         <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-end mb-24">
               <div>
                  <h2 className="text-5xl font-serif italic mb-6">que tal um café?</h2>
                  <p className="mb-8 text-lg max-w-md font-light">
                     um convite simples para <strong className="font-bold">conversar sobre a sua marca</strong>. conversa leve, com clareza e sem pressão.
                  </p>
                  <button onClick={onNavigateLogin} className="bg-white text-primary px-8 py-3 rounded-full font-bold hover:shadow-lg hover:scale-105 transition-all">
                     agendar :)
                  </button>
               </div>
               <div className="text-right text-sm font-light opacity-80">
                  <p>estúdio de direção de marca</p>
                  <p>posicionamento • social • influência</p>
                  <p>desde 2025</p>
               </div>
            </div>

            <div className="border-t border-white/20 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
               <span className="text-4xl font-serif italic">elã</span>
               <div className="flex gap-6">
                  <a href="#" className="hover:opacity-80 transition-opacity"><MessageCircle size={24} /></a>
                  <a href="#" className="hover:opacity-80 transition-opacity"><Instagram size={24} /></a>
                  <a href="#" className="hover:opacity-80 transition-opacity"><Linkedin size={24} /></a>
               </div>
               <span className="text-xs opacity-60">© 2026 todos os direitos reservados</span>
            </div>
         </div>
      </footer>
    </div>
  );
};