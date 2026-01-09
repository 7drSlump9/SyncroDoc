# 🚀 Come Avviare SyncroDoc

## Metodi di Avvio

Hai 3 modi per avviare l'applicazione completa (Backend + Frontend):

### 1️⃣ Script Automatico (CONSIGLIATO) ⭐

**Opzione A - PowerShell (Consigliato):**

```bash
npm run start-app
```

oppure

```powershell
.\start-app.ps1
```

**Opzione B - Batch File:**

```cmd
start-app.bat
```

**Cosa fa lo script automatico:**

- ✅ Controlla se le porte 5000 e 3001 sono occupate
- ✅ Termina automaticamente eventuali processi esistenti
- ✅ Avvia sia il Backend che il Frontend contemporaneamente
- ✅ Mostra messaggi colorati e informativi

---

### 2️⃣ Avvio Manuale Simultaneo

```bash
npm run dev
```

Questo comando usa `concurrently` per avviare entrambi i server contemporaneamente.

**NOTA:** Se le porte sono già occupate, dovrai prima fermare i processi manualmente.

---

### 3️⃣ Avvio Manuale Separato

**Terminale 1 - Backend:**

```bash
node server.js
# oppure
npm run server
```

**Terminale 2 - Frontend:**

```bash
npm start
```

---

## 🔍 Verificare che Funzioni

Una volta avviata l'app:

1. **Backend:** http://localhost:3001

   - Test: http://localhost:3001/api/health (dovrebbe rispondere "OK")

2. **Frontend:** http://localhost:5000
   - Dovresti vedere la pagina di Login di SyncroDoc

---

## 🛑 Fermare l'Applicazione

- Premi `CTRL + C` nel terminale dove hai avviato l'app
- Oppure chiudi la finestra del terminale

---

## ⚠️ Risoluzione Problemi

### Errore: "Porta già in uso"

Lo script automatico risolve questo problema automaticamente.

Se usi `npm run dev` manualmente e ricevi questo errore:

**PowerShell:**

```powershell
# Trova processi sulle porte
Get-NetTCPConnection -LocalPort 5000 | Select-Object OwningProcess
Get-NetTCPConnection -LocalPort 3001 | Select-Object OwningProcess

# Termina processo (sostituisci PID con l'ID del processo)
Stop-Process -Id PID -Force
```

**CMD:**

```cmd
# Trova processi
netstat -ano | findstr :5000
netstat -ano | findstr :3001

# Termina processo (sostituisci PID con l'ID del processo)
taskkill /PID PID /F
```

---

## 📝 Note

- Il Frontend (React) si riavvia automaticamente quando modifichi i file
- Il Backend (Node.js) richiede un riavvio manuale dopo le modifiche (usa `CTRL+C` e riavvia)
- Per il deployment in produzione, usa `npm run build` per creare la versione ottimizzata
