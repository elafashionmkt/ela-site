import React, { useState, useEffect } from 'react';
import { PublicHome } from './pages/PublicHome';
import { Login } from './pages/Login';
import { ClientDashboard } from './pages/ClientDashboard';
import { ViewState } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>('landing');

  // Simple animation or loading effect could go here
  useEffect(() => {
    // Scroll to top on view change
    window.scrollTo(0, 0);
  }, [view]);

  return (
    <div className="antialiased selection:bg-primary selection:text-white">
      {view === 'landing' && (
        <PublicHome onNavigateLogin={() => setView('login')} />
      )}
      
      {view === 'login' && (
        <Login 
          onLogin={() => setView('client-dashboard')} 
          onBack={() => setView('landing')} 
        />
      )}

      {view === 'client-dashboard' && (
        <ClientDashboard onLogout={() => setView('landing')} />
      )}
    </div>
  );
};

export default App;