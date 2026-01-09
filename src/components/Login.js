import { useState, useEffect } from 'react';
import { authService } from '../services/authService';
import './Login.css';

/**
 * SyncroDoc - Login Component
 * 
 * Componente di autenticazione per SyncroDoc.
 * Gestisce l'accesso e la registrazione degli utenti al sistema
 * di sincronizzazione dei file nel cloud.
 * 
 * Features:
 * - Login con credenziali (username o email)
 * - Registrazione nuovi utenti
 * - Autenticazione JWT con Bearer token
 * - Persistenza della sessione
 * - Gestione errori appropriata
 */
function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [email, setEmail] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Controlla se l'utente è già loggato
    const savedToken = authService.getToken();
    const savedUser = authService.getUser();
    
    if (savedToken && savedUser) {
      setIsLoggedIn(true);
      setUser(savedUser);
      setToken(savedToken);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !password) {
        throw new Error('Per favore riempi tutti i campi');
      }

      const response = await authService.login(username, password);
      
      setToken(response.token);
      setUser(response.user);
      setIsLoggedIn(true);
      setUsername('');
      setPassword('');
      
      // Notifica al componente padre che il login è stato effettuato
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!username || !email || !password || !confirmPassword) {
        throw new Error('Per favore riempi tutti i campi');
      }

      if (password !== confirmPassword) {
        throw new Error('Le password non coincidono');
      }

      if (password.length < 6) {
        throw new Error('La password deve avere almeno 6 caratteri');
      }

      const response = await authService.register(username, email, password, confirmPassword);
      
      setToken(response.token);
      setUser(response.user);
      setIsLoggedIn(true);
      setUsername('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setIsRegister(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
    setIsLoggedIn(false);
    setUser(null);
    setToken('');
    setIsRegister(false);
  };

  const toggleRegister = () => {
    setIsRegister(!isRegister);
    setError('');
    setUsername('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
  };

  if (isLoggedIn && user) {
    return (
      <div className="login-container">
        <div className="login-box success">
          <h2>Benvenuto! 🎉</h2>
          <p>Accesso effettuato come: <strong>{user.username}</strong></p>
          <div className="user-info">
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>ID:</strong> {user.id}</p>
          </div>
          <div className="token-section">
            <p><strong>Token JWT:</strong></p>
            <div className="token-box">
              <code>{token.substring(0, 50)}...</code>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-box">
        <h1>{isRegister ? 'Registrazione' : 'SyncroDoc'}</h1>
        
        <form onSubmit={isRegister ? handleRegister : handleLogin}>
          <div className="form-group">
            <label htmlFor="username">Username o Email:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Inserisci username o email"
              disabled={isLoading}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="email">Email:</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Inserisci la tua email"
                disabled={isLoading}
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Inserisci la tua password"
              disabled={isLoading}
            />
          </div>

          {isRegister && (
            <div className="form-group">
              <label htmlFor="confirmPassword">Conferma Password:</label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Conferma la tua password"
                disabled={isLoading}
              />
            </div>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="login-btn" disabled={isLoading}>
            {isLoading ? 'Caricamento...' : (isRegister ? 'Registrati' : 'Accedi')}
          </button>
        </form>

        <div className="toggle-auth">
          <p>
            {isRegister ? 'Hai già un account? ' : 'Non hai un account? '}
            <button 
              type="button" 
              className="toggle-btn" 
              onClick={toggleRegister}
              disabled={isLoading}
            >
              {isRegister ? 'Accedi' : 'Registrati'}
            </button>
          </p>
        </div>


      </div>
    </div>
  );
}

export default Login;
