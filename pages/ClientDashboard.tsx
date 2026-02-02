import React, { useState } from 'react';
import { ClientTab } from '../types';
import { Download, Maximize2, ArrowRight, FileText, Eye, Menu, MessageCircle, Instagram, Linkedin } from '../components/Icons';
import { IMAGES } from '../constants';

interface ClientDashboardProps {
  onLogout: () => void;
}

export const ClientDashboard: React.FC<ClientDashboardProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState<ClientTab>('retrospective');

  // --- Components for Sub-Views ---
  
  const RetrospectiveView = () => (
    <div className="relative w-full bg-primary rounded-xl overflow-hidden min-h-[500px] flex flex-col justify-center p-8 md:p-16 text-white transition-all duration-500 animate-fade-in">
        {/* Abstract Shapes */}
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20 pointer-events-none">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-white">
                <path d="M50 0 C 80 20, 100 50, 100 100 L 100 0 Z" />
            </svg>
        </div>
        <div className="absolute bottom-0 right-20 w-64 h-64 bg-white rounded-full opacity-10 blur-3xl"></div>

        <div className="relative z-10 max-w-2xl">
            <button className="bg-white text-primary px-6 py-2 rounded-full font-bold text-sm mb-12 hover:bg-gray-100 transition-colors shadow-lg flex items-center gap-2">
                <Maximize2 size={16} />
                entre em tela cheia
            </button>
            <h2 className="text-5xl md:text-7xl font-sans font-extrabold leading-tight mb-6">
                retrospectiva<br />anual
            </h2>
            <p className="text-lg md:text-2xl font-medium max-w-md leading-relaxed opacity-90">
                2025 foi um ano de ajustes, testes e confirmações.
            </p>
        </div>
    </div>
  );

  const CalendarView = () => (
    <div className="animate-fade-in">
        {/* Tags */}
        <div className="flex flex-wrap gap-3 mb-8">
            {['influenciadora', 'oportunidade', 'comercial', 'lançamento'].map((tag, i) => {
                const colors = [
                    'bg-[#F4C45D]', 'bg-[#74C863]', 'bg-[#7DA7EB]', 'bg-[#B896C7]'
                ];
                return (
                    <span key={tag} className={`${colors[i]} text-white px-4 py-1 rounded-full text-xs font-bold`}>
                        {tag}
                    </span>
                );
            })}
        </div>

        {/* Calendar Grid - Hardcoded for visual match */}
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
                 <h2 className="text-4xl font-serif text-primary italic">fevereiro</h2>
                 <div className="flex gap-1">
                    <div className="w-3 h-3 rounded-full bg-[#F4C45D]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#7DA7EB]"></div>
                    <div className="w-3 h-3 rounded-full bg-[#74C863]"></div>
                 </div>
            </div>
            
            <div className="grid grid-cols-7 text-center py-2 text-primary font-medium text-sm border-b border-gray-200 bg-gray-50">
                {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 bg-white">
                {/* Simplified Calendar Cells generation */}
                {Array.from({ length: 31 }).map((_, i) => {
                   const day = i + 1; // Not accurate calendar logic, just for visual layout of grid
                   // Mocking specific cells from screenshot
                   const isFeb1 = i === 3; 
                   const isFreightDay = i === 9; // ~10th
                   const isJuliane = i === 13; // ~14th
                   const isMarch1 = i === 28;

                   return (
                       <div key={i} className={`min-h-[120px] border-b border-r border-gray-100 p-2 relative group hover:bg-gray-50 transition-colors ${i === 9 || i === 13 ? 'col-span-2 bg-gray-50/50' : ''}`}>
                            <span className={`absolute top-2 right-2 text-xs ${isFeb1 || isMarch1 ? 'text-primary font-bold' : 'text-gray-400'}`}>
                                {isFeb1 ? 'fev 01' : isMarch1 ? 'mar 01' : (i > 27 ? `0${i-27}` : (i < 3 ? 28+i : i-2))}
                            </span>

                            {isFreightDay && (
                                <div className="absolute inset-2 top-6 bg-[#7DA7EB] rounded-lg p-3 shadow-md text-white cursor-pointer hover:scale-[1.02] transition-transform z-10">
                                    <p className="font-bold text-xs mb-1">Dia do Frete Grátis</p>
                                    <p className="text-[10px] leading-tight opacity-90 hidden md:block">oportunidade de capturar clientes indecisos.</p>
                                </div>
                            )}

                            {isJuliane && (
                                <div className="absolute inset-2 top-6 bg-[#F4C45D] rounded-lg p-3 shadow-md text-white cursor-pointer hover:scale-[1.02] transition-transform z-10">
                                    <p className="font-bold text-xs mb-1">Juliane Ramos</p>
                                    <p className="text-[10px] leading-tight opacity-90">carrossel • 20:30</p>
                                </div>
                            )}
                       </div>
                   )
                })}
            </div>
        </div>
    </div>
  );

  const ReportsView = () => (
    <div className="animate-fade-in">
        <div className="flex justify-between items-end mb-6">
            <h3 className="text-3xl font-serif text-primary italic">relatório mensal: fevereiro</h3>
            <div className="flex gap-3">
                <button className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-primary text-primary text-sm font-medium hover:bg-primary hover:text-white transition-all">
                    <Download size={16} /> baixar
                </button>
                <button className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-white text-sm font-medium hover:bg-primary-dark transition-all shadow-md">
                    <Maximize2 size={16} /> <span className="hidden md:inline">entre em tela cheia</span>
                </button>
            </div>
        </div>

        {/* PDF Preview Area */}
        <div className="w-full aspect-[16/9] bg-white border border-gray-200 rounded-2xl shadow-sm mb-12 flex flex-col items-center justify-center relative group overflow-hidden">
             <div className="absolute inset-0 opacity-5 pointer-events-none">
                 <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full fill-primary">
                    <path d="M0 100 C 20 0 50 0 100 100 Z" />
                 </svg>
             </div>
             
             <div className="text-center z-10">
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-gray-400" />
                </div>
                <p className="font-serif italic text-2xl text-gray-800 mb-2">visualização de pdf</p>
                <p className="text-sm text-gray-400">clique para interagir ou baixar o arquivo</p>
             </div>

             <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4 backdrop-blur-sm">
                <button className="bg-white text-primary px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform">
                    <Eye size={16} /> visualizar
                </button>
                <button className="bg-primary text-white px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 hover:scale-105 transition-transform">
                    <Download size={16} /> baixar pdf
                </button>
             </div>
        </div>

        {/* Previous Reports List */}
        <h4 className="text-xl font-serif text-primary mb-6 border-b border-gray-100 pb-2">arquivo de relatórios</h4>
        <div className="grid md:grid-cols-3 gap-4">
            {['janeiro 2026', 'dezembro 2025', 'novembro 2025'].map((report, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-transparent hover:border-gray-200 hover:shadow-md transition-all cursor-pointer flex items-center group">
                    <div className="w-10 h-10 bg-red-50 rounded-lg flex items-center justify-center text-primary mr-3 group-hover:bg-primary group-hover:text-white transition-colors">
                        <FileText size={20} />
                    </div>
                    <div>
                        <p className="font-medium text-gray-800 text-sm">{report}</p>
                        <p className="text-xs text-gray-400">PDF • {2.4 + i * 0.5} MB</p>
                    </div>
                    <ArrowRight size={16} className="ml-auto text-gray-300 group-hover:text-primary transition-colors" />
                </div>
            ))}
        </div>
    </div>
  );

  const PlaceholderView = ({ title }: { title: string }) => (
    <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-400 animate-fade-in">
        <FileText size={48} className="mb-4 opacity-20" />
        <h3 className="text-xl font-serif italic text-primary">{title}</h3>
        <p className="text-sm mt-2">conteúdo em desenvolvimento</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-gray-800 font-sans flex flex-col">
      {/* Client Header */}
      <header className="px-6 py-6 md:px-12 border-b border-gray-100">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
             <button onClick={onLogout} className="text-4xl font-serif italic text-primary hover:opacity-80 transition-opacity">
                elã
             </button>
             <nav className="hidden md:flex gap-8 text-sm font-medium">
                <a href="#" className="text-primary hover:text-red-700">sobre nós</a>
                <a href="#" className="text-primary hover:text-red-700">arquitetura de serviços</a>
                <a href="#" className="text-primary hover:text-red-700">sugestões?</a>
                <a href="#" className="text-primary font-bold">área do cliente</a>
             </nav>
             <button className="md:hidden text-primary">
                <Menu size={24} />
             </button>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto w-full px-6 md:px-12 pb-12">
        {/* Title Section */}
        <div className="flex flex-col md:flex-row justify-between items-end mt-8 mb-10 border-b border-gray-100 pb-8">
            <div>
                <h1 className="text-4xl font-serif text-primary leading-none mb-1">área do</h1>
                <h1 className="text-4xl font-serif text-primary leading-none">cliente</h1>
            </div>
            <div className="flex flex-col items-end mt-4 md:mt-0">
                <div className="text-primary font-sans font-bold text-4xl tracking-tight lowercase">jescri</div>
                <div className="text-primary text-xs tracking-[0.3em] uppercase font-bold mt-1">lingerie</div>
            </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex overflow-x-auto pb-2 mb-8 gap-8 text-sm font-medium scrollbar-hide">
            {[
                { id: 'retrospective', label: 'retrospectiva anual' },
                { id: 'reports', label: 'relatórios' },
                { id: 'calendar', label: 'calendário' },
                { id: 'social', label: 'social media' },
                { id: 'material', label: 'material' },
                { id: 'alignment', label: 'alinhamento' },
            ].map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ClientTab)}
                    className={`whitespace-nowrap pb-1 transition-colors ${
                        activeTab === tab.id 
                        ? 'text-primary font-bold border-b-2 border-primary' 
                        : 'text-gray-500 hover:text-primary'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </nav>

        {/* Content Area */}
        <div className="min-h-[500px]">
            {activeTab === 'retrospective' && <RetrospectiveView />}
            {activeTab === 'calendar' && <CalendarView />}
            {activeTab === 'reports' && <ReportsView />}
            {['social', 'material', 'alignment'].includes(activeTab) && (
                <PlaceholderView title={activeTab} />
            )}
        </div>

      </main>

      {/* Footer */}
      <footer className="px-6 py-8 md:px-12 border-t border-gray-100 mt-auto">
         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-sm font-medium text-primary">
                © 2026 todos os direitos reservados
            </div>
            <div className="flex gap-8 text-primary">
                <a href="#" className="hover:opacity-80"><MessageCircle size={24} /></a>
                <a href="#" className="hover:opacity-80"><Instagram size={24} /></a>
                <a href="#" className="hover:opacity-80"><Linkedin size={24} /></a>
            </div>
         </div>
      </footer>
    </div>
  );
};