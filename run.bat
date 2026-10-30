@echo off
title LandslideGuard AI Launcher
echo ========================================================
echo   Starting LandslideGuard AI (FastAPI + React Vite)
echo ========================================================
echo.

echo [1/2] Starting Backend Server (Port 8000)...
start "LandslideGuard Backend (Port 8000)" cmd /k "cd /d %~dp0backend && .venv\Scripts\activate && uvicorn app:app --host 127.0.0.1 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [2/2] Starting Frontend Server (Port 5173)...
start "LandslideGuard Frontend (Port 5173)" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo ========================================================
echo   Both services started successfully!
echo   Frontend: http://localhost:5173
echo   Backend:  http://127.0.0.1:8000
echo   API Docs: http://127.0.0.1:8000/docs
echo ========================================================
echo.
pause

