@echo off
chcp 65001 >nul
title Physio3D Pro - Kurulum
cd /d "%~dp0"

echo.
echo  Physio3D Pro - bagimliliklar kuruluyor...
echo.

where node >nul 2>&1
if errorlevel 1 (
  echo  [HATA] Node.js bulunamadi. https://nodejs.org
  pause
  exit /b 1
)

call npm install
if errorlevel 1 (
  echo  [HATA] Kurulum basarisiz.
  pause
  exit /b 1
)

echo.
echo  Kurulum tamam. Simdi baslat.bat dosyasina cift tiklayin.
echo.
pause
