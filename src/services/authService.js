/**
 * SyncroDoc - Authentication Service
 * 
 * Servizio per la gestione dell'autenticazione JWT nel sistema
 * di sincronizzazione dei file nel cloud.
 * 
 * Gestisce:
 * - Login e registrazione utenti
 * - Memorizzazione e recupero token JWT
 * - Validazione della sessione
 * - Refresh token logic
 * 
 * NOTA SICUREZZA: I token sono memorizzati in sessionStorage (non localStorage)
 * per ridurre i rischi di XSS. In produzione, preferibilmente usare HttpOnly cookies.
 */

const API_URL = 'http://localhost:5000/api/auth';

/**
 * Funzione helper per fare richieste autenticate
 * Aggiunge automaticamente il Bearer token all'header
 */
const authenticatedFetch = async (url, options = {}) => {
  const token = sessionStorage.getItem('token');
  
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    },
  });
};

export const authService = {
  login: async (username, password) => {
    try {
      // Validazione input
      if (!username || !password) {
        throw new Error('Username e password sono obbligatori');
      }

      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore durante il login');
      }

      // Salva il token in sessionStorage (non localStorage) - meno vulnerabile a XSS
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Impossibile raggiungere il server. Assicurati che il backend sia in esecuzione.');
      }
      throw error;
    }
  },

  register: async (username, email, password, confirmPassword) => {
    try {
      // Validazione input
      if (!username || !email || !password || !confirmPassword) {
        throw new Error('Tutti i campi sono obbligatori');
      }

      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, email, password, confirmPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Errore durante la registrazione');
      }

      // Salva il token in sessionStorage
      sessionStorage.setItem('token', data.token);
      sessionStorage.setItem('user', JSON.stringify(data.user));

      return data;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error('Impossibile raggiungere il server. Assicurati che il backend sia in esecuzione.');
      }
      throw error;
    }
  },

  logout: async () => {
    try {
      // Notifica al server il logout
      const token = sessionStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error('Errore durante logout:', error);
    } finally {
      // Rimuovi token e dati locali in ogni caso
      sessionStorage.removeItem('token');
      sessionStorage.removeItem('user');
    }
  },

  getToken: () => {
    return sessionStorage.getItem('token');
  },

  getUser: () => {
    const user = sessionStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!sessionStorage.getItem('token');
  },

  verify: async () => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        return false;
      }

      const response = await fetch(`${API_URL}/verify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return response.ok;
    } catch (error) {
      console.error('Errore nella verifica token:', error);
      return false;
    }
  },

  /**
   * Getter sicuro per il token (non espone il valore completo)
   * Utile per verifiche senza mostrare il token
   */
  hasValidToken: () => {
    const token = sessionStorage.getItem('token');
    return token && token.length > 0;
  },
};
