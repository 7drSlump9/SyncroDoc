import { useState, useEffect } from 'react';
import './App.css';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import { authService } from './services/authService';

/**
 * SyncroDoc - Cloud File Synchronization Application
 * 
 * Componente principale dell'applicazione per la sincronizzazione
 * e la gestione di file nel cloud.
 * 
 * Gestisce il routing tra la pagina di login e la dashboard
 * in base allo stato di autenticazione dell'utente.
 */
function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verifica lo stato di autenticazione all'avvio
    const checkAuth = async () => {
      const isAuth = authService.isAuthenticated();
      if (isAuth) {
        // Verifica che il token sia ancora valido
        const isValid = await authService.verify();
        setIsLoggedIn(isValid);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  const handleLoginSuccess = () => {
    setIsLoggedIn(true);
  };

  if (isLoading) {
    return (
      <div className="App loading">
        <div className="loader"></div>
        <p>Caricamento...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {isLoggedIn ? (
        <Dashboard />
      ) : (
        <Login onLoginSuccess={handleLoginSuccess} />
      )}
    </div>
  );
}

export default App;
