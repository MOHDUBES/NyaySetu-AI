@echo off
title NyaySetu AI - Backend Server
echo ===================================================
echo   Starting NyaySetu AI Backend (http://localhost:8000)
echo ===================================================
cd /d "%~dp0backend"
python -m uvicorn app.main:app --reload --port 8000
