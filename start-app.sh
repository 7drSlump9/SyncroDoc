#!/bin/bash

echo "======================================"
echo "   SyncroDoc - Avvio Automatico"
echo "======================================"
echo ""

echo "[1/4] Controllo e chiusura processi sulle porte 5000 e 3001..."
echo ""

# Termina tutti i processi Node.js in esecuzione per essere sicuri
echo "Terminazione di tutti i processi Node.js in esecuzione..."
if pkill -9 node 2>/dev/null; then
    echo "- Processi Node.js terminati"
else
    echo "- Nessun processo Node.js trovato"
fi

# Attendi un momento per permettere ai processi di chiudersi
sleep 2

# Funzione per terminare processi su una porta specifica
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ ! -z "$pid" ]; then
        echo "Terminazione forzata processo sulla porta $port (PID: $pid)"
        kill -9 $pid 2>/dev/null
    fi
}

# Verifica e termina eventuali processi ancora sulle porte specifiche
kill_port 5000
kill_port 3001

echo ""
echo "[2/4] Porte liberate!"
echo ""
sleep 2

echo "[3/4] Avvio Backend e Frontend..."
echo ""
echo "Backend: http://localhost:3001"
echo "Frontend: http://localhost:5000"
echo ""
echo "NOTA: Tieni questa finestra aperta per mantenere l'app in esecuzione"
echo "      Premi CTRL+C per fermare entrambi i server"
echo ""
echo "======================================"
echo ""

# Avvia sia backend che frontend contemporaneamente
npm run dev
