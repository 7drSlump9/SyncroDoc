@echo off
setlocal enabledelayedexpansion
echo ======================================
echo    SyncroDoc - Avvio Automatico
echo ======================================
echo.

echo [1/4] Controllo e chiusura processi sulle porte 5000 e 3001...
echo.

REM Termina tutti i processi node.exe in esecuzione per essere sicuri
echo Terminazione di tutti i processi Node.js in esecuzione...
taskkill /IM node.exe /F >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo - Processi Node.js terminati
) else (
    echo - Nessun processo Node.js trovato
)

REM Attendi un momento per permettere ai processi di chiudersi
timeout /t 2 /nobreak >nul

REM Verifica e termina eventuali processi ancora sulle porte specifiche
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":5000" ^| findstr "LISTENING" 2^>nul') do (
    set "PID=%%a"
    if not "!PID!"=="" (
        echo Terminazione forzata processo sulla porta 5000 (PID: !PID!^)
        taskkill /PID !PID! /F >nul 2>&1
    )
)

for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3001" ^| findstr "LISTENING" 2^>nul') do (
    set "PID=%%a"
    if not "!PID!"=="" (
        echo Terminazione forzata processo sulla porta 3001 (PID: !PID!^)
        taskkill /PID !PID! /F >nul 2>&1
    )
)

echo.
echo [2/4] Porte liberate!
echo.
timeout /t 2 >nul

echo [3/4] Avvio Backend e Frontend...
echo.
echo Backend: http://localhost:3001
echo Frontend: http://localhost:5000
echo.
echo NOTA: Tieni questa finestra aperta per mantenere l'app in esecuzione
echo      Premi CTRL+C per fermare entrambi i server
echo.
echo ======================================
echo.

REM Avvia sia backend che frontend contemporaneamente
npm run dev

