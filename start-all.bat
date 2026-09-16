@echo off
title NyaySetu AI Launcher
echo ===================================================
echo   Launching NyaySetu AI (Backend + Frontend)
echo ===================================================
start "NyaySetu Backend" cmd /k "cd /d %~dp0backend && python run.py"
start "NyaySetu Frontend" cmd /k "cd /d %~dp0frontend && npm run dev"
echo Both servers started in separate windows!
echo Backend:  http://localhost:8000
echo Frontend: http://localhost:5173
