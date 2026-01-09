import { useState } from 'react';
import { authService } from '../services/authService';
import './Dashboard.css';

/**
 * SyncroDoc - Dashboard Component
 * 
 * Pagina principale dopo il login che mostra i dati dell'utente
 * e informazioni di sincronizzazione dei file nel cloud.
 */
function Dashboard() {
  const [user, setUser] = useState(() => authService.getUser());
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await authService.logout();
      // Refresh della pagina per tornare al login
      window.location.reload();
    } catch (error) {
      console.error('Errore durante il logout:', error);
      setIsLoggingOut(false);
    }
  };

  const formatDate = (dateString) => {
    const options = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      timeZone: 'Europe/Rome'
    };
    return new Date(dateString).toLocaleDateString('it-IT', options);
  };

  if (!user) {
    return (
      <div className="dashboard-container">
        <div className="error-box">
          <h2>Errore</h2>
          <p>Dati utente non disponibili</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>SyncroDoc Dashboard</h1>
          <p className="subtitle">Sincronizzazione file nel cloud</p>
        </div>
        <button className="logout-btn" onClick={handleLogout} disabled={isLoggingOut}>
          {isLoggingOut ? 'Disconnessione...' : 'Logout'}
        </button>
      </div>

      <div className="dashboard-content">
        <div className="user-card">
          <div className="card-header">
            <h2>Profilo Utente</h2>
            <span className="badge">✓ Autenticato</span>
          </div>
          
          <div className="user-details">
            <div className="detail-group">
              <label>Nome Utente</label>
              <div className="detail-value">{user.username}</div>
            </div>

            <div className="detail-group">
              <label>Email</label>
              <div className="detail-value">{user.email}</div>
            </div>

            <div className="detail-group">
              <label>ID Utente</label>
              <div className="detail-value code">{user.id}</div>
            </div>

            {user.created_at && (
              <div className="detail-group">
                <label>Data di Registrazione</label>
                <div className="detail-value">{formatDate(user.created_at)}</div>
              </div>
            )}
          </div>
        </div>

        <div className="info-cards">
          <div className="info-card">
            <div className="icon">📁</div>
            <h3>File Sincronizzati</h3>
            <p className="number">0</p>
            <p className="status">In attesa di configurazione</p>
          </div>

          <div className="info-card">
            <div className="icon">☁️</div>
            <h3>Cloud Storage</h3>
            <p className="number">0 GB</p>
            <p className="status">Nessun file sincronizzato</p>
          </div>

          <div className="info-card">
            <div className="icon">🔄</div>
            <h3>Ultimo Sync</h3>
            <p className="number">--:--</p>
            <p className="status">Mai sincronizzato</p>
          </div>
        </div>

        <div className="token-card">
          <h3>Token JWT</h3>
          <p className="token-info">Il tuo token di autenticazione è memorizzato in modo sicuro nel browser.</p>
          <div className="token-status">
            <span className="status-badge active">✓ Attivo</span>
            <p>Scadenza: 24 ore</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
