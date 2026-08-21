@echo off
REM Windows PowerShell'de `npm` PATH'te yoksa bu dosya Node.js dizinini ekler.
set "PATH=C:\Program Files\nodejs;%PATH%"
where npm >nul 2>&1
if errorlevel 1 (
  echo Node.js bulunamadi. https://nodejs.org adresinden LTS kurun.
  exit /b 1
)
npm run dev
