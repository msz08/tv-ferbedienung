@echo off
setlocal
title Television Controller
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo   Node.js is not installed.
  echo   Please install it from https://nodejs.org/ ^(version 18 or newer^), then run this again.
  echo.
  pause
  exit /b 1
)

if not exist "server\node_modules" (
  echo   Installing server dependencies...
  call npm --prefix server install || goto :error
)

if not exist "web\node_modules" (
  echo   Installing web dependencies...
  call npm --prefix web install || goto :error
)

if not exist "web\dist\index.html" (
  echo   Building the web interface...
  call npm --prefix web run build || goto :error
)

echo.
echo   Starting Television Controller at http://localhost:3000
echo   Close this window to stop the server.
echo.

rem Open the browser once the server has had a moment to start.
start "" cmd /c "timeout /t 3 /nobreak >nul & start "" http://localhost:3000"

node server\index.js
goto :eof

:error
echo.
echo   Something went wrong during setup. See the messages above.
echo.
pause
exit /b 1
