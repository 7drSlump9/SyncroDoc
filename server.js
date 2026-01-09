/**
 * SyncroDoc - Backend Server
 * 
 * Server backend per l'applicazione SyncroDoc di sincronizzazione
 * e gestione di file nel cloud.
 * 
 * Features:
 * - Autenticazione JWT con Bearer token
 * - Gestione utenti con SQLite
 * - Crittografia password con bcryptjs
 * - API REST per login, registrazione e gestione sessioni
 * 
 * @author SyncroDoc Team
 * @version 1.0.0
 */

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key_change_in_production';

// Middleware
app.use(express.json());
app.use(cors());

// Database setup - SQLite per memorizzare i dati degli utenti
const db = new sqlite3.Database('./users.db', (err) => {
  if (err) {
    console.error('Errore nell\'apertura del database:', err);
  } else {
    console.log('Connesso al database SQLite');
    initializeDatabase();
  }
});

// Inizializza il database
function initializeDatabase() {
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `, (err) => {
    if (err) {
      console.error('Errore nella creazione della tabella:', err);
    } else {
      console.log('Tabella users pronta');
      seedDatabase();
    }
  });
}

// Popola il database con utenti di test
function seedDatabase() {
  db.get('SELECT COUNT(*) as count FROM users', (err, row) => {
    if (row && row.count === 0) {
      const testPassword = 'password123';
      const hashedPassword = bcrypt.hashSync(testPassword, 10);
      
      db.run(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        ['testuser', 'test@example.com', hashedPassword],
        (err) => {
          if (err) {
            console.error('Errore nell\'inserimento utente di test:', err);
          } else {
            console.log('Utente di test creato - username: testuser, password: password123');
          }
        }
      );
    }
  });
}

// Middleware per verificare il token JWT
function verifyToken(req, res, next) {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Token non fornito' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: 'Token non valido' });
    }
    req.user = decoded;
    next();
  });
}

// Route: Registrazione
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, confirmPassword } = req.body;

  // Validazione
  if (!username || !email || !password || !confirmPassword) {
    return res.status(400).json({ message: 'Tutti i campi sono obbligatori' });
  }

  if (password !== confirmPassword) {
    return res.status(400).json({ message: 'Le password non coincidono' });
  }

  if (password.length < 6) {
    return res.status(400).json({ message: 'La password deve avere almeno 6 caratteri' });
  }

  // Cripta la password
  const hashedPassword = bcrypt.hashSync(password, 10);

  // Inserisci l'utente nel database
  db.run(
    'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
    [username, email, hashedPassword],
    function(err) {
      if (err) {
        if (err.message.includes('UNIQUE constraint failed')) {
          return res.status(400).json({ message: 'Username o email già in uso' });
        }
        console.error('Errore nel registro:', err);
        return res.status(500).json({ message: 'Errore nel server' });
      }

      // Genera il token JWT
      const token = jwt.sign(
        { id: this.lastID, username, email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.status(201).json({
        message: 'Utente registrato con successo',
        token,
        user: { id: this.lastID, username, email, created_at: new Date().toISOString() }
      });
    }
  );
});

// Route: Login - Supporta login sia con username che con email
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;

  // Validazione
  if (!username || !password) {
    return res.status(400).json({ message: 'Username/Email e password sono obbligatori' });
  }

  // Cerca l'utente nel database per username O email
  db.get(
    'SELECT * FROM users WHERE username = ? OR email = ?',
    [username, username],
    (err, user) => {
      if (err) {
        console.error('Errore nel database:', err);
        return res.status(500).json({ message: 'Errore nel server' });
      }

      if (!user) {
        return res.status(401).json({ message: 'Username/Email o password non validi' });
      }

      // Confronta le password
      const isPasswordValid = bcrypt.compareSync(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: 'Username/Email o password non validi' });
      }

      // Genera il token JWT
      const token = jwt.sign(
        { id: user.id, username: user.username, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        message: 'Login effettuato con successo',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          created_at: user.created_at
        }
      });
    }
  );
});

// Route: Verifica il token
app.post('/api/auth/verify', verifyToken, (req, res) => {
  res.json({
    message: 'Token valido',
    user: req.user
  });
});

// Route: Logout (semplice conferma)
app.post('/api/auth/logout', verifyToken, (req, res) => {
  res.json({ message: 'Logout effettuato con successo' });
});

// Route: Ottieni i dettagli dell'utente
app.get('/api/auth/profile', verifyToken, (req, res) => {
  res.json({
    user: req.user
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Avvia il server
app.listen(PORT, () => {
  console.log(`Server in esecuzione su http://localhost:${PORT}`);
});
