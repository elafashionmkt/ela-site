import React from 'react';
import { Instagram, Linkedin, MessageCircle } from '../components/Icons';

interface LoginProps {
  onLogin: () => void;
  onBack: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onBack }) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onLogin();
  };

  return (
    <div className="min-h-screen bg-primary flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="px-6 py-8 md:px-12 flex justify-between items-center z-10 text-white">
        <button onClick={onBack} className="text-5xl font-serif italic hover:opacity-90">elã</button>
        <nav className="flex gap-6 text-sm font-medium">
          <button onClick={onBack} className="hover:opacity-80 transition-opacity">início</button>
          <span className="font-bold">área do cliente</span>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex flex-col items-center justify-center px-4 z-10 w-full max-w-md mx-auto">
        <h1 className="font-serif text-5xl text-white mb-10 text-center italic">
            área do cliente
        </h1>
        
        <div className="bg-white w-full rounded-2xl p-8 shadow-2xl animate-fade-in-up">
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <input 
                type="text" 
                placeholder="seu instagram"
                className="w-full bg-gray-100 text-primary placeholder-primary/60 font-medium py-4 px-6 rounded-lg border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-center outline-none"
              />
            </div>
            <div>
              <input 
                type="password" 
                placeholder="senha do onboarding"
                className="w-full bg-gray-100 text-primary placeholder-primary/60 font-medium py-4 px-6 rounded-lg border-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all text-center outline-none"
              />
            </div>
            <button 
              type="submit"
              className="w-full bg-primary text-white font-bold py-4 rounded-lg hover:bg-primary-dark hover:shadow-lg transform hover:-translate-y-0.5 transition-all mt-2"
            >
              fazer login
            </button>
          </form>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-8 md:px-12 flex flex-col-reverse md:flex-row justify-between items-center gap-6 z-10 text-white">
        <div className="text-xs font-light opacity-80">
            © 2026 todos os direitos reservados
        </div>
        <div className="flex gap-8 items-center">
            <a href="#" className="hover:opacity-80 transition-opacity p-2 border-2 border-white rounded-full"><MessageCircle size={20} /></a>
            <a href="#" className="hover:opacity-80 transition-opacity p-2 border-2 border-white rounded-lg"><Instagram size={20} /></a>
            <a href="#" className="hover:opacity-80 transition-opacity p-2 bg-white text-primary rounded-sm"><Linkedin size={20} /></a>
        </div>
      </footer>
    </div>
  );
};