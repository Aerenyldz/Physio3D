@echo off
chcp 65001 >nul
title Physio3D Pro
cd /d "%~dp0"

echo.
echo  ========================================
echo   Physio3D Pro baslatiliyor...
echo  ========================================
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  [HATA] Node.js bulunamadi.
  echo  https://nodejs.org adresinden kurun, sonra tekrar deneyin.
  echo.
  pause
  exit /b 1
)

if not exist "index.html" (
  echo  [HATA] index.html bulunamadi. Yanlis klasorde olabilirsiniz.
  echo  Klasor: %cd%
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo  Ilk kurulum: paketler yukleniyor...
  call npm install
  if errorlevel 1 (
    echo  [HATA] npm install basarisiz.
    pause
    exit /b 1
  )
  echo.
)

REM Eski / yanlis surec port 3000'i tutuyorsa serbest birak
echo  Port 3000 kontrol ediliyor...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr ":3000" ^| findstr "LISTENING"') do (
  echo  Eski surec kapatiliyor PID=%%a
  taskkill /F /PID %%a >nul 2>&1
)
timeout /t 1 /nobreak >nul

echo  Vite baslatiliyor...
echo  Acilinca tarayicide: http://localhost:3000
echo  Durdurmak icin bu pencerede Ctrl+C basin.
echo.

REM Tarayiciyi Vite hazir olunca ac (erken acilis = Cannot GET /)
start "" cmd /c "timeout /t 3 /nobreak >nul & start http://localhost:3000/"

call npm run dev -- --host 127.0.0.1 --port 3000 --strictPort

echo.
echo  Sunucu kapandi.
pause
