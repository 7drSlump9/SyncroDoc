Write-Host "======================================" -ForegroundColor Cyan
Write-Host "   SyncroDoc - Avvio Automatico" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/4] Controllo e chiusura processi sulle porte 5000 e 3001..." -ForegroundColor Yellow
Write-Host ""

# Termina tutti i processi Node.js in esecuzione per essere sicuri
Write-Host "Terminazione di tutti i processi Node.js in esecuzione..." -ForegroundColor White
$nodeProcesses = Get-Process -Name node -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    $nodeProcesses | Stop-Process -Force -ErrorAction SilentlyContinue
    Write-Host "- Processi Node.js terminati ($($nodeProcesses.Count) processi)" -ForegroundColor Green
} else {
    Write-Host "- Nessun processo Node.js trovato" -ForegroundColor Gray
}

# Attendi un momento per permettere ai processi di chiudersi
Start-Sleep -Seconds 2

# Funzione per terminare processi su una porta specifica
function Stop-ProcessOnPort {
    param($port)
    
    $connections = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Where-Object { $_.State -eq "Listen" }
    
    foreach ($conn in $connections) {
        $processId = $conn.OwningProcess
        if ($processId) {
            Write-Host "Terminazione forzata processo sulla porta $port (PID: $processId)" -ForegroundColor Yellow
            Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
        }
    }
}

# Verifica e termina eventuali processi ancora sulle porte specifiche
Stop-ProcessOnPort -port 5000
Stop-ProcessOnPort -port 3001

Write-Host ""
Write-Host "[2/4] Porte liberate!" -ForegroundColor Green
Write-Host ""
Start-Sleep -Seconds 2

Write-Host "[3/4] Avvio Backend e Frontend..." -ForegroundColor Yellow
Write-Host ""
Write-Host "Backend: http://localhost:3001" -ForegroundColor Cyan
Write-Host "Frontend: http://localhost:5000" -ForegroundColor Cyan
Write-Host ""
Write-Host "NOTA: Tieni questa finestra aperta per mantenere l'app in esecuzione" -ForegroundColor White
Write-Host "      Premi CTRL+C per fermare entrambi i server" -ForegroundColor White
Write-Host ""
Write-Host "======================================" -ForegroundColor Cyan
Write-Host ""

# Avvia sia backend che frontend contemporaneamente
npm run dev
